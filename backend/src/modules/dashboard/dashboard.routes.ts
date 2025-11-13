import { Router } from 'express';
import dashboardController from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

// Dashboard statistics
router.get('/overview', dashboardController.getOverview);

export default router;
