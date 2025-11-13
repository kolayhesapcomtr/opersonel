import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import leaveRequestService from './leave-request.service';
import { LeaveRequestStatus } from '@prisma/client';

export class LeaveRequestController {
  /**
   * Get all leave requests with optional filters
   */
  async getAll(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const filters = {
      employeeId: req.query.employeeId as string,
      leaveTypeId: req.query.leaveTypeId as string,
      status: req.query.status as LeaveRequestStatus,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const leaveRequests = await leaveRequestService.findAll(req.tenantId, filters);
    return ResponseHelper.success(res, leaveRequests);
  }

  /**
   * Get leave request by ID
   */
  async getById(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const leaveRequest = await leaveRequestService.findById(req.tenantId, id);
    return ResponseHelper.success(res, leaveRequest);
  }

  /**
   * Create new leave request
   */
  async create(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const leaveRequest = await leaveRequestService.create(req.tenantId, req.body);
    return ResponseHelper.created(res, leaveRequest, 'Leave request created successfully');
  }

  /**
   * Update leave request
   */
  async update(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const leaveRequest = await leaveRequestService.update(req.tenantId, id, req.body);
    return ResponseHelper.success(res, leaveRequest, 'Leave request updated successfully');
  }

  /**
   * Approve leave request
   */
  async approve(req: Request, res: Response) {
    if (!req.tenantId || !req.userId) {
      return ResponseHelper.error(res, 'Tenant context and user required', 400);
    }

    const { id } = req.params;
    const leaveRequest = await leaveRequestService.approve(req.tenantId, id, req.userId);
    return ResponseHelper.success(res, leaveRequest, 'Leave request approved');
  }

  /**
   * Reject leave request
   */
  async reject(req: Request, res: Response) {
    if (!req.tenantId || !req.userId) {
      return ResponseHelper.error(res, 'Tenant context and user required', 400);
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;
    const leaveRequest = await leaveRequestService.reject(
      req.tenantId,
      id,
      req.userId,
      rejectionReason
    );
    return ResponseHelper.success(res, leaveRequest, 'Leave request rejected');
  }

  /**
   * Cancel leave request
   */
  async cancel(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const leaveRequest = await leaveRequestService.cancel(req.tenantId, id);
    return ResponseHelper.success(res, leaveRequest, 'Leave request cancelled');
  }

  /**
   * Delete leave request
   */
  async delete(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    await leaveRequestService.delete(req.tenantId, id);
    return ResponseHelper.success(res, null, 'Leave request deleted successfully');
  }

  /**
   * Get employee leave balance
   */
  async getBalance(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { employeeId } = req.params;
    const leaveTypeId = req.query.leaveTypeId as string;

    const balance = await leaveRequestService.getEmployeeBalance(
      req.tenantId,
      employeeId,
      leaveTypeId
    );
    return ResponseHelper.success(res, balance);
  }
}

export default new LeaveRequestController();
