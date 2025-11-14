import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  async getAll(tenantId: string) {
    return prisma.user.findMany({
      where: { tenantId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const user = await prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            position: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async create(tenantId: string, data: {
    email: string;
    password: string;
    role: UserRole;
    employeeId?: string;
    isActive?: boolean;
  }) {
    // Check if user with this email already exists in this tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        tenantId,
        employeeId: data.employeeId || null,
        isActive: data.isActive ?? true,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            email: true,
          },
        },
      },
    });

    return user;
  }

  async update(id: string, tenantId: string, data: {
    email?: string;
    password?: string;
    role?: UserRole;
    employeeId?: string;
    isActive?: boolean;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check for duplicates
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          tenantId,
          id: { not: id },
        },
      });

      if (emailExists) {
        throw new Error('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.employeeId !== undefined && { employeeId: data.employeeId || null }),
    };

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            email: true,
          },
        },
      },
    });

    return user;
  }

  async delete(id: string, tenantId: string) {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow deleting the last admin
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          tenantId,
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }

    await prisma.user.delete({
      where: { id },
    });
  }
}
