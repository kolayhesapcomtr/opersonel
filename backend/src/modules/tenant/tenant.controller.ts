import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import tenantService from './tenant.service';

export class TenantController {
  /**
   * Get all tenants (admin only)
   */
  async getAll(req: Request, res: Response) {
    const tenants = await tenantService.findAll();
    return ResponseHelper.success(res, tenants);
  }

  /**
   * Get current tenant
   */
  async getCurrent(req: Request, res: Response) {
    if (!req.tenant) {
      return ResponseHelper.error(res, 'No tenant context', 400);
    }

    const stats = await tenantService.getStats(req.tenant.id);

    return ResponseHelper.success(res, {
      tenant: req.tenant,
      stats,
    });
  }

  /**
   * Get tenant by slug
   */
  async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    const tenant = await tenantService.findBySlug(slug);
    return ResponseHelper.success(res, tenant);
  }

  /**
   * Create tenant
   */
  async create(req: Request, res: Response) {
    const tenant = await tenantService.create(req.body);
    return ResponseHelper.created(res, tenant, 'Company created successfully');
  }

  /**
   * Update tenant
   */
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const tenant = await tenantService.update(id, req.body);
    return ResponseHelper.success(res, tenant, 'Company updated successfully');
  }

  /**
   * Check subdomain availability
   */
  async checkSubdomain(req: Request, res: Response) {
    const { subdomain } = req.params;
    const available = await tenantService.isSubdomainAvailable(subdomain);
    return ResponseHelper.success(res, { available, subdomain });
  }

  /**
   * Enable subdomain for tenant
   */
  async enableSubdomain(req: Request, res: Response) {
    const { id } = req.params;
    const { subdomain } = req.body;
    const tenant = await tenantService.enableSubdomain(id, subdomain);
    return ResponseHelper.success(res, tenant, 'Subdomain enabled successfully');
  }

  /**
   * Get tenant statistics
   */
  async getStats(req: Request, res: Response) {
    const { id } = req.params;
    const stats = await tenantService.getStats(id);
    return ResponseHelper.success(res, stats);
  }
}

export default new TenantController();
