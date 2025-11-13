import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/prisma';
import { User, UserRole } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { config } from '../../config';

export interface LoginDto {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  tenantSlug: string;
  firstName?: string;
  lastName?: string;
}

export interface JwtPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: Partial<User>;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  token: string;
}

export class AuthService {
  /**
   * User login
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: data.tenantSlug, isActive: true },
    });

    if (!tenant) {
      throw new AppError('Company not found', 404);
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
        tenantId: tenant.id,
        isActive: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            position: {
              select: {
                title: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      token,
    };
  }

  /**
   * User registration (create new user in existing tenant)
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: data.tenantSlug, isActive: true },
    });

    if (!tenant) {
      throw new AppError('Company not found', 404);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        tenantId: tenant.id,
      },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user (without employee for now)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        tenantId: tenant.id,
        role: UserRole.EMPLOYEE,
      },
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      token,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            planType: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            employeeNumber: true,
            profilePhoto: true,
            position: {
              select: {
                id: true,
                title: true,
                level: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Remove password
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

export default new AuthService();
