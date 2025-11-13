import prisma from '../../database/prisma';
import { LeaveType } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

export interface CreateLeaveTypeDto {
  name: string;
  code: string;
  description?: string;
  daysPerYear: number;
  requiresApproval?: boolean;
  isPaid?: boolean;
  canCarryForward?: boolean;
}

export interface UpdateLeaveTypeDto extends Partial<CreateLeaveTypeDto> {}

export class LeaveTypeService {
  /**
   * Get all leave types for a tenant
   */
  async findAll(tenantId: string) {
    return await prisma.leaveType.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get leave type by ID
   */
  async findById(tenantId: string, id: string) {
    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id,
        tenantId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            leaveRequests: true,
          },
        },
      },
    });

    if (!leaveType) {
      throw new AppError('Leave type not found', 404);
    }

    return leaveType;
  }

  /**
   * Create new leave type
   */
  async create(tenantId: string, data: CreateLeaveTypeDto) {
    // Check if code already exists
    const existing = await prisma.leaveType.findFirst({
      where: {
        tenantId,
        code: data.code,
        isActive: true,
      },
    });
    if (existing) {
      throw new AppError('Leave type code already exists', 400);
    }

    return await prisma.leaveType.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  /**
   * Update leave type
   */
  async update(tenantId: string, id: string, data: UpdateLeaveTypeDto) {
    // Check if leave type exists
    await this.findById(tenantId, id);

    // If updating code, check uniqueness
    if (data.code) {
      const existing = await prisma.leaveType.findFirst({
        where: {
          tenantId,
          code: data.code,
          id: { not: id },
          isActive: true,
        },
      });
      if (existing) {
        throw new AppError('Leave type code already exists', 400);
      }
    }

    return await prisma.leaveType.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete leave type (soft delete)
   */
  async delete(tenantId: string, id: string) {
    const leaveType = await this.findById(tenantId, id);

    // Check if leave type has requests
    if ((leaveType as any)._count?.leaveRequests > 0) {
      throw new AppError('Cannot delete leave type with existing requests', 400);
    }

    return await prisma.leaveType.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export default new LeaveTypeService();
