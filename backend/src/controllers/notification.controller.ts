import { Request, Response } from "express";
import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
} from "../services/notification.service";

/**
 * GET /api/notifications
 * Query params: ?unreadOnly=true
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User is not authenticated",
      });
    }

    const unreadOnly = req.query.unreadOnly === "true";

    const result = await getUserNotificationsService(clerkUserId, { unreadOnly });

    return res.status(200).json({
      success: true,
      unreadCount: result.unreadCount,
      totalCount: result.totalCount,
      notifications: result.notifications,
    });
  } catch (error) {
    console.error("Error in getNotifications controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching notifications",
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User is not authenticated",
      });
    }

    const notificationId = req.params.id as string;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const updated = await markNotificationAsReadService(clerkUserId, notificationId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or does not belong to you",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: updated,
    });
  } catch (error) {
    console.error("Error in markAsRead controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating notification",
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User is not authenticated",
      });
    }

    const result = await markAllNotificationsAsReadService(clerkUserId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("Error in markAllAsRead controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while marking all notifications as read",
    });
  }
};

/**
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User is not authenticated",
      });
    }

    const notificationId = req.params.id as string;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const deleted = await deleteNotificationService(clerkUserId, notificationId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or does not belong to you",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteNotification controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting notification",
    });
  }
};
