import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { notificationApi, AppNotification } from '../../api/notification.api';
import { notificationStyles } from '../../../assets/styles/notification.styles';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onRefreshUnreadCount?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onRefreshUnreadCount,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      setNotifications(res.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationApi.markAllAsRead();
    if (onRefreshUnreadCount) onRefreshUnreadCount();
  };

  const handleMarkSingleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await notificationApi.markAsRead(id);
    if (onRefreshUnreadCount) onRefreshUnreadCount();
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await notificationApi.deleteNotification(id);
    if (onRefreshUnreadCount) onRefreshUnreadCount();
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={notificationStyles.modalOverlay}>
        <View style={notificationStyles.modalCard}>
          {/* Header */}
          <View style={notificationStyles.modalHeader}>
            <View style={notificationStyles.headerLeft}>
              <View style={notificationStyles.bellCircle}>
                <Ionicons name="notifications" size={18} color="#0A2540" />
              </View>
              <Text style={notificationStyles.modalTitle}>Notifications</Text>
            </View>

            <View style={notificationStyles.headerRight}>
              {notifications.some((n) => !n.isRead) && (
                <TouchableOpacity onPress={handleMarkAllRead} style={notificationStyles.markAllBtn}>
                  <Text style={notificationStyles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={notificationStyles.closeBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView
            style={notificationStyles.scrollList}
            contentContainerStyle={notificationStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading && notifications.length === 0 ? (
              <View style={notificationStyles.centerContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    notificationStyles.notifCard,
                    !notif.isRead && notificationStyles.unreadCard,
                  ]}
                  onPress={() => !notif.isRead && handleMarkSingleRead(notif.id)}
                  activeOpacity={0.8}
                >
                  <View style={notificationStyles.notifTopRow}>
                    <View style={notificationStyles.titleRow}>
                      {!notif.isRead && <View style={notificationStyles.unreadDot} />}
                      <Text style={[notificationStyles.notifTitle, !notif.isRead && notificationStyles.unreadTitle]}>
                        {notif.title}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDelete(notif.id)}
                      hitSlop={8}
                      style={{ padding: 2 }}
                    >
                      <Feather name="trash-2" size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>

                  <Text style={notificationStyles.notifMessage}>{notif.message}</Text>

                  <Text style={notificationStyles.notifDate}>{formatDate(notif.createdAt)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={notificationStyles.emptyContainer}>
                <View style={notificationStyles.emptyIconCircle}>
                  <MaterialCommunityIcons
                    name="bell-check-outline"
                    size={32}
                    color="#94A3B8"
                  />
                </View>
                <Text style={notificationStyles.emptyTitle}>No Notifications</Text>
                <Text style={notificationStyles.emptySub}>
                  You're all caught up! Updates regarding your branch queue tickets will appear here.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;
