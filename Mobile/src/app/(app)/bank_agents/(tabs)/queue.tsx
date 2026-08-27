import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { EmployeeHeader, CounterStatus } from '../../../../components/employee/EmployeeHeader';
import { QueueTicketItem } from '../../../../components/employee/QueueTicketItem';
import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { employeeApi, EmployeeTicket } from '../../../../api/employee.api';
import { branchApi } from '../../../../api/branch.api';
import { agentsStyles } from '../../../../../assets/styles/agents.styles';

const STATUS_FILTERS = ['ALL', 'WAITING', 'SERVING', 'COMPLETED', 'CANCELLED'];
const SERVICE_FILTERS = ['All Services', 'Teller Services', 'Forex / FX', 'Account Opening'];

export default function LiveQueueScreen() {
  const [branchId, setBranchId] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('Bole Medhanialem Branch');
  const [counterStatus, setCounterStatus] = useState<CounterStatus>('Available');

  const [tickets, setTickets] = useState<EmployeeTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('All Services');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<EmployeeTicket | null>(null);

  // Initialize branch
  useEffect(() => {
    async function init() {
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
    init();
  }, []);

  // Fetch branch tickets
  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (!branchId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const list = await employeeApi.getBranchTickets(
        branchId,
        selectedStatus !== 'ALL' ? selectedStatus : undefined
      );
      setTickets(list);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [branchId, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      if (branchId) {
        fetchTickets();
      }
    }, [branchId, fetchTickets])
  );

  // Filtered tickets based on search & service filter
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerPhone.includes(searchQuery);

      // Service filter
      const matchesService =
        selectedService === 'All Services' ||
        t.serviceName.toLowerCase().includes(selectedService.toLowerCase());

      return matchesSearch && matchesService;
    });
  }, [tickets, searchQuery, selectedService]);

  // Handle direct serve
  const handleServe = async (ticket: EmployeeTicket) => {
    try {
      await employeeApi.updateTicketStatus(ticket.id, 'SERVING');
      setSelectedTicket(null);
      fetchTickets(true);
      Alert.alert('Now Serving', `Customer with ticket ${ticket.ticketNumber} is now being served.`);
    } catch {
      Alert.alert('Error', 'Failed to serve ticket.');
    }
  };

  // Handle complete
  const handleComplete = async (ticket: EmployeeTicket) => {
    try {
      await employeeApi.updateTicketStatus(ticket.id, 'COMPLETED');
      setSelectedTicket(null);
      fetchTickets(true);
      Alert.alert('Completed', `Ticket ${ticket.ticketNumber} marked as completed.`);
    } catch {
      Alert.alert('Error', 'Failed to complete ticket.');
    }
  };

  // Handle cancel
  const handleCancel = async (ticket: EmployeeTicket) => {
    try {
      await employeeApi.updateTicketStatus(ticket.id, 'CANCELLED');
      setSelectedTicket(null);
      fetchTickets(true);
      Alert.alert('Cancelled', `Ticket ${ticket.ticketNumber} marked as cancelled.`);
    } catch {
      Alert.alert('Error', 'Failed to cancel ticket.');
    }
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* Top Header */}
      <EmployeeHeader
        branchName={branchName}
        status={counterStatus}
        onStatusChange={(s) => setCounterStatus(s)}
      />

      <ScrollView
        style={employeeStyles.screenContainer}
        contentContainerStyle={employeeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTickets(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={employeeStyles.searchBarContainer}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={employeeStyles.searchInput}
            placeholder="Search ticket #, name, or phone..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={employeeStyles.filterPillsScroll}
        >
          {STATUS_FILTERS.map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                employeeStyles.filterPill,
                selectedStatus === st && employeeStyles.filterPillActive,
              ]}
              onPress={() => setSelectedStatus(st)}
            >
              <Text
                style={[
                  employeeStyles.filterPillText,
                  selectedStatus === st && employeeStyles.filterPillTextActive,
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Service Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[employeeStyles.filterPillsScroll, { marginBottom: 16 }]}
        >
          {SERVICE_FILTERS.map((srv) => (
            <TouchableOpacity
              key={srv}
              style={[
                employeeStyles.filterPill,
                selectedService === srv && employeeStyles.filterPillActive,
              ]}
              onPress={() => setSelectedService(srv)}
            >
              <Text
                style={[
                  employeeStyles.filterPillText,
                  selectedService === srv && employeeStyles.filterPillTextActive,
                ]}
              >
                {srv}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Header */}
        <View style={employeeStyles.sectionHeader}>
          <Text style={employeeStyles.sectionTitle}>Queue Tickets</Text>
          <Text style={employeeStyles.sectionCount}>{filteredTickets.length} found</Text>
        </View>

        {/* Tickets List */}
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <QueueTicketItem
              key={ticket.id}
              ticket={ticket}
              onServe={handleServe}
              onPress={(t) => setSelectedTicket(t)}
            />
          ))
        ) : (
          <View style={employeeStyles.emptyState}>
            <MaterialCommunityIcons name="ticket-outline" size={36} color="#94A3B8" />
            <Text style={employeeStyles.emptyTitle}>No Matching Tickets</Text>
            <Text style={employeeStyles.emptySubtitle}>
              {searchQuery
                ? 'No tickets match your search filters.'
                : 'No active tickets under this category.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <Modal visible={true} transparent animationType="slide">
          <View style={agentsStyles.modalOverlay}>
            <View style={agentsStyles.modalCard}>
              <View style={agentsStyles.modalHeader}>
                <View style={agentsStyles.modalTokenBadge}>
                  <Text style={agentsStyles.modalTokenText}>{selectedTicket.ticketNumber}</Text>
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

              <View style={agentsStyles.modalDetailRow}>
                <Text style={agentsStyles.modalLabel}>Customer</Text>
                <Text style={agentsStyles.modalVal}>{selectedTicket.customerName || 'Walk-in Customer'}</Text>
              </View>

              <View style={agentsStyles.modalDetailRow}>
                <Text style={agentsStyles.modalLabel}>Phone</Text>
                <Text style={agentsStyles.modalVal}>{selectedTicket.customerPhone || '—'}</Text>
              </View>

              <View style={agentsStyles.modalDetailRow}>
                <Text style={agentsStyles.modalLabel}>Booked At</Text>
                <Text style={agentsStyles.modalVal}>
                  {new Date(selectedTicket.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={agentsStyles.modalActions}>
                {selectedTicket.status === 'WAITING' && (
                  <TouchableOpacity
                    style={[agentsStyles.modalBtn, { backgroundColor: COLORS.primary }]}
                    onPress={() => handleServe(selectedTicket)}
                  >
                    <Text style={agentsStyles.modalBtnText}>Call & Serve Now</Text>
                  </TouchableOpacity>
                )}

                {selectedTicket.status === 'SERVING' && (
                  <TouchableOpacity
                    style={[agentsStyles.modalBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => handleComplete(selectedTicket)}
                  >
                    <Text style={agentsStyles.modalBtnText}>Complete Service</Text>
                  </TouchableOpacity>
                )}

                {selectedTicket.status !== 'COMPLETED' && selectedTicket.status !== 'CANCELLED' && (
                  <TouchableOpacity
                    style={[agentsStyles.modalBtn, { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#EF4444' }]}
                    onPress={() => handleCancel(selectedTicket)}
                  >
                    <Text style={[agentsStyles.modalBtnText, { color: '#EF4444' }]}>Cancel / No-Show</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
