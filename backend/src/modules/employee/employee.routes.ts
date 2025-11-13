import { Router } from 'express';
import employeeController from './employee.controller';
import { authenticate, isAdminOrHR } from '../../middleware/auth.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

// Get employee statistics
router.get('/stats', employeeController.getStats);

// CRUD operations
router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', isAdminOrHR, employeeController.create);
router.patch('/:id', isAdminOrHR, employeeController.update);
router.delete('/:id', isAdminOrHR, employeeController.delete);

// Special operations
router.post('/:id/terminate', isAdminOrHR, employeeController.terminate);

export default router;
