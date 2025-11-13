import { Router } from 'express';
import tenantController from './tenant.controller';
import { resolveTenant, requireTenant } from '../../middleware/tenant.middleware';

const router = Router();

// Apply tenant resolver to all routes
router.use(resolveTenant);

// Public routes (no tenant required)
router.get('/check-subdomain/:subdomain', tenantController.checkSubdomain);
router.post('/', tenantController.create);
router.get('/slug/:slug', tenantController.getBySlug);

// Protected routes (tenant required)
router.get('/current', requireTenant, tenantController.getCurrent);
router.get('/stats/:id', requireTenant, tenantController.getStats);
router.get('/', requireTenant, tenantController.getAll);
router.patch('/:id', requireTenant, tenantController.update);
router.post('/:id/enable-subdomain', requireTenant, tenantController.enableSubdomain);

export default router;
