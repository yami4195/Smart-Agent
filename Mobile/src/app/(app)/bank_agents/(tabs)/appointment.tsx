import React, { useState, useCallback, useEffect } from 'react';
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
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { EmployeeHeader, CounterStatus } from '../../../../components/employee/EmployeeHeader';
import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { branchApi } from '../../../../api/branch.api';
import {agentsStyles} from '../../../../../assets/styles/agents.styles';

export interface AppointmentItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  serviceName: string;
  appointmentTime: string;
  date: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

const APPOINTMENT_FILTERS = ['ALL', 'SCHEDULED', 'CHECKED_IN', 'COMPLETED'];

export default function AppointmentScreen() {
  const [branchId, setBranchId] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('Bole Medhanialem Branch');
  const [counterStatus, setCounterStatus] = useState<CounterStatus>('Available');

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  // Initialize branch info
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
      } finally {
        setLoading(false);
      }
    }
    initBranch();
  }, []);

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      // Currently empty state as no mock data requested
      setAppointments([]);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const filteredAppointments = appointments.filter((item) => {
    const matchesFilter = selectedFilter === 'ALL' || item.status === selectedFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={commonStyles.safeArea}>
      {/* Header */}
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
            onRefresh={() => fetchAppointments(true)}
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
            placeholder="Search appointment or customer..."
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

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={employeeStyles.filterPillsScroll}
        >
          {APPOINTMENT_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                employeeStyles.filterPill,
                selectedFilter === f && employeeStyles.filterPillActive,
              ]}
              onPress={() => setSelectedFilter(f)}
            >
              <Text
                style={[
                  employeeStyles.filterPillText,
                  selectedFilter === f && employeeStyles.filterPillTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Header */}
        <View style={employeeStyles.sectionHeaderRow}>
          <Text style={employeeStyles.overviewTitle}>Scheduled Appointments</Text>
          <Text style={employeeStyles.overviewDateText}>
            {filteredAppointments.length} Booked
          </Text>
        </View>

        {/* Appointments List or Clean Empty State */}
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <TouchableOpacity
              key={apt.id}
              style={agentsStyles.appointmentCard}
              onPress={() => setSelectedAppointment(apt)}
              activeOpacity={0.7}
            >
              <View style={agentsStyles.appointmentTimeBox}>
                <Feather name="clock" size={14} color={COLORS.primary} />
                <Text style={agentsStyles.appointmentTimeText}>{apt.appointmentTime}</Text>
              </View>

              <View style={agentsStyles.appointmentDetails}>
                <Text style={agentsStyles.appointmentCustomerName}>{apt.customerName}</Text>
                <Text style={agentsStyles.appointmentService}>{apt.serviceName}</Text>
              </View>

              <View style={agentsStyles.appointmentStatusBadge}>
                <Text style={agentsStyles.appointmentStatusText}>{apt.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[employeeStyles.cleanEmptyState, agentsStyles.emptyCard]}>
            <View style={agentsStyles.emptyIconCircle}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={32} color="#94A3B8" />
            </View>
            <Text style={employeeStyles.cleanEmptyTitle}>No Appointments Scheduled</Text>
            <Text style={employeeStyles.cleanEmptySub}>
              There are currently no customer appointments booked for this branch.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Modal visible={true} transparent animationType="slide">
          <View style={agentsStyles.modalOverlay}>
            <View style={agentsStyles.modalContent}>
              <View style={agentsStyles.modalHeader}>
                <Text style={agentsStyles.modalTitle}>Appointment Details</Text>
                <TouchableOpacity onPress={() => setSelectedAppointment(null)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={agentsStyles.modalRow}>
                <Text style={agentsStyles.modalLabel}>Customer</Text>
                <Text style={agentsStyles.modalVal}>{selectedAppointment.customerName}</Text>
              </View>

              <View style={agentsStyles.modalRow}>
                <Text style={agentsStyles.modalLabel}>Service</Text>
                <Text style={agentsStyles.modalVal}>{selectedAppointment.serviceName}</Text>
              </View>

              <View style={agentsStyles.modalRow}>
                <Text style={agentsStyles.modalLabel}>Scheduled Time</Text>
                <Text style={agentsStyles.modalVal}>{selectedAppointment.appointmentTime}</Text>
              </View>

              <View style={agentsStyles.modalRow}>
                <Text style={agentsStyles.modalLabel}>Status</Text>
                <Text style={agentsStyles.modalVal}>{selectedAppointment.status}</Text>
              </View>

              <TouchableOpacity
                style={agentsStyles.closeModalBtn}
                onPress={() => setSelectedAppointment(null)}
              >
                <Text style={agentsStyles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
