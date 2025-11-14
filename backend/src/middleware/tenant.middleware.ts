import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import prisma from '../database/prisma';
import { Tenant } from '@prisma/client';

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantId?: string;
    }
  }
}

export class TenantMiddleware {
  /**
   * Main tenant resolver middleware
   * Tries multiple strategies to determine the tenant:
   * 1. Subdomain (future feature - currently disabled)
   * 2. Custom domain (future feature - currently disabled)
   * 3. Session/Cookie (current method)
   * 4. Header (for API requests)
   */
  static async resolve(req: Request, _res: Response, next: NextFunction) {
    try {
      let tenant: Tenant | null = null;

      // Strategy 1: Subdomain (future feature)
      tenant = await TenantMiddleware.checkSubdomain(req);
      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant.id;
        return next();
      }

      // Strategy 2: Custom domain (future feature)
      tenant = await TenantMiddleware.checkCustomDomain(req);
      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant.id;
        return next();
      }

      // Strategy 3: Session/Cookie (current primary method)
      tenant = await TenantMiddleware.checkSession(req);
      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant.id;
        return next();
      }

      // Strategy 4: Header (for API requests)
      tenant = await TenantMiddleware.checkHeader(req);
      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant.id;
        return next();
      }

      // No tenant found - allow request to continue
      // Some routes (like login, tenant selection) don't require tenant
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Middleware to require tenant (use after resolve)
   */
  static require(req: Request, _res: Response, next: NextFunction) {
    if (!req.tenant || !req.tenantId) {
      throw new AppError('Tenant context required. Please select a company.', 400);
    }
    next();
  }

  /**
   * Check subdomain for tenant (FUTURE FEATURE)
   * Currently disabled but infrastructure is ready
   */
  private static async checkSubdomain(req: Request): Promise<Tenant | null> {
    // Skip if subdomain feature is not enabled globally
    const enableSubdomain = process.env.ENABLE_SUBDOMAIN === 'true';
    if (!enableSubdomain) {
      return null;
    }

    const hostname = req.hostname;

    // Skip main domain
    if (hostname === 'opersonel.com' || hostname === 'www.opersonel.com' || hostname === 'localhost') {
      return null;
    }

    // Extract subdomain
    const parts = hostname.split('.');
    if (parts.length < 2) {
      return null;
    }

    const subdomain = parts[0];

    // Find tenant by subdomain
    const tenant = await prisma.tenant.findFirst({
      where: {
        subdomain,
        hasSubdomain: true,
        isActive: true,
      },
    });

    return tenant;
  }

  /**
   * Check custom domain for tenant (FUTURE FEATURE)
   */
  private static async checkCustomDomain(req: Request): Promise<Tenant | null> {
    const enableCustomDomain = process.env.ENABLE_CUSTOM_DOMAIN === 'true';
    if (!enableCustomDomain) {
      return null;
    }

    const hostname = req.hostname;

    // Skip internal domains
    if (hostname.includes('opersonel.com') || hostname === 'localhost') {
      return null;
    }

    // Find tenant by custom domain
    const tenant = await prisma.tenant.findFirst({
      where: {
        customDomain: hostname,
        hasCustomDomain: true,
        isActive: true,
      },
    });

    return tenant;
  }

  /**
   * Check session/cookie for tenant (CURRENT METHOD)
   */
  private static async checkSession(req: Request): Promise<Tenant | null> {
    // Check cookie
    const tenantId = req.cookies?.tenantId;

    if (!tenantId) {
      return null;
    }

    // Find tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        isActive: true,
      },
    });

    return tenant;
  }

  /**
   * Check header for tenant (API requests)
   */
  private static async checkHeader(req: Request): Promise<Tenant | null> {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return null;
    }

    // Find tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        isActive: true,
      },
    });

    return tenant;
  }
}

/**
 * Convenience middlewares for routes
 */
export const resolveTenant = TenantMiddleware.resolve;
export const requireTenant = TenantMiddleware.require;
