import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
import { biometricService } from '../../../../services/biometric.service';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  const [hasBiometrics, setHasBiometrics] = useState<boolean>(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);
  const [biometricLabel, setBiometricLabel] = useState<string>('Fingerprint');

  const checkBiometrics = useCallback(async () => {
    const available = await biometricService.isBiometricAvailable();
    setHasBiometrics(available);
    if (available) {
      const label = await biometricService.getBiometricTypeLabel();
      setBiometricLabel(label);
      const enabled = await biometricService.isBiometricsEnabled();
      setBiometricsEnabled(enabled);
    }
  }, []);

  const handleToggleBiometrics = async (value: boolean) => {
    if (!value) {
      await biometricService.disableBiometrics();
      setBiometricsEnabled(false);
      Alert.alert('Disabled', `${biometricLabel} sign-in has been disabled.`);
    } else {
      Alert.alert(
        `Enable ${biometricLabel} Sign-In`,
        `To enable ${biometricLabel.toLowerCase()} sign-in, please sign out and sign in once with your password to register your credentials.`,
        [{ text: 'OK' }]
      );
    }
  };

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
      console.error('Error fetching user profile:', err);
      // If backend is completely down, fallback to Clerk user data
      if (clerkUser) {
        setUserData({
          id: clerkUser.id,
          clerkUserId: clerkUser.id,
          firstName: clerkUser.firstName || (clerkUser.unsafeMetadata?.firstName as string) || '',
          lastName: clerkUser.lastName || (clerkUser.unsafeMetadata?.lastName as string) || '',
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          phone: clerkUser.primaryPhoneNumber?.phoneNumber || (clerkUser.unsafeMetadata?.phone as string) || '',
          role: 'customer',
          isActive: true,
          createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt).toISOString() : new Date().toISOString(),
        });
      } else {
        setError(err.response?.data?.message || err.message || 'Could not load profile.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clerkUser]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      checkBiometrics();
    }, [fetchUserProfile, checkBiometrics])
  );

  const handleSaveProfile = async (data: { firstName: string; lastName: string; phone: string }) => {
    try {
      const updated = await userApi.updateMe(data);
      if (updated) {
        setUserData(updated);
      }
      try {
        await clerkUser?.update({
          firstName: data.firstName,
          lastName: data.lastName,
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            phone: data.phone,
          },
        });
      } catch (clerkErr) {
        console.warn('Clerk metadata update warning:', clerkErr);
      }

      Alert.alert('Profile Updated', 'Your profile details have been saved successfully.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Could not update profile.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const fullName =
    userData?.firstName || userData?.lastName
      ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      : clerkUser?.fullName || 'Wegagen Customer';

  const phoneNumber =
    userData?.phone ||
    clerkUser?.primaryPhoneNumber?.phoneNumber ||
    (clerkUser?.unsafeMetadata?.phone as string) ||
    'Not provided';

  const email =
    userData?.email ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    'Not provided';

  const memberSince = (() => {
    const rawDate = userData?.createdAt || clerkUser?.createdAt;
    if (!rawDate) return 'August 2025';
    try {
      const d = new Date(rawDate);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'August 2025';
    }
  })();

  const accountStatus = 'Active';
  const isVerified = Boolean(
    clerkUser?.primaryEmailAddress?.verification?.status === 'verified'
  );

  return (
    <View style={commonStyles.safeArea}>
      {/* Header */}
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
              Loading 
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

            {/* 3. Security & Biometrics Section */}
            {hasBiometrics && (
              <>
                <Text style={profileStyles.sectionTitle}>Security & Biometrics</Text>
                <View style={profileStyles.securityCard}>
                  <View style={profileStyles.securityLeft}>
                    <View style={profileStyles.securityIconBox}>
                      <MaterialCommunityIcons
                        name={biometricLabel === 'Face ID' ? 'face-recognition' : 'fingerprint'}
                        size={22}
                        color={COLORS.primary}
                      />
                    </View>
                    <View>
                      <Text style={profileStyles.securityTitle}>{biometricLabel} Sign-In</Text>
                      <Text style={profileStyles.securitySub}>
                        {biometricsEnabled
                          ? `Enabled for quick login`
                          : `Disabled on this device`}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={biometricsEnabled}
                    onValueChange={handleToggleBiometrics}
                    trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                    thumbColor={biometricsEnabled ? COLORS.primary : '#F1F5F9'}
                  />
                </View>
              </>
            )}

            {/* 4. Action Buttons */}
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
