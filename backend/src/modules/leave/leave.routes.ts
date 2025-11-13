import { Router } from 'express';
import leaveTypeController from './leave-type.controller';
import leaveRequestController from './leave-request.controller';
import { authenticate, isAdminOrHR, isManager } from '../../middleware/auth.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

// ============================================
// LEAVE TYPES (Admin/HR only)
// ============================================
router.get('/types', leaveTypeController.getAll);
router.get('/types/:id', leaveTypeController.getById);
router.post('/types', isAdminOrHR, leaveTypeController.create);
router.patch('/types/:id', isAdminOrHR, leaveTypeController.update);
router.delete('/types/:id', isAdminOrHR, leaveTypeController.delete);

// ============================================
// LEAVE REQUESTS
// ============================================
router.get('/requests', leaveRequestController.getAll);
router.get('/requests/:id', leaveRequestController.getById);
router.post('/requests', leaveRequestController.create);
router.patch('/requests/:id', leaveRequestController.update);
router.delete('/requests/:id', leaveRequestController.delete);

// Leave request actions (Manager/HR/Admin only)
router.post('/requests/:id/approve', isManager, leaveRequestController.approve);
router.post('/requests/:id/reject', isManager, leaveRequestController.reject);
router.post('/requests/:id/cancel', leaveRequestController.cancel);

// Employee leave balance
router.get('/balance/:employeeId', leaveRequestController.getBalance);

export default router;
