import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { notificationApi, AppNotification } from '../../api/notification.api';

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
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.bellCircle}>
                <Ionicons name="notifications" size={18} color="#0A2540" />
              </View>
              <Text style={styles.modalTitle}>Notifications</Text>
            </View>

            <View style={styles.headerRight}>
              {notifications.some((n) => !n.isRead) && (
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading && notifications.length === 0 ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notifCard,
                    !notif.isRead && styles.unreadCard,
                  ]}
                  onPress={() => !notif.isRead && handleMarkSingleRead(notif.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.notifTopRow}>
                    <View style={styles.titleRow}>
                      {!notif.isRead && <View style={styles.unreadDot} />}
                      <Text style={[styles.notifTitle, !notif.isRead && styles.unreadTitle]}>
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

                  <Text style={styles.notifMessage}>{notif.message}</Text>

                  <Text style={styles.notifDate}>{formatDate(notif.createdAt)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <MaterialCommunityIcons
                    name="bell-check-outline"
                    size={32}
                    color="#94A3B8"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySub}>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  closeBtn: {
    padding: 4,
  },
  scrollList: {
    marginTop: 10,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  notifCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  unreadTitle: {
    color: '#0A2540',
    fontWeight: '800',
  },
  notifMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
