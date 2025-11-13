import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import leaveTypeService from './leave-type.service';

export class LeaveTypeController {
  /**
   * Get all leave types
   */
  async getAll(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const leaveTypes = await leaveTypeService.findAll(req.tenantId);
    return ResponseHelper.success(res, leaveTypes);
  }

  /**
   * Get leave type by ID
   */
  async getById(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const leaveType = await leaveTypeService.findById(req.tenantId, id);
    return ResponseHelper.success(res, leaveType);
  }

  /**
   * Create new leave type
   */
  async create(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const leaveType = await leaveTypeService.create(req.tenantId, req.body);
    return ResponseHelper.created(res, leaveType, 'Leave type created successfully');
  }

  /**
   * Update leave type
   */
  async update(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const leaveType = await leaveTypeService.update(req.tenantId, id, req.body);
    return ResponseHelper.success(res, leaveType, 'Leave type updated successfully');
  }

  /**
   * Delete leave type
   */
  async delete(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    await leaveTypeService.delete(req.tenantId, id);
    return ResponseHelper.success(res, null, 'Leave type deleted successfully');
  }
}

export default new LeaveTypeController();
