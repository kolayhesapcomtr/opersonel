import prisma from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';

export interface CreateDepartmentDto {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

export class DepartmentService {
  /**
   * Get all departments for a tenant
   */
  async findAll(tenantId: string) {
    return await prisma.department.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            position: {
              select: {
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            employees: true,
            children: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get department hierarchy (tree structure)
   */
  async getHierarchy(tenantId: string) {
    // Get all departments
    const departments = await this.findAll(tenantId);

    // Build tree structure
    const departmentMap = new Map();
    const rootDepartments: any[] = [];

    // First pass: create map
    departments.forEach((dept) => {
      departmentMap.set(dept.id, { ...dept, children: [] });
    });

    // Second pass: build tree
    departments.forEach((dept) => {
      const deptNode = departmentMap.get(dept.id);
      if (dept.parentId) {
        const parent = departmentMap.get(dept.parentId);
        if (parent) {
          parent.children.push(deptNode);
        }
      } else {
        rootDepartments.push(deptNode);
      }
    });

    return rootDepartments;
  }

  /**
   * Get department by ID
   */
  async findById(tenantId: string, id: string) {
    const department = await prisma.department.findFirst({
      where: {
        id,
        tenantId,
        isActive: true,
      },
      include: {
        parent: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            email: true,
            phone: true,
            position: {
              select: {
                title: true,
              },
            },
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
            _count: {
              select: {
                employees: true,
              },
            },
          },
        },
        employees: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            email: true,
            position: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    return department;
  }

  /**
   * Create new department
   */
  async create(tenantId: string, data: CreateDepartmentDto) {
    // Check if code already exists
    if (data.code) {
      const existing = await prisma.department.findFirst({
        where: {
          tenantId,
          code: data.code,
          isActive: true,
        },
      });
      if (existing) {
        throw new AppError('Department code already exists', 400);
      }
    }

    // Verify parent exists if provided
    if (data.parentId) {
      const parent = await this.findById(tenantId, data.parentId);
      if (!parent) {
        throw new AppError('Parent department not found', 404);
      }
    }

    // Verify manager exists if provided
    if (data.managerId) {
      const manager = await prisma.employee.findFirst({
        where: {
          id: data.managerId,
          tenantId,
          isActive: true,
        },
      });
      if (!manager) {
        throw new AppError('Manager not found', 404);
      }
    }

    return await prisma.department.create({
      data: {
        ...data,
        tenantId,
      },
      include: {
        parent: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Update department
   */
  async update(tenantId: string, id: string, data: UpdateDepartmentDto) {
    // Check if department exists
    await this.findById(tenantId, id);

    // If updating code, check uniqueness
    if (data.code) {
      const existing = await prisma.department.findFirst({
        where: {
          tenantId,
          code: data.code,
          id: { not: id },
          isActive: true,
        },
      });
      if (existing) {
        throw new AppError('Department code already exists', 400);
      }
    }

    // Check for circular reference in parent
    if (data.parentId) {
      if (data.parentId === id) {
        throw new AppError('Department cannot be its own parent', 400);
      }

      // Check if new parent is a descendant
      const isDescendant = await this.isDescendant(tenantId, id, data.parentId);
      if (isDescendant) {
        throw new AppError('Cannot set a descendant as parent', 400);
      }
    }

    return await prisma.department.update({
      where: { id },
      data,
      include: {
        parent: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Delete department (soft delete)
   */
  async delete(tenantId: string, id: string) {
    const department = await this.findById(tenantId, id);

    // Check if department has children
    if (department.children && department.children.length > 0) {
      throw new AppError('Cannot delete department with sub-departments', 400);
    }

    // Check if department has employees
    if (department.employees && department.employees.length > 0) {
      throw new AppError('Cannot delete department with employees', 400);
    }

    return await prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Check if potential parent is a descendant of current department
   */
  private async isDescendant(tenantId: string, departmentId: string, potentialParentId: string): Promise<boolean> {
    const potentialParent = await prisma.department.findFirst({
      where: { id: potentialParentId, tenantId },
      include: { parent: true },
    });

    if (!potentialParent) {
      return false;
    }

    if (potentialParent.parentId === departmentId) {
      return true;
    }

    if (potentialParent.parentId) {
      return this.isDescendant(tenantId, departmentId, potentialParent.parentId);
    }

    return false;
  }

  /**
   * Get department statistics
   */
  async getStats(tenantId: string, id: string) {
    const department = await this.findById(tenantId, id);

    const [
      totalEmployees,
      activeEmployees,
      subdepartments,
    ] = await Promise.all([
      prisma.employee.count({
        where: {
          departmentId: id,
          isActive: true,
        },
      }),
      prisma.employee.count({
        where: {
          departmentId: id,
          status: 'ACTIVE',
          isActive: true,
        },
      }),
      prisma.department.count({
        where: {
          parentId: id,
          isActive: true,
        },
      }),
    ]);

    return {
      department,
      totalEmployees,
      activeEmployees,
      subdepartments,
    };
  }
}

export default new DepartmentService();
