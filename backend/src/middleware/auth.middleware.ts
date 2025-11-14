import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import authService from '../modules/auth/auth.service';
import { JwtPayload } from '../modules/auth/auth.service';
import { UserRole } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userId?: string;
    }
  }
}

/**
 * Authenticate user via JWT token
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = authService.verifyToken(token);

    // Attach user to request
    req.user = payload;

    // Also set tenantId and userId for convenience
    req.tenantId = payload.tenantId;
    req.userId = payload.userId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};

// Alias for compatibility
export const authMiddleware = authenticate;

/**
 * Authorize user by role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Check if user is admin or HR manager
 */
export const isAdminOrHR = authorize(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.HR_MANAGER
);

/**
 * Check if user is manager or higher
 */
export const isManager = authorize(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.HR_MANAGER,
  UserRole.MANAGER
);

/**
 * Check if user is admin
 */
export const isAdmin = authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN);
