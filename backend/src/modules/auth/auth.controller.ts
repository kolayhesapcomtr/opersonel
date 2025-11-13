import { Request, Response } from 'express';
import { ResponseHelper } from '../../common/response';
import authService from './auth.service';

export class AuthController {
  /**
   * Login
   */
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    // Set tenant cookie
    res.cookie('tenantId', result.tenant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ResponseHelper.success(res, result, 'Login successful');
  }

  /**
   * Register
   */
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);

    // Set tenant cookie
    res.cookie('tenantId', result.tenant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ResponseHelper.created(res, result, 'Registration successful');
  }

  /**
   * Logout
   */
  async logout(req: Request, res: Response) {
    // Clear tenant cookie
    res.clearCookie('tenantId');

    return ResponseHelper.success(res, null, 'Logout successful');
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response) {
    if (!req.user?.userId) {
      return ResponseHelper.unauthorized(res);
    }

    const profile = await authService.getProfile(req.user.userId);
    return ResponseHelper.success(res, profile);
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response) {
    if (!req.user?.userId) {
      return ResponseHelper.unauthorized(res);
    }

    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.userId, oldPassword, newPassword);

    return ResponseHelper.success(res, result, 'Password changed successfully');
  }
}

export default new AuthController();
