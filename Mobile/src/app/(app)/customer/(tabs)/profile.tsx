import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useFocusEffect } from '@react-navigation/native';
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
  const { user: clerkUser } = useUser();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  /**
   * Fetch user profile from DB.
   * If the user row does not exist in DB yet, sync from Clerk and then fetch.
   */
  const fetchUserProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Attempt to fetch current user row from PostgreSQL DB
      let user = await userApi.getMe();

      if (!user && clerkUser) {
        // User row missing in DB — sync Clerk user first
        const rawPhone =
          clerkUser.primaryPhoneNumber?.phoneNumber ||
          (clerkUser.unsafeMetadata?.phone as string) ||
          '';
        const rawFirstName =
          clerkUser.firstName ||
          (clerkUser.unsafeMetadata?.firstName as string) ||
          '';
        const rawLastName =
          clerkUser.lastName ||
          (clerkUser.unsafeMetadata?.lastName as string) ||
          '';
        const rawEmail = clerkUser.primaryEmailAddress?.emailAddress || '';

        user = await userApi.syncUser({
          firstName: rawFirstName,
          lastName: rawLastName,
          email: rawEmail,
          phone: rawPhone,
        });
      }

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
  }, [clerkUser]);

  // Reload every time the profile tab comes into focus so switching accounts re-fetches immediately
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  // ── Derived display values ──────────────────────────────────────────────
  const fullName = (() => {
    if (userData?.firstName || userData?.lastName) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    if (clerkUser?.firstName || clerkUser?.lastName) {
      return `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    }
    return '—';
  })();

  const phoneNumber =
    userData?.phone ||
    clerkUser?.primaryPhoneNumber?.phoneNumber ||
    (clerkUser?.unsafeMetadata?.phone as string) ||
    '—';

  const email =
    userData?.email ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    '—';

  const memberSince = (() => {
    const rawDate = userData?.createdAt || clerkUser?.createdAt;
    if (!rawDate) return '—';
    try {
      return new Date(rawDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  })();

  const accountStatus = userData?.isActive === false ? 'Inactive' : 'Active';
  const isVerified = Boolean(email !== '—' || phoneNumber !== '—');

  // ── Handlers ────────────────────────────────────────────────────────────
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
    // 1. Update in PostgreSQL Database
    const updatedUser = await userApi.updateMe({
      firstName,
      lastName,
      phone,
    });
    setUserData(updatedUser);

    // 2. Also sync to Clerk account
    try {
      if (clerkUser) {
        await clerkUser.update({
          firstName,
          lastName,
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            phone,
          },
        });
      }
    } catch (clerkErr) {
      console.warn('Could not sync update to Clerk:', clerkErr);
    }

    Alert.alert('Success', 'Profile updated successfully.');
  };

  return (
    <View style={commonStyles.safeArea}>
      <Header
        title="Profile"
        onAiAgentPress={() => {}}
        onNotificationPress={() => {}}
      />

      <ScrollView
        style={profileStyles.container}
        contentContainerStyle={profileStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUserProfile(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {loading && !refreshing && !userData ? (
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
            {/* 1. Personal Information Header & Card */}
            <Text style={profileStyles.sectionTitle}>Personal Information</Text>
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
        initialFirstName={userData?.firstName || clerkUser?.firstName || ''}
        initialLastName={userData?.lastName || clerkUser?.lastName || ''}
        initialPhone={
          userData?.phone ||
          clerkUser?.primaryPhoneNumber?.phoneNumber ||
          (clerkUser?.unsafeMetadata?.phone as string) ||
          ''
        }
        onSave={handleSaveProfile}
      />
    </View>
  );
}
