import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EmployeeHeader, CounterStatus } from '../../../../components/employee/EmployeeHeader';
import { StatCard } from '../../../../components/employee/StatCard';
import { QueueTicketItem } from '../../../../components/employee/QueueTicketItem';
import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { employeeApi, EmployeeTicket, EmployeeStats } from '../../../../api/employee.api';
import { branchApi } from '../../../../api/branch.api';
import { agentsStyles } from '../../../../../assets/styles/agents.styles';
export default function EmployeeDashboardScreen() {
  const router = useRouter();

  // Active teller session state
  const [branchId, setBranchId] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('Bole Medhanialem Branch');
  const [counterNumber, setCounterNumber] = useState<string>('01');
  const [counterStatus, setCounterStatus] = useState<CounterStatus>('Available');

  // Queue state
  const [currentlyServing, setCurrentlyServing] = useState<EmployeeTicket | null>(null);
  const [waitingTickets, setWaitingTickets] = useState<EmployeeTicket[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [stats, setStats] = useState<EmployeeStats>({
    totalWaiting: 0,
    totalServing: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    totalServedToday: 0,
    avgWaitMins: 0,
    avgServiceMins: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [callingNext, setCallingNext] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<EmployeeTicket | null>(null);

  // Initialize branch
  useEffect(() => {
    async function initBranch() {
      try {
        const res = await branchApi.getBranches({ limit: 1 });
        if (res.branches && res.branches.length > 0) {
          setBranchId(res.branches[0].id);
          setBranchName(res.branches[0].name);
        }
      } catch {
        setBranchId('branch-bole');
      }
    }
    initBranch();
  }, []);

  // Fetch queue data for desk
  const fetchDeskData = useCallback(async (isRefresh = false) => {
    if (!branchId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch all tickets for this branch
      const [allTickets, branchStats] = await Promise.all([
        employeeApi.getBranchTickets(branchId),
        employeeApi.getEmployeeStats(branchId),
      ]);

      const serving = allTickets.find((t) => t.status === 'SERVING') || null;
      const waiting = allTickets.filter((t) => t.status === 'WAITING');

      setCurrentlyServing(serving);
      setWaitingTickets(waiting);
      setStats(branchStats);
      if (serving) {
        setCounterStatus('Serving');
      } else if (counterStatus === 'Serving') {
        setCounterStatus('Available');
      }
    } catch (err) {
      console.warn('Failed to load desk data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [branchId, counterStatus]);

  useFocusEffect(
    useCallback(() => {
      if (branchId) {
        fetchDeskData();
      }
    }, [branchId, fetchDeskData])
  );

  // Call Next Customer
  const handleCallNext = async () => {
    if (!branchId) return;

    if (waitingTickets.length === 0) {
      Alert.alert('Queue Empty', 'There are no waiting customers currently in line.');
      return;
    }

    try {
      setCallingNext(true);
      const result = await employeeApi.callNextTicket(branchId, undefined, counterNumber);

      if (result.hasTicket && result.ticket) {
        setCurrentlyServing(result.ticket);
        setCounterStatus('Serving');
        fetchDeskData(true);
        Alert.alert(
          'Customer Called 📢',
          `Ticket ${result.ticket.ticketNumber} called to Counter ${counterNumber}.`
        );
      } else {
        Alert.alert('Queue Empty', 'There are no waiting customers in the queue.');
      }
    } catch {
      Alert.alert('Error', 'Failed to call next customer.');
    } finally {
      setCallingNext(false);
    }
  };

  // Complete Serving
  const handleCompleteServing = async (ticketId: string) => {
    try {
      await employeeApi.updateTicketStatus(ticketId, 'COMPLETED');
      setCurrentlyServing(null);
      setSelectedTicket(null);
      setCounterStatus('Available');
      fetchDeskData(true);
      Alert.alert('Service Completed', 'Customer ticket has been completed successfully.');
    } catch {
      Alert.alert('Error', 'Could not complete ticket.');
    }
  };

  // Cancel / No-Show
  const handleCancelTicket = async (ticketId: string) => {
    try {
      await employeeApi.updateTicketStatus(ticketId, 'CANCELLED');
      if (currentlyServing?.id === ticketId) {
        setCurrentlyServing(null);
        setCounterStatus('Available');
      }
      setSelectedTicket(null);
      fetchDeskData(true);
      Alert.alert('Ticket Cancelled', 'Marked customer ticket as cancelled / no-show.');
    } catch {
      Alert.alert('Error', 'Could not cancel ticket.');
    }
  };

  // Serve specific ticket
  const handleServeTicket = async (ticket: EmployeeTicket) => {
    try {
      const updated = await employeeApi.updateTicketStatus(ticket.id, 'SERVING');
      if (updated) {
        setCurrentlyServing(updated);
        setCounterStatus('Serving');
        setSelectedTicket(null);
        fetchDeskData(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to serve ticket.');
    }
  };

  // Format today's date (e.g. "Oct 24, 2023")
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <View style={commonStyles.safeArea}>
      {/* 1. Top Header with Bank Icon, Assigned Branch, Status Pill & Notifications */}
      <EmployeeHeader
        branchName={branchName}
        counterNumber={counterNumber}
        status={counterStatus}
        onStatusChange={(newStatus) => setCounterStatus(newStatus)}
        onNotificationPress={() => Alert.alert('Notifications', 'No new branch notifications.')}
      />

      <ScrollView
        style={employeeStyles.screenContainer}
        contentContainerStyle={employeeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDeskData(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 2. Today's Overview Section Header */}
        <View style={employeeStyles.sectionHeaderRow}>
          <Text style={employeeStyles.overviewTitle}>Today's Overview</Text>
          <Text style={employeeStyles.overviewDateText}>{todayFormatted}</Text>
        </View>

        {/* 3. 2x2 Overview Stat Cards Grid */}
        <View style={employeeStyles.overviewGrid}>
          {/* Card 1: Total Served */}
          <StatCard
            icon={
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color="#334155"
              />
            }
            label="Total Served"
            value={stats.totalServedToday || 0}
            trend={stats.totalServedToday > 0 ? '+12%' : undefined}
          />

          {/* Card 2: Pending Queue */}
          <StatCard
            icon={
              <MaterialCommunityIcons
                name="timer-sand"
                size={20}
                color="#D97706"
              />
            }
            label="Pending Queue"
            value={waitingTickets.length}
            subtext={
              waitingTickets.length > 0
                ? `Avg ${stats.avgWaitMins || 12}m wait`
                : 'Avg 0m wait'
            }
          />

          {/* Card 3: Appointments */}
          <StatCard
            icon={
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={20}
                color="#334155"
              />
            }
            label="Appointments"
            value={appointmentsCount}
            subtext={`${appointmentsCount} remaining`}
          />

          {/* Card 4: Avg Wait Time */}
          <StatCard
            icon={<Feather name="clock" size={18} color="#334155" />}
            label="Avg Wait Time"
            value={waitingTickets.length > 0 ? `${stats.avgWaitMins || 14}m` : '0m'}
            subtext="Today"
          />
        </View>

        {/* 4. Next in Queue Card */}
        <View style={employeeStyles.nextInQueueContainer}>
          {/* Header with View All */}
          <View style={employeeStyles.nextInQueueHeader}>
            <Text style={employeeStyles.nextInQueueTitle}>Next in Queue</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/bank_agents/(tabs)/queue')}
              activeOpacity={0.7}
            >
              <Text style={employeeStyles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Main Call Next Button */}
          <TouchableOpacity
            style={employeeStyles.callNextBannerBtn}
            onPress={handleCallNext}
            disabled={waitingTickets.length === 0 || callingNext}
            activeOpacity={0.85}
          >
            {callingNext ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="megaphone-outline" size={19} color="#FFFFFF" />
                <Text style={employeeStyles.callNextBannerText}>
                  Call Next ({waitingTickets.length} Waiting)
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Ticket List or Clean Empty State */}
          {loading && !refreshing ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : waitingTickets.length > 0 ? (
            <View style={employeeStyles.ticketListWrapper}>
              {waitingTickets.slice(0, 3).map((ticket) => (
                <QueueTicketItem
                  key={ticket.id}
                  ticket={ticket}
                  actionText="Details"
                  onPress={(t) => setSelectedTicket(t)}
                  onActionPress={(t) => setSelectedTicket(t)}
                />
              ))}
            </View>
          ) : (
            <View style={employeeStyles.cleanEmptyState}>
              <MaterialCommunityIcons name="ticket-outline" size={32} color="#94A3B8" />
              <Text style={employeeStyles.cleanEmptyTitle}>No Customers in Queue</Text>
              <Text style={employeeStyles.cleanEmptySub}>
                Waiting tickets will automatically appear here when customers check in.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <Modal visible={true} transparent animationType="slide">
          <View style={agentsStyles.modalOverlay}>
            <View style={agentsStyles.modalContent}>
              <View style={agentsStyles.modalHeader}>
                <View style={agentsStyles.modalTokenBadge}>
                  <Text style={agentsStyles.modalTokenBadgeText}>{selectedTicket.ticketNumber}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedTicket(null)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={agentsStyles.modalServiceTitle}>{selectedTicket.serviceName}</Text>
              <Text style={agentsStyles.modalStatusText}>Status: {selectedTicket.status}</Text>

              <View style={agentsStyles.modalRow}>
                <Text style={agentsStyles.modalLabel}>Customer</Text>
                <Text style={agentsStyles.modalVal}>{selectedTicket.customerName || 'Walk-in Customer'}</Text>
              </View>

              <View style={agentsStyles.modalRow}>
                <Text style={agentsStyles.modalLabel}>Est. Wait Time</Text>
                <Text style={agentsStyles.modalVal}>~{selectedTicket.estimatedWaitMins || 5} mins</Text>
              </View>

              <View style={agentsStyles.modalRow}>
                <Text style={agentsStyles.modalLabel}>Branch</Text>
                <Text style={agentsStyles.modalVal}>{branchName}</Text>
              </View>

              {/* Action Buttons */}
              <View style={agentsStyles.modalActions}>
                {selectedTicket.status === 'WAITING' && (
                  <TouchableOpacity
                    style={[agentsStyles.modalActionBtn, { backgroundColor: COLORS.primary }]}
                    onPress={() => handleServeTicket(selectedTicket)}
                  >
                    <Text style={agentsStyles.modalActionBtnText}>Serve Now</Text>
                  </TouchableOpacity>
                )}

                {selectedTicket.status === 'SERVING' && (
                  <TouchableOpacity
                    style={[agentsStyles.modalActionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => handleCompleteServing(selectedTicket.id)}
                  >
                    <Text style={agentsStyles.modalActionBtnText}>Complete Service</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    agentsStyles.modalActionBtn,
                    { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#EF4444' },
                  ]}
                  onPress={() => handleCancelTicket(selectedTicket.id)}
                >
                  <Text style={[agentsStyles.modalActionBtnText, { color: '#EF4444' }]}>
                    Cancel / No-Show
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
 
});
