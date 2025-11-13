import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import employeeService from './employee.service';

export class EmployeeController {
  /**
   * Get all employees with optional filters
   */
  async getAll(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const filters = {
      departmentId: req.query.departmentId as string,
      positionId: req.query.positionId as string,
      status: req.query.status as any,
      employmentType: req.query.employmentType as any,
      search: req.query.search as string,
    };

    const employees = await employeeService.findAll(req.tenantId, filters);
    return ResponseHelper.success(res, employees);
  }

  /**
   * Get employee by ID
   */
  async getById(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const employee = await employeeService.findById(req.tenantId, id);
    return ResponseHelper.success(res, employee);
  }

  /**
   * Create new employee
   */
  async create(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const employee = await employeeService.create(req.tenantId, req.body);
    return ResponseHelper.created(res, employee, 'Employee created successfully');
  }

  /**
   * Update employee
   */
  async update(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const employee = await employeeService.update(req.tenantId, id, req.body);
    return ResponseHelper.success(res, employee, 'Employee updated successfully');
  }

  /**
   * Terminate employee
   */
  async terminate(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    const { terminationDate, reason } = req.body;

    const employee = await employeeService.terminate(req.tenantId, id, terminationDate, reason);
    return ResponseHelper.success(res, employee, 'Employee terminated successfully');
  }

  /**
   * Delete employee
   */
  async delete(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const { id } = req.params;
    await employeeService.delete(req.tenantId, id);
    return ResponseHelper.success(res, null, 'Employee deleted successfully');
  }

  /**
   * Get employee statistics
   */
  async getStats(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const stats = await employeeService.getStats(req.tenantId);
    return ResponseHelper.success(res, stats);
  }
}

export default new EmployeeController();
