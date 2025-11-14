import prisma from '../../database/prisma';
import { LeaveRequestStatus } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

export interface CreateLeaveRequestDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}

export interface UpdateLeaveRequestDto {
  startDate?: string;
  endDate?: string;
  days?: number;
  reason?: string;
}

export interface LeaveRequestFilters {
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
  startDate?: string;
  endDate?: string;
}

export class LeaveRequestService {
  /**
   * Get all leave requests with filters
   */
  async findAll(tenantId: string, filters?: LeaveRequestFilters) {
    const where: any = {
      tenantId,
    };

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.leaveTypeId) {
      where.leaveTypeId = filters.leaveTypeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate);
      }
    }

    return await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            department: {
              select: {
                name: true,
              },
            },
            position: {
              select: {
                title: true,
              },
            },
          },
        },
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            isPaid: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get leave request by ID
   */
  async findById(tenantId: string, id: string) {
    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            position: {
              select: {
                title: true,
              },
            },
          },
        },
        leaveType: true,
      },
    });

    if (!leaveRequest) {
      throw new AppError('Leave request not found', 404);
    }

    return leaveRequest;
  }

  /**
   * Create new leave request
   */
  async create(tenantId: string, data: CreateLeaveRequestDto) {
    // Verify employee exists
    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        tenantId,
        isActive: true,
      },
    });
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Verify leave type exists
    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id: data.leaveTypeId,
        tenantId,
        isActive: true,
      },
    });
    if (!leaveType) {
      throw new AppError('Leave type not found', 404);
    }

    // Check for overlapping requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: data.employeeId,
        status: {
          in: [LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(data.startDate) } },
              { endDate: { gte: new Date(data.startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(data.endDate) } },
              { endDate: { gte: new Date(data.endDate) } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new AppError('Leave request overlaps with existing request', 400);
    }

    return await prisma.leaveRequest.create({
      data: {
        ...data,
        tenantId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: leaveType.requiresApproval
          ? LeaveRequestStatus.PENDING
          : LeaveRequestStatus.APPROVED,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        leaveType: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update leave request (only pending ones)
   */
  async update(tenantId: string, id: string, data: UpdateLeaveRequestDto) {
    const leaveRequest = await this.findById(tenantId, id);

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new AppError('Can only update pending leave requests', 400);
    }

    return await prisma.leaveRequest.update({
      where: { id },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.days !== undefined && { days: data.days }),
        ...(data.reason !== undefined && { reason: data.reason }),
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        leaveType: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * Approve leave request
   */
  async approve(tenantId: string, id: string, approvedBy: string) {
    const leaveRequest = await this.findById(tenantId, id);

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new AppError('Leave request is not pending', 400);
    }

    return await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveRequestStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        leaveType: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * Reject leave request
   */
  async reject(tenantId: string, id: string, approvedBy: string, rejectionReason?: string) {
    const leaveRequest = await this.findById(tenantId, id);

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new AppError('Leave request is not pending', 400);
    }

    return await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveRequestStatus.REJECTED,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        leaveType: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * Cancel leave request
   */
  async cancel(tenantId: string, id: string) {
    const leaveRequest = await this.findById(tenantId, id);

    if (leaveRequest.status === LeaveRequestStatus.CANCELLED) {
      throw new AppError('Leave request is already cancelled', 400);
    }

    return await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveRequestStatus.CANCELLED,
      },
    });
  }

  /**
   * Delete leave request (hard delete - only pending)
   */
  async delete(tenantId: string, id: string) {
    const leaveRequest = await this.findById(tenantId, id);

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new AppError('Can only delete pending leave requests', 400);
    }

    return await prisma.leaveRequest.delete({
      where: { id },
    });
  }

  /**
   * Get employee leave balance
   */
  async getEmployeeBalance(tenantId: string, employeeId: string, leaveTypeId?: string) {
    const where: any = {
      tenantId,
      isActive: true,
    };

    if (leaveTypeId) {
      where.id = leaveTypeId;
    }

    const leaveTypes = await prisma.leaveType.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        daysPerYear: true,
      },
    });

    const balances = await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const approved = await prisma.leaveRequest.aggregate({
          where: {
            employeeId,
            leaveTypeId: leaveType.id,
            status: LeaveRequestStatus.APPROVED,
            startDate: {
              gte: new Date(new Date().getFullYear(), 0, 1), // Start of year
            },
          },
          _sum: {
            days: true,
          },
        });

        const used = approved._sum.days || 0;
        const available = leaveType.daysPerYear - used;

        return {
          leaveType,
          allocated: leaveType.daysPerYear,
          used,
          available,
        };
      })
    );

    return balances;
  }
}

export default new LeaveRequestService();
