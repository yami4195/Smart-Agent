import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { EmployeeHeader, CounterStatus } from '../../../../components/employee/EmployeeHeader';
import { userApi, UserData } from '../../../../api/user.api';
import { employeeApi, EmployeeStats } from '../../../../api/employee.api';

export default function EmployeeProfileScreen() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [switchingRole, setSwitchingRole] = useState<boolean>(false);

  const fetchProfileAndStats = useCallback(async () => {
    try {
      setLoading(true);
      const [u, s] = await Promise.all([
        userApi.getMe(),
        employeeApi.getEmployeeStats('branch-bole'),
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

  const handleSwitchToCustomer = () => {
    router.replace('/(app)/customer/(tabs)');
  };

  const handleToggleRole = async () => {
    try {
      setSwitchingRole(true);
      const newRole = userData?.role === 'employee' ? 'customer' : 'employee';
      await employeeApi.updateUserRole(newRole);
      Alert.alert(
        'Role Updated',
        `Your account role has been switched to ${newRole.toUpperCase()}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (newRole === 'customer') {
                router.replace('/(app)/customer/(tabs)');
              } else {
                fetchProfileAndStats();
              }
            },
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to update account role.');
    } finally {
      setSwitchingRole(false);
    }
  };

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

  return (
    <View style={commonStyles.safeArea}>
      {/* Top Header */}
      <EmployeeHeader
        branchName="Bole Medhanialem Branch"
        status="Available"
      />

      <ScrollView
        style={employeeStyles.screenContainer}
        contentContainerStyle={employeeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Agent Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>

          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
            <Text style={styles.roleBadgeText}>AUTHORIZED TELLER</Text>
          </View>
        </View>

        {/* 2. Assigned Workstation Section */}
        <Text style={employeeStyles.sectionTitle}>Workstation Assignment</Text>
        <View style={styles.cardContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="business" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Assigned Branch</Text>
              <Text style={styles.infoValue}>Wegagen - Bole Branch</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons name="laptop" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Counter / Window</Text>
              <Text style={styles.infoValue}>Counter 01 • Teller Desk</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Feather name="clock" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Active Shift</Text>
              <Text style={styles.infoValue}>Morning Shift (8:00 AM - 5:00 PM)</Text>
            </View>
          </View>
        </View>

        {/* 3. Performance Summary */}
        <Text style={[employeeStyles.sectionTitle, { marginTop: 16 }]}>Today's Performance</Text>
        <View style={employeeStyles.statsGrid}>
          <View style={employeeStyles.statCard}>
            <Text style={employeeStyles.statLabel}>COMPLETED</Text>
            <Text style={[employeeStyles.statValue, { color: '#10B981' }]}>
              {stats?.totalServedToday ?? 0}
            </Text>
            <Text style={employeeStyles.statHint}>Customers served</Text>
          </View>

          <View style={employeeStyles.statCard}>
            <Text style={employeeStyles.statLabel}>AVG HANDLE TIME</Text>
            <Text style={employeeStyles.statValue}>{stats?.avgServiceMins || 3.5}m</Text>
            <Text style={employeeStyles.statHint}>Target: &lt; 5 mins</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.signOutButtonText}>Sign Out from Agent Portal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  switchModeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  switchModeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchModeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    marginTop: 8,
    marginBottom: 20,
    gap: 6,
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
