import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/expo';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import {
  LiveQueueCard,
  QueueStatusCard,
  QueueReadyNoticeCard,
  QueueActionButtons,
  QueueHeader,
} from '../../../../components/queue';
import { NotificationModal } from '../../../../components/common/NotificationModal';
import { queueStyles } from '../../../../../assets/styles/queue.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { queueApi, QueueTicketData } from '../../../../api/queue.api';
import { notificationApi } from '../../../../api/notification.api';
import { socketService } from '../../../../services/socket.service';

export default function MyQueueScreen() {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  const [ticket, setTicket] = useState<QueueTicketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [isNotifModalVisible, setIsNotifModalVisible] = useState<boolean>(false);
  const [toastNotif, setToastNotif] = useState<{ title: string; message: string } | null>(null);

  // Sync active ticket on focus or pull-to-refresh
  const loadTicket = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const activeTicket = await queueApi.getActiveTicket();

      if (
        activeTicket &&
        activeTicket.status !== 'COMPLETED' &&
        activeTicket.status !== 'CANCELLED' &&
        activeTicket.status !== 'NO_SHOW'
      ) {
        setTicket(activeTicket);
      } else {
        setTicket(null);
      }
    } catch {
      setTicket(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload ticket whenever this tab/screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTicket();
    }, [loadTicket])
  );

  // Fallback safety timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Socket.IO Real-Time Listener for Status Changes & Notifications
  useEffect(() => {
    socketService.connect();

    if (clerkUser?.id) {
      socketService.joinUser(clerkUser.id);
    }

    const unsubStatus = socketService.onQueueStatusChanged((data) => {
      if (data.status === 'COMPLETED' || data.status === 'CANCELLED' || data.status === 'NO_SHOW') {
        setTicket(null);
      } else if (data.status === 'SERVING') {
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                status: 'SERVING',
                counterNumber: data.counterNumber || prev.counterNumber,
              }
            : null
        );
      }
    });

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
      loadTicket();

      setTimeout(() => {
        setToastNotif(null);
      }, 6000);
    });

    return () => {
      unsubStatus();
      unsubNotif();
    };
  }, [clerkUser?.id, loadTicket]);

  // Back navigation action
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(app)/customer/(tabs)');
    }
  };

  // Notification action
  const handleNotification = () => {
    setIsNotifModalVisible(true);
  };

  // Cancel Ticket action
  const handleCancelTicket = async () => {
    if (!ticket) return;

    try {
      setIsCanceling(true);
      await queueApi.cancelTicket(ticket.id);
      setTicket(null);
      Alert.alert('Ticket Cancelled', 'Your ticket has been cancelled.');
    } catch {
      Alert.alert('Error', 'Failed to cancel ticket. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  // Reschedule Ticket action
  const handleReschedule = () => {
    Alert.alert(
      'Reschedule Service',
      `Would you like to book a designated appointment slot at ${ticket?.branch.name || 'Bole Branch'} for ${ticket?.service.name || 'Account Opening'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Reschedule',
          onPress: () => {
            Alert.alert(
              'Appointment Rescheduled',
              'Your slot has been reserved. You can view it under your profile bookings.'
            );
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Real-time Notification Banner Toast */}
      {toastNotif && (
        <TouchableOpacity
          style={styles.toastBanner}
          onPress={() => {
            setToastNotif(null);
            setIsNotifModalVisible(true);
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

      {/* Header */}
      <QueueHeader
        title="My Queue"
        onBackPress={handleBack}
        onNotificationPress={handleNotification}
        showBack={true}
      />

      {loading && !refreshing && !ticket ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={queueStyles.screenContainer}
          contentContainerStyle={queueStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTicket(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {ticket ? (
            <>
              {/* 1. Top Live Queue Card */}
              <LiveQueueCard
                ticketNumber={ticket.ticketNumber}
                branchName={ticket.branch.name}
                serviceName={ticket.service.name}
                estimatedWaitTime={ticket.estimatedWaitTime || '03:28'}
              />

              {/* 2. Queue Status Card */}
              <QueueStatusCard
                position={ticket.peopleAhead ? ticket.peopleAhead + 1 : 1}
                peopleAhead={ticket.peopleAhead ?? 0}
                nowServingTicket={ticket.nowServingTicket || 'Ticket T-101'}
                counterNumber={ticket.counterNumber || '01'}
                status={ticket.status === 'SERVING' ? 'SERVING' : 'WAITING'}
              />

              {/* 3. Getting Ready Notice Card */}
              <QueueReadyNoticeCard
                title="Getting Ready"
                description="Please have your ID and relevant documents ready to expedite your service when called."
              />

              {/* 4. Action Buttons (Cancel Ticket & Reschedule) */}
              <QueueActionButtons
                onCancelTicket={handleCancelTicket}
                onReschedule={handleReschedule}
                isCanceling={isCanceling}
              />

              {/* 5. View History Link */}
              <TouchableOpacity
                style={styles.historyLinkBtn}
                onPress={() => router.push('/(app)/customer/Queue/history')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="history" size={18} color={COLORS.primary} />
                <Text style={styles.historyLinkText}>View Past Queue History</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Clean Empty State when user has not joined any queue */
            <View style={queueStyles.emptyContainer}>
              <View style={queueStyles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="ticket-confirmation-outline"
                  size={36}
                  color={COLORS.primary}
                />
              </View>
              <Text style={queueStyles.emptyTitle}>No Active Queue</Text>
              <Text style={queueStyles.emptySubtitle}>
                You haven't joined a queue yet. Visit any branch details page and select a service to join the live queue.
              </Text>

              <TouchableOpacity
                style={queueStyles.emptyButton}
                onPress={() => router.push('/(app)/customer/(tabs)/branches')}
                activeOpacity={0.85}
              >
                <Text style={queueStyles.emptyButtonText}>Find Branches & Join Queue</Text>
              </TouchableOpacity>

              {/* Link to view history */}
              <TouchableOpacity
                style={styles.emptyHistoryBtn}
                onPress={() => router.push('/(app)/customer/Queue/history')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="history" size={18} color="#64748B" />
                <Text style={styles.emptyHistoryText}>View Previous Queue History</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Notification Center Modal */}
      <NotificationModal
        visible={isNotifModalVisible}
        onClose={() => setIsNotifModalVisible(false)}
      />
    </View>
  );
}

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
  historyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
    marginBottom: 20,
    gap: 8,
  },
  historyLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    gap: 6,
  },
  emptyHistoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
