import prisma from '../../database/prisma';
import { Tenant } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

export interface CreateTenantDto {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  planType?: string;
}

export interface UpdateTenantDto {
  name?: string;
  email?: string;
  phone?: string;
  subdomain?: string;
  customDomain?: string;
  hasSubdomain?: boolean;
  hasCustomDomain?: boolean;
  planType?: string;
  subscriptionStatus?: string;
  maxUsers?: number;
  maxStorage?: number;
}

export class TenantService {
  /**
   * Get all tenants (admin only)
   */
  async findAll(): Promise<Tenant[]> {
    return await prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get tenant by ID
   */
  async findById(id: string): Promise<Tenant> {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    return tenant;
  }

  /**
   * Get tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await prisma.tenant.findUnique({
      where: { slug, isActive: true },
    });

    if (!tenant) {
      throw new AppError('Company not found', 404);
    }

    return tenant;
  }

  /**
   * Get tenant by subdomain (future feature)
   */
  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return await prisma.tenant.findFirst({
      where: {
        subdomain,
        hasSubdomain: true,
        isActive: true,
      },
    });
  }

  /**
   * Get tenant by custom domain (future feature)
   */
  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    return await prisma.tenant.findFirst({
      where: {
        customDomain: domain,
        hasCustomDomain: true,
        isActive: true,
      },
    });
  }

  /**
   * Create new tenant
   */
  async create(data: CreateTenantDto): Promise<Tenant> {
    // Check if slug already exists
    const exists = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (exists) {
      throw new AppError('Company slug already exists', 400);
    }

    return await prisma.tenant.create({
      data: {
        ...data,
        planType: data.planType || 'free',
        subscriptionStatus: 'trial',
      },
    });
  }

  /**
   * Update tenant
   */
  async update(id: string, data: UpdateTenantDto): Promise<Tenant> {
    // Check if tenant exists
    await this.findById(id);

    // If updating subdomain, check availability
    if (data.subdomain) {
      const exists = await prisma.tenant.findFirst({
        where: {
          subdomain: data.subdomain,
          id: { not: id },
        },
      });

      if (exists) {
        throw new AppError('Subdomain already taken', 400);
      }
    }

    return await prisma.tenant.update({
      where: { id },
      data,
    });
  }

  /**
   * Enable subdomain for tenant (upgrade feature)
   */
  async enableSubdomain(id: string, subdomain: string): Promise<Tenant> {
    // Check subdomain availability
    const exists = await prisma.tenant.findFirst({
      where: { subdomain },
    });

    if (exists && exists.id !== id) {
      throw new AppError('Subdomain already taken', 400);
    }

    return await prisma.tenant.update({
      where: { id },
      data: {
        subdomain,
        hasSubdomain: true,
      },
    });
  }

  /**
   * Delete tenant (soft delete)
   */
  async delete(id: string): Promise<Tenant> {
    return await prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Check if subdomain is available
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    const tenant = await prisma.tenant.findFirst({
      where: { subdomain },
    });

    return !tenant;
  }

  /**
   * Get tenant statistics
   */
  async getStats(tenantId: string) {
    const [employeeCount, departmentCount, userCount] = await Promise.all([
      prisma.employee.count({ where: { tenantId, isActive: true } }),
      prisma.department.count({ where: { tenantId, isActive: true } }),
      prisma.user.count({ where: { tenantId, isActive: true } }),
    ]);

    return {
      employeeCount,
      departmentCount,
      userCount,
    };
  }
}

export default new TenantService();
