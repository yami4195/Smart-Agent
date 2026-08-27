import api from './axiosInstance';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  unreadCount: number;
  totalCount: number;
  notifications: AppNotification[];
}

// In-memory notifications store for instant real-time delivery
const localNotifications: AppNotification[] = [];

export const notificationApi = {
  /**
   * Add real-time notification received via socket
   */
  addLocalNotification: (title: string, message: string, id?: string): AppNotification => {
    const newNotif: AppNotification = {
      id: id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    // Prepend so newest is at the top
    localNotifications.unshift(newNotif);
    return newNotif;
  },

  /**
   * Fetch notifications with fast timeout and fallback to local cache
   */
  getNotifications: async (unreadOnly = false): Promise<NotificationsResponse> => {
    try {
      const response = await api.get<NotificationsResponse>('/notifications', {
        params: { unreadOnly },
        timeout: 3500,
      });

      if (response.data?.success && Array.isArray(response.data?.notifications)) {
        // Merge DB notifications with any fresh local socket notifications
        const serverNotifs = response.data.notifications;
        const merged = [...localNotifications];
        serverNotifs.forEach((sn) => {
          if (!merged.some((m) => m.id === sn.id || (m.title === sn.title && m.message === sn.message))) {
            merged.push(sn);
          }
        });

        const unreadCount = merged.filter((n) => !n.isRead).length;
        return {
          success: true,
          unreadCount,
          totalCount: merged.length,
          notifications: merged,
        };
      }

      const unreadCount = localNotifications.filter((n) => !n.isRead).length;
      return {
        success: true,
        unreadCount,
        totalCount: localNotifications.length,
        notifications: localNotifications,
      };
    } catch {
      const unreadCount = localNotifications.filter((n) => !n.isRead).length;
      return {
        success: true,
        unreadCount,
        totalCount: localNotifications.length,
        notifications: localNotifications,
      };
    }
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const localItem = localNotifications.find((n) => n.id === id);
    if (localItem) {
      localItem.isRead = true;
    }

    try {
      await api.patch(`/notifications/${id}/read`, {}, { timeout: 3000 });
      return true;
    } catch {
      return true;
    }
  },

  markAllAsRead: async (): Promise<boolean> => {
    localNotifications.forEach((n) => {
      n.isRead = true;
    });

    try {
      await api.patch('/notifications/read-all', {}, { timeout: 3000 });
      return true;
    } catch {
      return true;
    }
  },

  deleteNotification: async (id: string): Promise<boolean> => {
    const idx = localNotifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      localNotifications.splice(idx, 1);
    }

    try {
      await api.delete(`/notifications/${id}`, { timeout: 3000 });
      return true;
    } catch {
      return true;
    }
  },
};

export default notificationApi;
