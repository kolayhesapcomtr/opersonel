import { Router } from 'express';
import departmentController from './department.controller';
import { authenticate, isAdminOrHR } from '../../middleware/auth.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

// Get department hierarchy
router.get('/hierarchy', departmentController.getHierarchy);

// CRUD operations
router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);
router.post('/', isAdminOrHR, departmentController.create);
router.patch('/:id', isAdminOrHR, departmentController.update);
router.delete('/:id', isAdminOrHR, departmentController.delete);

// Statistics
router.get('/:id/stats', departmentController.getStats);

export default router;
