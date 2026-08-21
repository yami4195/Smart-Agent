import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@clerk/expo';
import { Feather, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { Header } from '../../../../components/common/Header';
import { Button } from '../../../../components/common/Button';
import { ProfileInfoCard } from '../../../../components/profile/ProfileInfoCard';
import { MemberSinceCard } from '../../../../components/profile/MemberSinceCard';
import { ProfileStatusCard } from '../../../../components/profile/ProfileStatusCard';
import { EditProfileModal } from '../../../../components/profile/EditProfileModal';
import { profileStyles } from '../../../../../assets/styles/profile.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { userApi, UserData } from '../../../../api/user.api';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  // Fetch user data directly from the PostgreSQL database via API
  const fetchUserProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const user = await userApi.getMe();
      setUserData(user);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to load profile from database.';
        setError(msg);
      } else {
        setError('An unexpected error occurred while loading profile.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleRefresh = () => {
    fetchUserProfile(true);
  };

  // Memoized user display attributes from DB record
  const fullName = useMemo(() => {
    if (!userData) return 'Abebe Kebede';
    if (userData.firstName || userData.lastName) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    return 'Abebe Kebede';
  }, [userData]);

  const phoneNumber = useMemo(() => {
    return userData?.phone || '+251 911 234 567';
  }, [userData]);

  const email = useMemo(() => {
    return userData?.email || 'abebe.k@example.com';
  }, [userData]);

  const memberSince = useMemo(() => {
    if (userData?.createdAt) {
      try {
        const date = new Date(userData.createdAt);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } catch {
        return 'January 2022';
      }
    }
    return 'January 2022';
  }, [userData?.createdAt]);

  const accountStatus = useMemo(() => {
    return userData?.isActive === false ? 'Inactive' : 'Active';
  }, [userData]);

  const isVerified = useMemo(() => {
    return Boolean(userData?.email || userData?.phone);
  }, [userData]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            console.error('Sign Out error:', err);
            Alert.alert('Error', 'Could not sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async ({
    firstName,
    lastName,
    phone,
  }: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    const updatedUser = await userApi.updateMe({
      firstName,
      lastName,
      phone,
    });
    setUserData(updatedUser);
    Alert.alert('Success', 'Profile updated successfully in database.');
  };

  const handleAiAgentPress = () => {
    console.log('AI Agent pressed from Profile');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed from Profile');
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* Top Header - Consistent with other tabs */}
      <Header
        title="Profile"
        onAiAgentPress={handleAiAgentPress}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView
        style={profileStyles.container}
        contentContainerStyle={profileStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' }}>
              Loading profile from database...
            </Text>
          </View>
        ) : error && !userData ? (
          <View
            style={{
              backgroundColor: '#FEE2E2',
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
              marginVertical: 20,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <Ionicons name="alert-circle" size={36} color={COLORS.danger} />
            <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
              Failed to load profile
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => fetchUserProfile()}
              style={{
                marginTop: 14,
                backgroundColor: COLORS.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 14 }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 1. Personal Information Card */}
            <ProfileInfoCard
              fullName={fullName}
              phoneNumber={phoneNumber}
              email={email}
            />

            {/* 2. Account Details Section */}
            <Text style={profileStyles.sectionTitle}>Account Details</Text>

            {/* Member Since Card */}
            <MemberSinceCard memberSince={memberSince} />

            {/* Status & Verification Grid Cards */}
            <View style={profileStyles.statusGrid}>
              <ProfileStatusCard
                label="ACCOUNT STATUS"
                status={accountStatus}
                variant={accountStatus === 'Active' ? 'success' : 'warning'}
              />
              <ProfileStatusCard
                label="VERIFICATION"
                status={isVerified ? 'Verified' : 'Pending'}
                variant={isVerified ? 'success' : 'warning'}
              />
            </View>

            {/* 3. Action Buttons */}
            <View style={profileStyles.actionsContainer}>
              <Button
                title="Edit Profile"
                onPress={() => setIsEditModalVisible(true)}
                variant="navy"
                icon={<Feather name="edit-3" size={18} color={COLORS.white} />}
                style={profileStyles.editButton}
              />

              <Button
                title="Logout"
                onPress={handleSignOut}
                variant="outlineNavy"
                icon={<Feather name="log-out" size={18} color={COLORS.primary} />}
                style={profileStyles.logoutButton}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        initialFirstName={userData?.firstName || ''}
        initialLastName={userData?.lastName || ''}
        initialPhone={userData?.phone || ''}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
