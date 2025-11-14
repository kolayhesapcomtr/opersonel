import { Router, Request, Response } from 'express';
import { UserService } from './user.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const userService = new UserService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper function to check if user is admin
const isAdmin = (req: any) => {
  return req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;
};

// Get all users (Admin only)
router.get('/', async (req: any, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    const users = await userService.getAll(req.user.tenantId);

    // Remove password from response
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    res.json({
      success: true,
      data: usersWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch users',
    });
  }
});

// Get user by ID (Admin only)
router.get('/:id', async (req: any, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    const user = await userService.getById(req.params.id, req.user.tenantId);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch user',
    });
  }
});

// Create new user (Admin only)
router.post('/', async (req: any, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    const { email, password, role, employeeId, isActive } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and role are required',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    const user = await userService.create(req.user.tenantId, {
      email,
      password,
      role,
      employeeId,
      isActive,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: 'User created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create user',
    });
  }
});

// Update user (Admin only)
router.put('/:id', async (req: any, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    const { email, password, role, employeeId, isActive } = req.body;

    // Validate password length if provided
    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
      }
    }

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    const user = await userService.update(req.params.id, req.user.tenantId, {
      email,
      password,
      role,
      employeeId,
      isActive,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 400).json({
      success: false,
      error: error.message || 'Failed to update user',
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', async (req: any, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    // Prevent users from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account',
      });
    }

    await userService.delete(req.params.id, req.user.tenantId);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 400).json({
      success: false,
      error: error.message || 'Failed to delete user',
    });
  }
});

export default router;
