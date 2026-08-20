import prisma from "../config/prisma";

export interface GetNotificationsOptions {
  unreadOnly?: boolean;
}

/**
 * Fetch all notifications for an authenticated user with unread and total counts
 */
export const getUserNotificationsService = async (
  clerkUserId: string,
  options?: GetNotificationsOptions
) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    return {
      unreadCount: 0,
      totalCount: 0,
      notifications: [],
    };
  }

  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  const totalCount = await prisma.notification.count({
    where: {
      userId: user.id,
    },
  });

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      ...(options?.unreadOnly ? { isRead: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    unreadCount,
    totalCount,
    notifications,
  };
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsReadService = async (
  clerkUserId: string,
  notificationId: string
) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) return null;

  const existingNotification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!existingNotification || existingNotification.userId !== user.id) {
    return null;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
};

/**
 * Mark all unread notifications for a user as read
 */
export const markAllNotificationsAsReadService = async (
  clerkUserId: string
) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) return { updatedCount: 0 };

  const result = await prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return {
    updatedCount: result.count,
  };
};

/**
 * Delete a notification by ID
 */
export const deleteNotificationService = async (
  clerkUserId: string,
  notificationId: string
) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) return null;

  const existingNotification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!existingNotification || existingNotification.userId !== user.id) {
    return null;
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return true;
};

/**
 * Helper to create an in-app notification for a user
 */
export const createNotificationHelper = async (
  userId: string,
  title: string,
  message: string
) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      isRead: false,
    },
  });
};
