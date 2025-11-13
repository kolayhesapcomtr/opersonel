import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import departmentService from './department.service';

export class DepartmentController {
  /**
   * Get all departments
   */
  async getAll(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const departments = await departmentService.findAll(req.tenantId);
    return ResponseHelper.success(res, departments);
  }

  /**
   * Get department hierarchy
   */
  async getHierarchy(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const hierarchy = await departmentService.getHierarchy(req.tenantId);
    return ResponseHelper.success(res, hierarchy);
  }

  /**
   * Get department by ID
   */
  async getById(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const department = await departmentService.findById(req.tenantId, id);
    return ResponseHelper.success(res, department);
  }

  /**
   * Create new department
   */
  async create(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const department = await departmentService.create(req.tenantId, req.body);
    return ResponseHelper.created(res, department, 'Department created successfully');
  }

  /**
   * Update department
   */
  async update(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const department = await departmentService.update(req.tenantId, id, req.body);
    return ResponseHelper.success(res, department, 'Department updated successfully');
  }

  /**
   * Delete department
   */
  async delete(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    await departmentService.delete(req.tenantId, id);
    return ResponseHelper.success(res, null, 'Department deleted successfully');
  }

  /**
   * Get department statistics
   */
  async getStats(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const stats = await departmentService.getStats(req.tenantId, id);
    return ResponseHelper.success(res, stats);
  }
}

export default new DepartmentController();
