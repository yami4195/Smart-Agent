import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  LiveQueueCard,
  QueueStatusCard,
  QueueReadyNoticeCard,
  QueueActionButtons,
  QueueHeader,
} from '../../../../components/queue';
import { queueStyles } from '../../../../../assets/styles/queue.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { queueApi, QueueTicketData } from '../../../../api/queue.api';

export default function MyQueueScreen() {
  const router = useRouter();

  const [ticket, setTicket] = useState<QueueTicketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);

  // Sync active ticket on focus or pull-to-refresh
  const loadTicket = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const activeTicket = await queueApi.getActiveTicket();

      if (
        activeTicket &&
        activeTicket.status !== 'COMPLETED' &&
        activeTicket.status !== 'CANCELLED'
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

  // Back navigation action
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(app)/customer/(tabs)');
    }
  };

  // Notification alert
  const handleNotification = () => {
    Alert.alert(
      'Queue Notifications',
      'You will receive an alert when your turn is coming up in 2 minutes.'
    );
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
      `Would you like to book a designated appointment slot at ${ticket?.branch.name || 'Bole Branch'} for ${ticket?.service.name || 'Cash Services'}?`,
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

      {/* Header: Back Arrow, Centered "My Queue", Notification Bell */}
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
              {/* 1. Top Live Queue Card (Ticket Number, Branch Name, Selected Service, Estimated Wait) */}
              <LiveQueueCard
                ticketNumber={ticket.ticketNumber}
                branchName={ticket.branch.name}
                serviceName={ticket.service.name}
                estimatedWaitTime={ticket.estimatedWaitTime || '03:28'}
              />

              {/* 2. Queue Status Card (Circular Gauge, Now Serving & Counter, Stepper) */}
              <QueueStatusCard
                position={ticket.peopleAhead ? ticket.peopleAhead + 1 : 3}
                peopleAhead={ticket.peopleAhead ?? 2}
                nowServingTicket={ticket.nowServingTicket || 'Ticket T-101'}
                counterNumber={ticket.counterNumber || '02'}
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
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
