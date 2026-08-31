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
import { ActiveTokenCard } from '../../../../components/employee/ActiveTokenCard';
import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { employeeApi, EmployeeTicket } from '../../../../api/employee.api';
import { branchApi } from '../../../../api/branch.api';
import { socketService } from '../../../../services/socket.service';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'SERVING', label: 'Serving' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'NO_SHOW', label: 'No Show' },
];

const SERVICE_FILTERS = [
  'All Services',
  'Account Opening',
  'ATM Card Request',
  'Cash Services',
  'Loan Consultation',
  'Forex Exchange',
  'Digital Banking',
];

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
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

  // Initialize branch
  useEffect(() => {
    async function init() {
      try {
        const res = await branchApi.getBranches({ limit: 1 });
        if (res.branches && res.branches.length > 0) {
          setBranchId(res.branches[0].id);
          setBranchName(res.branches[0].name);
        } else {
          setBranchId('branch-bole');
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

  // Trigger fetch whenever branchId or selectedStatus changes
  useEffect(() => {
    if (branchId) {
      fetchTickets();
    }
  }, [branchId, selectedStatus, fetchTickets]);

  // Reload tickets when employee navigates to this tab
  useFocusEffect(
    useCallback(() => {
      if (branchId) {
        fetchTickets();
      }
    }, [branchId, fetchTickets])
  );

  // Safety fallback to prevent infinite loading indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);


  // Real-time socket sync for live queue
  useEffect(() => {
    if (!branchId) return;

    socketService.connect();
    socketService.joinBranch(branchId);

    const unsubNewTicket = socketService.onNewTicket((newTicket: EmployeeTicket) => {
      setTickets((prev) => {
        if (prev.some((t) => t.id === newTicket.id)) return prev;
        return [newTicket, ...prev];
      });
    });

    const unsubTicketUpdated = socketService.onTicketUpdated((updatedTicket: EmployeeTicket) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
      );
    });

    return () => {
      unsubNewTicket();
      unsubTicketUpdated();
    };
  }, [branchId]);

  // Filtered tickets based on search & service filter
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerPhone?.includes(searchQuery) ||
        t.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Service filter
      const matchesService =
        selectedService === 'All Services' ||
        t.serviceName?.toLowerCase().includes(selectedService.toLowerCase()) ||
        (selectedService === 'Account Opening' && (t.serviceName?.toLowerCase().includes('account') || t.serviceName?.toLowerCase().includes('open'))) ||
        (selectedService === 'ATM Card Request' && (t.serviceName?.toLowerCase().includes('atm') || t.serviceName?.toLowerCase().includes('card'))) ||
        (selectedService === 'Cash Services' && (t.serviceName?.toLowerCase().includes('cash') || t.serviceName?.toLowerCase().includes('deposit') || t.serviceName?.toLowerCase().includes('withdraw'))) ||
        (selectedService === 'Loan Consultation' && (t.serviceName?.toLowerCase().includes('loan') || t.serviceName?.toLowerCase().includes('credit'))) ||
        (selectedService === 'Forex Exchange' && (t.serviceName?.toLowerCase().includes('forex') || t.serviceName?.toLowerCase().includes('currency') || t.serviceName?.toLowerCase().includes('exchange') || t.serviceName?.toLowerCase().includes('remittance'))) ||
        (selectedService === 'Digital Banking' && (t.serviceName?.toLowerCase().includes('digital') || t.serviceName?.toLowerCase().includes('app') || t.serviceName?.toLowerCase().includes('mobile') || t.serviceName?.toLowerCase().includes('telebirr')));

      // Status filter
      const matchesStatus =
        selectedStatus === 'ALL' || t.status === selectedStatus;

      return matchesSearch && matchesService && matchesStatus;
    });
  }, [tickets, searchQuery, selectedService, selectedStatus]);

  // Handle call next / serve
  const handleCallNext = async (ticket: EmployeeTicket) => {
    try {
      const updated = await employeeApi.updateTicketStatus(ticket.id, 'SERVING');
      if (updated) {
        setCounterStatus('Serving');
        fetchTickets(true);
        Alert.alert('Now Serving 📢', `Called token ${ticket.ticketNumber} to your counter.`);
      }
    } catch {
      Alert.alert('Error', 'Failed to call customer.');
    }
  };

  // Handle complete
  const handleComplete = async (ticket: EmployeeTicket) => {
    try {
      await employeeApi.updateTicketStatus(ticket.id, 'COMPLETED');
      setCounterStatus('Available');
      fetchTickets(true);
      Alert.alert('Completed ✅', `Token ${ticket.ticketNumber} marked as completed.`);
    } catch {
      Alert.alert('Error', 'Failed to complete ticket.');
    }
  };

  // Handle transfer
  const handleTransfer = (ticket: EmployeeTicket) => {
    Alert.alert(
      'Transfer Token 🔄',
      `Reassign token ${ticket.ticketNumber} to another department or counter.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer to Cashier',
          onPress: () => {
            Alert.alert('Transferred', `Token ${ticket.ticketNumber} routed to Cashier desk.`);
          },
        },
        {
          text: 'Transfer to Credit / Loans',
          onPress: () => {
            Alert.alert('Transferred', `Token ${ticket.ticketNumber} routed to Credit desk.`);
          },
        },
      ]
    );
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
        style={styles.screenContainer}
        contentContainerStyle={styles.scrollContent}
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
        {/* Page Title: Active Tokens */}
        <Text style={styles.pageTitle}>Active Tokens</Text>

        {/* Search Bar + Filter Options Button Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search token..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterTuneBtn}
            onPress={() => setIsFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="tune-variant" size={20} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Filter Categories Area */}
        <View style={styles.filterCategoriesContainer}>
          {/* 1. STATUS Filter Row */}
          <View style={styles.filterRow}>
            <Text style={styles.filterCategoryLabel}>STATUS:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScrollContent}
            >
              {STATUS_FILTERS.map((st) => {
                const isSelected = selectedStatus === st.id;
                return (
                  <TouchableOpacity
                    key={st.id}
                    style={[
                      styles.statusPill,
                      isSelected && styles.statusPillActive,
                    ]}
                    onPress={() => setSelectedStatus(st.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isSelected && styles.statusPillTextActive,
                      ]}
                    >
                      {st.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 2. SERVICE Filter Row */}
          <View style={[styles.filterRow, { marginTop: 12 }]}>
            <Text style={styles.filterCategoryLabel}>SERVICE:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScrollContent}
            >
              {SERVICE_FILTERS.map((srv) => {
                const isSelected = selectedService === srv;
                return (
                  <TouchableOpacity
                    key={srv}
                    style={[
                      styles.servicePill,
                      isSelected && styles.servicePillActive,
                    ]}
                    onPress={() => setSelectedService(srv)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.servicePillText,
                        isSelected && styles.servicePillTextActive,
                      ]}
                    >
                      {srv}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Divider / Spacer */}
        <View style={styles.categoryDivider} />

        {/* Active Tokens List */}
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : filteredTickets.length > 0 ? (
          <View style={styles.tokenListWrapper}>
            {filteredTickets.map((ticket) => (
              <ActiveTokenCard
                key={ticket.id}
                ticket={ticket}
                onCallNext={handleCallNext}
                onComplete={handleComplete}
                onTransfer={handleTransfer}
                onPress={(t) => setSelectedTicket(t)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateCard}>
            <MaterialCommunityIcons name="ticket-outline" size={38} color="#94A3B8" />
            <Text style={styles.emptyStateTitle}>No Active Tokens</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery
                ? 'No tokens match your search criteria.'
                : 'There are currently no active tokens in this category.'}
            </Text>
          </View>
        )}

        {/* View All Tokens Link */}
        <TouchableOpacity
          style={styles.viewAllTokensBtn}
          onPress={() => {
            setSelectedStatus('ALL');
            setSelectedService('All Services');
            setSearchQuery('');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllTokensText}>View All Tokens</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTokenBadge}>
                  <Text style={styles.modalTokenText}>{selectedTicket.ticketNumber}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedTicket(null)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalServiceTitle}>{selectedTicket.serviceName}</Text>
              <Text style={styles.modalStatusText}>Status: {selectedTicket.status}</Text>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Customer</Text>
                <Text style={styles.modalVal}>{selectedTicket.customerName || 'Walk-in Customer'}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Phone</Text>
                <Text style={styles.modalVal}>{selectedTicket.customerPhone || '—'}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Est. Wait Time</Text>
                <Text style={styles.modalVal}>~{selectedTicket.estimatedWaitMins || 5} mins</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                {selectedTicket.status === 'WAITING' && (
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#0A2540' }]}
                    onPress={() => {
                      handleCallNext(selectedTicket);
                      setSelectedTicket(null);
                    }}
                  >
                    <Text style={styles.modalBtnText}>Call & Serve Now</Text>
                  </TouchableOpacity>
                )}

                {selectedTicket.status === 'SERVING' && (
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => {
                      handleComplete(selectedTicket);
                      setSelectedTicket(null);
                    }}
                  >
                    <Text style={styles.modalBtnText}>Complete Service</Text>
                  </TouchableOpacity>
                )}

                {selectedTicket.status !== 'COMPLETED' && selectedTicket.status !== 'CANCELLED' && selectedTicket.status !== 'NO_SHOW' && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.modalBtn,
                        { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#D97706' },
                      ]}
                      onPress={async () => {
                        await employeeApi.updateTicketStatus(selectedTicket.id, 'NO_SHOW');
                        setSelectedTicket(null);
                        fetchTickets(true);
                      }}
                    >
                      <Text style={[styles.modalBtnText, { color: '#D97706' }]}>Mark as Late / No-Show</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalBtn,
                        { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#EF4444' },
                      ]}
                      onPress={async () => {
                        await employeeApi.updateTicketStatus(selectedTicket.id, 'CANCELLED');
                        setSelectedTicket(null);
                        fetchTickets(true);
                      }}
                    >
                      <Text style={[styles.modalBtnText, { color: '#EF4444' }]}>Cancel Ticket</Text>
                    </TouchableOpacity>
                  </>
                )}

                {(selectedTicket.status === 'COMPLETED' || selectedTicket.status === 'CANCELLED' || selectedTicket.status === 'NO_SHOW') && (
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]}
                    onPress={() => setSelectedTicket(null)}
                  >
                    <Text style={[styles.modalBtnText, { color: '#334155' }]}>Close</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Quick Filter Modal */}
      {isFilterModalVisible && (
        <Modal visible={true} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsFilterModalVisible(false)}
          >
            <View style={styles.filterModalCard}>
              <Text style={styles.filterModalTitle}>Filter Active Tokens</Text>

              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterModalGrid}>
                {STATUS_FILTERS.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.filterModalPill,
                      selectedStatus === s.id && styles.filterModalPillActive,
                    ]}
                    onPress={() => {
                      setSelectedStatus(s.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterModalPillText,
                        selectedStatus === s.id && styles.filterModalPillTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.filterSectionTitle, { marginTop: 14 }]}>Service Category</Text>
              <View style={styles.filterModalGrid}>
                {SERVICE_FILTERS.map((srv) => (
                  <TouchableOpacity
                    key={srv}
                    style={[
                      styles.filterModalPill,
                      selectedService === srv && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                    ]}
                    onPress={() => {
                      setSelectedService(srv);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterModalPillText,
                        selectedService === srv && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {srv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.applyFilterBtn}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.applyFilterBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A2540', // Navy blue
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterTuneBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCategoriesContainer: {
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterCategoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    width: 68,
  },
  pillsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  statusPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusPillActive: {
    backgroundColor: '#0A2540', // Dark navy
    borderColor: '#0A2540',
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  statusPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  servicePill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  servicePillActive: {
    backgroundColor: '#EE7D17', // Brand orange
    borderColor: '#EE7D17',
  },
  servicePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  servicePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
    marginBottom: 14,
  },
  tokenListWrapper: {
    marginBottom: 16,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  viewAllTokensBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  viewAllTokensText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A2540', // Deep Navy
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTokenBadge: {
    backgroundColor: '#EBF3FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalTokenText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2540',
  },
  modalServiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalStatusText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    marginTop: 2,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  modalVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalActions: {
    marginTop: 20,
    gap: 10,
    marginBottom: 10,
  },
  modalBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  filterModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  filterModalPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterModalPillActive: {
    backgroundColor: '#0A2540',
    borderColor: '#0A2540',
  },
  filterModalPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterModalPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  applyFilterBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  applyFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
