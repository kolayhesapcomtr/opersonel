import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import positionService from './position.service';

export class PositionController {
  /**
   * Get all positions
   */
  async getAll(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const departmentId = req.query.departmentId as string;
    const positions = await positionService.findAll(req.tenantId, departmentId);
    return ResponseHelper.success(res, positions);
  }

  /**
   * Get position by ID
   */
  async getById(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const position = await positionService.findById(req.tenantId, id);
    return ResponseHelper.success(res, position);
  }

  /**
   * Create new position
   */
  async create(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const position = await positionService.create(req.tenantId, req.body);
    return ResponseHelper.created(res, position, 'Position created successfully');
  }

  /**
   * Update position
   */
  async update(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const position = await positionService.update(req.tenantId, id, req.body);
    return ResponseHelper.success(res, position, 'Position updated successfully');
  }

  /**
   * Delete position
   */
  async delete(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    await positionService.delete(req.tenantId, id);
    return ResponseHelper.success(res, null, 'Position deleted successfully');
  }
}

export default new PositionController();
