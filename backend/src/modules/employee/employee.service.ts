import prisma from '../../database/prisma';
import { EmploymentType, EmploymentStatus, Gender, MaritalStatus } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationalId?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  employeeNumber: string;
  hireDate: string;
  employmentType: EmploymentType;
  departmentId: string;
  positionId: string;
  managerId?: string;
  salary?: number;
  currency?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: EmploymentStatus;
  terminationDate?: string;
}

export interface EmployeeFilters {
  departmentId?: string;
  positionId?: string;
  status?: EmploymentStatus;
  employmentType?: EmploymentType;
  search?: string;
}

export class EmployeeService {
  /**
   * Get all employees for a tenant with filters
   */
  async findAll(tenantId: string, filters?: EmployeeFilters) {
    const where: any = {
      tenantId,
      isActive: true,
    };

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters?.positionId) {
      where.positionId = filters.positionId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.employmentType) {
      where.employmentType = filters.employmentType;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { employeeNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.employee.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
            level: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });
  }

  /**
   * Get employee by ID
   */
  async findById(tenantId: string, id: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        tenantId,
        isActive: true,
      },
      include: {
        department: true,
        position: true,
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
        directReports: {
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
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employee;
  }

  /**
   * Get employee by employee number
   */
  async findByEmployeeNumber(tenantId: string, employeeNumber: string) {
    return await prisma.employee.findFirst({
      where: {
        tenantId,
        employeeNumber,
        isActive: true,
      },
    });
  }

  /**
   * Create new employee
   */
  async create(tenantId: string, data: CreateEmployeeDto) {
    // Check if employee number already exists
    const existing = await this.findByEmployeeNumber(tenantId, data.employeeNumber);
    if (existing) {
      throw new AppError('Employee number already exists', 400);
    }

    // Check if email already exists
    if (data.email) {
      const existingEmail = await prisma.employee.findFirst({
        where: {
          tenantId,
          email: data.email,
          isActive: true,
        },
      });
      if (existingEmail) {
        throw new AppError('Email already exists', 400);
      }
    }

    // Verify department exists
    const department = await prisma.department.findFirst({
      where: { id: data.departmentId, tenantId },
    });
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    // Verify position exists
    const position = await prisma.position.findFirst({
      where: { id: data.positionId, tenantId },
    });
    if (!position) {
      throw new AppError('Position not found', 404);
    }

    // Verify manager exists if provided
    if (data.managerId) {
      const manager = await this.findById(tenantId, data.managerId);
      if (!manager) {
        throw new AppError('Manager not found', 404);
      }
    }

    return await prisma.employee.create({
      data: {
        ...data,
        tenantId,
        hireDate: new Date(data.hireDate),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      include: {
        department: true,
        position: true,
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
   * Update employee
   */
  async update(tenantId: string, id: string, data: UpdateEmployeeDto) {
    // Check if employee exists
    await this.findById(tenantId, id);

    // If updating employee number, check uniqueness
    if (data.employeeNumber) {
      const existing = await prisma.employee.findFirst({
        where: {
          tenantId,
          employeeNumber: data.employeeNumber,
          id: { not: id },
          isActive: true,
        },
      });
      if (existing) {
        throw new AppError('Employee number already exists', 400);
      }
    }

    // If updating email, check uniqueness
    if (data.email) {
      const existing = await prisma.employee.findFirst({
        where: {
          tenantId,
          email: data.email,
          id: { not: id },
          isActive: true,
        },
      });
      if (existing) {
        throw new AppError('Email already exists', 400);
      }
    }

    return await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        terminationDate: data.terminationDate ? new Date(data.terminationDate) : undefined,
      },
      include: {
        department: true,
        position: true,
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
   * Terminate employee
   */
  async terminate(tenantId: string, id: string, terminationDate: string, _reason?: string) {
    await this.findById(tenantId, id);

    return await prisma.employee.update({
      where: { id },
      data: {
        status: EmploymentStatus.TERMINATED,
        terminationDate: new Date(terminationDate),
      },
    });
  }

  /**
   * Delete employee (soft delete)
   */
  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    return await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get employee statistics
   */
  async getStats(tenantId: string) {
    const [
      total,
      active,
      onLeave,
      byDepartment,
      byEmploymentType,
    ] = await Promise.all([
      prisma.employee.count({ where: { tenantId, isActive: true } }),
      prisma.employee.count({ where: { tenantId, status: EmploymentStatus.ACTIVE, isActive: true } }),
      prisma.employee.count({ where: { tenantId, status: EmploymentStatus.ON_LEAVE, isActive: true } }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        where: { tenantId, isActive: true },
        _count: true,
      }),
      prisma.employee.groupBy({
        by: ['employmentType'],
        where: { tenantId, isActive: true },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      onLeave,
      byDepartment,
      byEmploymentType,
    };
  }
}

export default new EmployeeService();
