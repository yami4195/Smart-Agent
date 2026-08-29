import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';

import { NotificationModal } from '../components/common/NotificationModal';
import { notificationApi } from '../api/notification.api';
import { socketService } from '../services/socket.service';

interface NotificationContextType {
  unreadCount: number;
  openNotificationModal: () => void;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  openNotificationModal: () => {},
  fetchUnreadCount: async () => {},
});

export const useNotification = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user: clerkUser } = useUser();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toastNotif, setToastNotif] = useState<{ title: string; message: string } | null>(null);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications(true);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Socket.IO real-time notification listener (single connection for all screens)
  useEffect(() => {
    socketService.connect();

    if (clerkUser?.id) {
      socketService.joinUser(clerkUser.id);
    }

    const unsubNotif = socketService.onCustomerNotification((notif) => {
      notificationApi.addLocalNotification(
        notif.title || 'Queue Update',
        notif.message || '',
        notif.id
      );
      setToastNotif({
        title: notif.title || 'Queue Update',
        message: notif.message || '',
      });
      setUnreadCount((prev) => prev + 1);

      // Auto-hide toast after 6 seconds
      setTimeout(() => {
        setToastNotif(null);
      }, 6000);
    });

    return () => {
      unsubNotif();
    };
  }, [clerkUser?.id]);

  const openNotificationModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, openNotificationModal, fetchUnreadCount }}
    >
      {children}

      {/* Global Toast Banner */}
      {toastNotif && (
        <TouchableOpacity
          style={styles.toastBanner}
          onPress={() => {
            setToastNotif(null);
            setIsModalVisible(true);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.toastIconBox}>
            <Ionicons name="notifications" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>{toastNotif.title}</Text>
            <Text style={styles.toastMessage} numberOfLines={2}>
              {toastNotif.message}
            </Text>
          </View>
          <Ionicons name="close" size={16} color="#64748B" />
        </TouchableOpacity>
      )}

      {/* Global Notification Modal */}
      <NotificationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onRefreshUnreadCount={fetchUnreadCount}
      />
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastBanner: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#93C5FD',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0A2540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2540',
  },
  toastMessage: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
});

export default NotificationContext;
