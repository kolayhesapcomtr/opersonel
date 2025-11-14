import { Router, Response } from 'express';
import { NotificationService } from './notification.service';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const notificationService = new NotificationService();

// Apply auth middleware
router.use(authMiddleware);

// Get all notifications
router.get('/', async (req: any, res: Response) => {
  try {
    const { unreadOnly, limit } = req.query;

    const notifications = await notificationService.getAll(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : undefined,
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch notifications',
    });
  }
});

// Get unread count
router.get('/unread-count', async (req: any, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get unread count',
    });
  }
});

// Mark as read
router.put('/:id/read', async (req: any, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    res.status(error.message === 'Notification not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to mark notification as read',
    });
  }
});

// Mark all as read
router.put('/read-all', async (req: any, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark all as read',
    });
  }
});

// Delete notification
router.delete('/:id', async (req: any, res: Response) => {
  try {
    await notificationService.delete(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error: any) {
    res.status(error.message === 'Notification not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to delete notification',
    });
  }
});

export default router;
