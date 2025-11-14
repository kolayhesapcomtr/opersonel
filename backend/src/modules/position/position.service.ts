import prisma from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';

export interface CreatePositionDto {
  title: string;
  code?: string;
  description?: string;
  level?: string;
  departmentId: string;
}

export interface UpdatePositionDto extends Partial<CreatePositionDto> {}

export class PositionService {
  /**
   * Get all positions for a tenant
   */
  async findAll(tenantId: string, departmentId?: string) {
    const where: any = {
      tenantId,
      isActive: true,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    return await prisma.position.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: [
        { department: { name: 'asc' } },
        { title: 'asc' },
      ],
    });
  }

  /**
   * Get position by ID
   */
  async findById(tenantId: string, id: string) {
    const position = await prisma.position.findFirst({
      where: {
        id,
        tenantId,
        isActive: true,
      },
      include: {
        department: true,
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
            status: true,
          },
        },
      },
    });

    if (!position) {
      throw new AppError('Position not found', 404);
    }

    return position;
  }

  /**
   * Create new position
   */
  async create(tenantId: string, data: CreatePositionDto) {
    // Check if code already exists
    if (data.code) {
      const existing = await prisma.position.findFirst({
        where: {
          tenantId,
          code: data.code,
          isActive: true,
        },
      });
      if (existing) {
        throw new AppError('Position code already exists', 400);
      }
    }

    // Verify department exists
    const department = await prisma.department.findFirst({
      where: {
        id: data.departmentId,
        tenantId,
        isActive: true,
      },
    });
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    return await prisma.position.create({
      data: {
        ...data,
        tenantId,
      },
      include: {
        department: true,
      },
    });
  }

  /**
   * Update position
   */
  async update(tenantId: string, id: string, data: UpdatePositionDto) {
    // Check if position exists
    await this.findById(tenantId, id);

    // If updating code, check uniqueness
    if (data.code) {
      const existing = await prisma.position.findFirst({
        where: {
          tenantId,
          code: data.code,
          id: { not: id },
          isActive: true,
        },
      });
      if (existing) {
        throw new AppError('Position code already exists', 400);
      }
    }

    return await prisma.position.update({
      where: { id },
      data,
      include: {
        department: true,
      },
    });
  }

  /**
   * Delete position (soft delete)
   */
  async delete(tenantId: string, id: string) {
    const position = await this.findById(tenantId, id);

    // Check if position has employees
    if (position.employees && position.employees.length > 0) {
      throw new AppError('Cannot delete position with employees', 400);
    }

    return await prisma.position.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export default new PositionService();
