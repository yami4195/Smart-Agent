import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  EmployeeHeader,
  NowServingCard,
  CallNextCard,
  QueueTicketItem,
  StatCard,
  WalkInModal,
  CounterStatus,
} from '../../../../components/employee';
import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { employeeApi, EmployeeTicket, EmployeeStats } from '../../../../api/employee.api';
import { branchApi } from '../../../../api/branch.api';

export default function CounterDeskScreen() {
  const router = useRouter();

  // Active teller session state
  const [branchId, setBranchId] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('Wegagen - Bole Branch');
  const [counterNumber, setCounterNumber] = useState<string>('01');
  const [counterStatus, setCounterStatus] = useState<CounterStatus>('Available');

  // Queue state
  const [currentlyServing, setCurrentlyServing] = useState<EmployeeTicket | null>(null);
  const [waitingTickets, setWaitingTickets] = useState<EmployeeTicket[]>([]);
  const [stats, setStats] = useState<EmployeeStats>({
    totalWaiting: 0,
    totalServing: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    totalServedToday: 0,
    avgWaitMins: 0,
    avgServiceMins: 3.5,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [callingNext, setCallingNext] = useState<boolean>(false);
  const [isWalkInModalVisible, setIsWalkInModalVisible] = useState<boolean>(false);

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
        // Fallback default
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

      // Determine currently serving ticket at this counter or overall
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

  // 1. Call Next Customer
  const handleCallNext = async () => {
    if (!branchId) return;

    try {
      setCallingNext(true);
      const result = await employeeApi.callNextTicket(branchId, undefined, counterNumber);

      if (result.hasTicket && result.ticket) {
        setCurrentlyServing(result.ticket);
        setCounterStatus('Serving');
        // Refresh waiting list
        fetchDeskData(true);
      } else {
        Alert.alert('Queue Empty', 'There are no waiting customers in the queue.');
      }
    } catch {
      Alert.alert('Error', 'Failed to call next customer.');
    } finally {
      setCallingNext(false);
    }
  };

  // 2. Complete Serving
  const handleCompleteServing = async (ticketId: string) => {
    try {
      await employeeApi.updateTicketStatus(ticketId, 'COMPLETED');
      setCurrentlyServing(null);
      setCounterStatus('Available');
      fetchDeskData(true);
      Alert.alert('Service Completed', 'Customer ticket has been completed successfully.');
    } catch {
      Alert.alert('Error', 'Could not complete ticket.');
    }
  };

  // 3. No-Show
  const handleNoShow = async (ticketId: string) => {
    try {
      await employeeApi.updateTicketStatus(ticketId, 'CANCELLED');
      setCurrentlyServing(null);
      setCounterStatus('Available');
      fetchDeskData(true);
      Alert.alert('Ticket Cancelled', 'Marked customer as No-Show.');
    } catch {
      Alert.alert('Error', 'Could not cancel ticket.');
    }
  };

  // 4. Serve directly from waiting list
  const handleServeDirect = async (ticket: EmployeeTicket) => {
    try {
      const updated = await employeeApi.updateTicketStatus(ticket.id, 'SERVING');
      if (updated) {
        setCurrentlyServing(updated);
        setCounterStatus('Serving');
        fetchDeskData(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to serve ticket.');
    }
  };

  // 5. Issue Walk-in ticket
  const handleIssueWalkIn = async (payload: {
    customerName: string;
    phone: string;
    serviceName: string;
  }) => {
    if (!branchId) return;

    const newTicket = await employeeApi.createWalkInTicket({
      branchId,
      customerName: payload.customerName,
      phone: payload.phone,
    });

    Alert.alert(
      'Token Issued 🎫',
      `Walk-in Ticket ${newTicket?.ticketNumber || 'issued'} generated for ${payload.serviceName}.`
    );

    fetchDeskData(true);
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* 1. Counter Top Header */}
      <EmployeeHeader
        branchName={branchName}
        counterNumber={counterNumber}
        status={counterStatus}
        onStatusChange={(newStatus) => setCounterStatus(newStatus)}
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
        {/* 2. Now Serving Hero Card (if active ticket) */}
        {currentlyServing ? (
          <NowServingCard
            ticket={currentlyServing}
            counterNumber={counterNumber}
            onComplete={handleCompleteServing}
            onNoShow={handleNoShow}
          />
        ) : (
          /* 3. Call Next Action Card (when counter is free) */
          <CallNextCard
            waitingCount={waitingTickets.length}
            calling={callingNext}
            onCallNext={handleCallNext}
            disabled={counterStatus === 'On Break'}
          />
        )}

        {/* 4. Shift Statistics Summary Grid */}
        <View style={employeeStyles.statsGrid}>
          <StatCard
            label="SERVED TODAY"
            value={stats.totalServedToday || 0}
            hint="Completed tickets"
            valueColor="#10B981"
          />
          <StatCard
            label="IN LINE"
            value={waitingTickets.length}
            hint="Waiting customers"
            valueColor={COLORS.primary}
          />
          <StatCard
            label="EST. WAIT TIME"
            value={`${stats.avgWaitMins || 4}m`}
            hint="Average queue delay"
          />
          <StatCard
            label="AVG HANDLE"
            value={`${stats.avgServiceMins || 3.5}m`}
            hint="Per transaction"
          />
        </View>

        {/* 5. Quick Actions Bar */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
            onPress={() => setIsWalkInModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={COLORS.primary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', marginLeft: 6 }}>
              Issue Walk-in
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
            onPress={() => router.push('/(app)/bank_agents/(tabs)/queue')}
            activeOpacity={0.8}
          >
            <Feather name="list" size={18} color={COLORS.primary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', marginLeft: 6 }}>
              Full Branch Queue
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6. Upcoming Customers Section */}
        <View style={employeeStyles.sectionHeader}>
          <Text style={employeeStyles.sectionTitle}>Next in Line</Text>
          <Text style={employeeStyles.sectionCount}>{waitingTickets.length} waiting</Text>
        </View>

        {loading && !refreshing ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : waitingTickets.length > 0 ? (
          waitingTickets.slice(0, 5).map((ticket) => (
            <QueueTicketItem
              key={ticket.id}
              ticket={ticket}
              onServe={handleServeDirect}
              showServeAction={!currentlyServing}
            />
          ))
        ) : (
          <View style={employeeStyles.emptyState}>
            <MaterialCommunityIcons name="check-all" size={32} color="#10B981" />
            <Text style={employeeStyles.emptyTitle}>Queue is Clean</Text>
            <Text style={employeeStyles.emptySubtitle}>
              All customers have been served or no new tokens have been requested.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Issue Walk-in Modal */}
      <WalkInModal
        visible={isWalkInModalVisible}
        onClose={() => setIsWalkInModalVisible(false)}
        onSubmit={handleIssueWalkIn}
      />
    </View>
  );
}
