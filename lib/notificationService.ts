import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  recipientId: string;
  type: string;
  title: string;
  description?: string;
  redirectUrl: string;
  meta?: any;
}

export async function createNotification(params: CreateNotificationParams) {
  const { recipientId, type, title, description, redirectUrl, meta } = params;
  return prisma.notification.create({
    data: {
      userId: recipientId,
      type,
      title,
      description,
      redirectUrl,
      meta,
    },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(notificationId: number) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
} 