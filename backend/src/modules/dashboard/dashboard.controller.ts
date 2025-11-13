import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import dashboardService from './dashboard.service';

export class DashboardController {
  /**
   * Get dashboard overview statistics
   */
  async getOverview(req: Request, res: Response) {
    if (!req.tenantId) {
      return ResponseHelper.error(res, 'Tenant context required', 400);
    }

    const stats = await dashboardService.getOverview(req.tenantId);
    return ResponseHelper.success(res, stats);
  }
}

export default new DashboardController();
