import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  async getAll(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
    const where: any = { userId };

    if (options?.unreadOnly) {
      where.isRead = false;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  }) {
    return prisma.notification.create({
      data,
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.delete({
      where: { id },
    });
  }

  // Helper method to create leave request notifications
  async createLeaveNotification(
    userId: string,
    leaveRequestId: string,
    type: 'CREATED' | 'APPROVED' | 'REJECTED',
    employeeName: string
  ) {
    const titles = {
      CREATED: 'Yeni İzin Talebi',
      APPROVED: 'İzin Talebi Onaylandı',
      REJECTED: 'İzin Talebi Reddedildi',
    };

    const messages = {
      CREATED: `${employeeName} yeni bir izin talebi oluşturdu`,
      APPROVED: `İzin talebiniz onaylandı`,
      REJECTED: `İzin talebiniz reddedildi`,
    };

    return this.create({
      userId,
      title: titles[type],
      message: messages[type],
      type: 'LEAVE_REQUEST',
      link: `/leave-requests`,
    });
  }
}
