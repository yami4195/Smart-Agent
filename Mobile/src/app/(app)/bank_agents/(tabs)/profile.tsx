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
import { agentsStyles } from '../../../../../assets/styles/agents.styles';


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
              <Text style={agentsStyles.infoValue}>Wegagen - Bole Branch</Text>
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
              <Text style={agentsStyles.infoValue}>Morning Shift (8:00 AM - 5:00 PM)</Text>
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
          style={agentsStyles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={agentsStyles.signOutButtonText}>Sign Out from Agent Portal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
