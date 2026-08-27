import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { EmployeeHeader } from '../../../../components/employee/EmployeeHeader';
import { userApi, UserData } from '../../../../api/user.api';
import { employeeApi, EmployeeStats, EmployeeHistoryItem } from '../../../../api/employee.api';
import { branchApi } from '../../../../api/branch.api';
import { agentsStyles } from '../../../../../assets/styles/agents.styles';

export default function EmployeeProfileScreen() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const [branchId, setBranchId] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('Bole Medhanialem Branch');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Queue History Management Modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<EmployeeHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Initialize branch and profile data
  const fetchProfileAndStats = useCallback(async () => {
    try {
      setLoading(true);

      let activeBranchId = 'branch-bole';
      let activeBranchName = 'Bole Medhanialem Branch';

      try {
        const branchesRes = await branchApi.getBranches({ limit: 1 });
        if (branchesRes.branches && branchesRes.branches.length > 0) {
          activeBranchId = branchesRes.branches[0].id;
          activeBranchName = branchesRes.branches[0].name;
          setBranchId(activeBranchId);
          setBranchName(activeBranchName);
        }
      } catch {
        setBranchId(activeBranchId);
      }

      const [u, s] = await Promise.all([
        userApi.getMe(),
        employeeApi.getEmployeeStats(activeBranchId),
      ]);
      setUserData(u);
      setStats(s);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndStats();
  }, [fetchProfileAndStats]);

  // Load employee personal queue history
  const loadEmployeeHistory = async () => {
    try {
      setLoadingHistory(true);
      setIsHistoryModalOpen(true);
      const items = await employeeApi.getEmployeeHistory(branchId || undefined);
      setHistoryItems(items);
    } catch {
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete / Archive item from personal history
  const handleDeleteHistoryItem = (item: EmployeeHistoryItem) => {
    Alert.alert(
      'Remove from Personal History',
      `Remove record for ticket ${item.ticketNumber} from your history view? Global banking logs will remain preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeeApi.archiveHistoryTicket(item.id);
              setHistoryItems((prev) => prev.filter((h) => h.id !== item.id));
              Alert.alert('Record Removed', 'The item was removed from your history list.');
            } catch {
              Alert.alert('Error', 'Failed to remove history record.');
            }
          },
        },
      ]
    );
  };

  const fullName = (() => {
    if (userData?.firstName || userData?.lastName) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    if (clerkUser?.firstName || clerkUser?.lastName) {
      return `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    }
    return 'Bank Agent';
  })();

  const email =
    userData?.email || clerkUser?.primaryEmailAddress?.emailAddress || 'agent@wegagenbank.com';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of the Agent Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('Error', 'Could not sign out.');
          }
        },
      },
    ]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#ECFDF5', text: '#10B981', label: 'Completed' };
      case 'CANCELLED':
        return { bg: '#FEF2F2', text: '#EF4444', label: 'Cancelled' };
      case 'NO_SHOW':
        return { bg: '#FFFBEB', text: '#D97706', label: 'Late / No-Show' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', label: status };
    }
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* Top Header */}
      <EmployeeHeader
        branchName={branchName}
        status="Available"
      />

      <ScrollView
        style={employeeStyles.screenContainer}
        contentContainerStyle={employeeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Agent Info Card */}
        <View style={agentsStyles.profileCard}>
          <View style={agentsStyles.avatarCircle}>
            <Text style={agentsStyles.avatarText}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={agentsStyles.profileName}>{fullName}</Text>
          <Text style={agentsStyles.profileEmail}>{email}</Text>

          <View style={agentsStyles.roleBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
            <Text style={agentsStyles.roleBadgeText}>AUTHORIZED TELLER</Text>
          </View>
        </View>

        {/* 2. Assigned Workstation Section */}
        <Text style={employeeStyles.sectionTitle}>Workstation Assignment</Text>
        <View style={agentsStyles.cardContainer}>
          <View style={agentsStyles.infoRow}>
            <View style={agentsStyles.infoIconBox}>
              <Ionicons name="business" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={agentsStyles.infoLabel}>Assigned Branch</Text>
              <Text style={agentsStyles.infoValue}>{branchName}</Text>
            </View>
          </View>

          <View style={agentsStyles.divider} />

          <View style={agentsStyles.infoRow}>
            <View style={agentsStyles.infoIconBox}>
              <MaterialCommunityIcons name="laptop" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={agentsStyles.infoLabel}>Counter / Window</Text>
              <Text style={agentsStyles.infoValue}>Counter 01 • Teller Desk</Text>
            </View>
          </View>

          <View style={agentsStyles.divider} />

          <View style={agentsStyles.infoRow}>
            <View style={agentsStyles.infoIconBox}>
              <Feather name="clock" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={agentsStyles.infoLabel}>Active Shift</Text>
              <Text style={agentsStyles.infoValue}>Full Shift (8:00 AM - 5:00 PM)</Text>
            </View>
          </View>
        </View>

        {/* 3. Performance Summary (Fixed Today's Completed Counter) */}
        <Text style={[employeeStyles.sectionTitle, { marginTop: 16 }]}>Today's Performance</Text>
        <View style={employeeStyles.statsGrid}>
          <View style={employeeStyles.statCard}>
            <Text style={employeeStyles.statLabel}>TODAY'S COMPLETED</Text>
            <Text style={[employeeStyles.statValue, { color: '#10B981' }]}>
              {stats?.totalServedToday ?? 0}
            </Text>
            <Text style={employeeStyles.statHint}>Customers served today</Text>
          </View>

          <View style={employeeStyles.statCard}>
            <Text style={employeeStyles.statLabel}>AVG HANDLE TIME</Text>
            <Text style={employeeStyles.statValue}>{stats?.avgServiceMins || 3.5}m</Text>
            <Text style={employeeStyles.statHint}>Target: &lt; 5 mins</Text>
          </View>
        </View>

        {/* 4. Queue History Management Button */}
        <Text style={[employeeStyles.sectionTitle, { marginTop: 16 }]}>Queue Record Management</Text>
        <TouchableOpacity
          style={styles.manageHistoryBtn}
          onPress={loadEmployeeHistory}
          activeOpacity={0.8}
        >
          <View style={styles.manageHistoryLeft}>
            <View style={styles.manageHistoryIconBox}>
              <MaterialCommunityIcons name="history" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.manageHistoryTitle}>Queue History & Archiving</Text>
              <Text style={styles.manageHistorySubtitle}>
                Review handled tickets and clear personal history clutter
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* 5. Sign Out Button */}
        <TouchableOpacity
          style={agentsStyles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={agentsStyles.signOutButtonText}>Sign Out from Agent Portal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Employee Queue History Management Modal */}
      {isHistoryModalOpen && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="history" size={20} color="#0A2540" />
                  <Text style={styles.modalHeaderTitle}>Handled Queue History</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsHistoryModalOpen(false)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubHeader}>
                Completed and cancelled records for your counter. You can dismiss individual records from your view.
              </Text>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {loadingHistory ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : historyItems.length > 0 ? (
                  historyItems.map((item) => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <View key={item.id} style={styles.historyRowCard}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.historyTopLine}>
                            <View style={styles.historyTokenBadge}>
                              <Text style={styles.historyTokenText}>{item.ticketNumber}</Text>
                            </View>
                            <View style={[styles.historyStatusBadge, { backgroundColor: badge.bg }]}>
                              <Text style={[styles.historyStatusText, { color: badge.text }]}>
                                {badge.label}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.historyServiceText}>{item.serviceName}</Text>
                          <Text style={styles.historyCustomerText}>
                            {item.customerName} • {item.customerPhone}
                          </Text>
                        </View>

                        {/* Clutter Deletion / Dismissal Action */}
                        <TouchableOpacity
                          style={styles.deleteHistoryBtn}
                          onPress={() => handleDeleteHistoryItem(item)}
                          activeOpacity={0.7}
                        >
                          <Feather name="trash-2" size={17} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyHistoryBox}>
                    <MaterialCommunityIcons name="check-all" size={32} color="#94A3B8" />
                    <Text style={styles.emptyHistoryText}>No Handled Records</Text>
                    <Text style={styles.emptyHistorySub}>
                      Your handled customer tickets will appear here.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  manageHistoryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  manageHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  manageHistoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageHistoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  manageHistorySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 240,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubHeader: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 17,
  },
  modalScroll: {
    maxHeight: 400,
  },
  historyRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  historyTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  historyTokenBadge: {
    backgroundColor: '#EBF3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historyTokenText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A2540',
  },
  historyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyServiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyCustomerText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  deleteHistoryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  emptyHistoryBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  emptyHistorySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
