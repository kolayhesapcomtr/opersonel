import { Router } from 'express';
import positionController from './position.controller';
import { authenticate, isAdminOrHR } from '../../middleware/auth.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

// CRUD operations
router.get('/', positionController.getAll);
router.get('/:id', positionController.getById);
router.post('/', isAdminOrHR, positionController.create);
router.patch('/:id', isAdminOrHR, positionController.update);
router.delete('/:id', isAdminOrHR, positionController.delete);

export default router;
