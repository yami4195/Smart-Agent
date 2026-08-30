import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Header } from '../../../../components/common/Header';
import { HomeImageSlider } from '../../../../components/customer/HomeImageSlider';
import { QuickActionCard } from '../../../../components/customer/QuickActionCard';
import { ForexRateCard } from '../../../../components/customer/ForexRateCard';
import { NearestBranchCard } from '../../../../components/customer/NearestBranchCard';
import { Button } from '../../../../components/common/Button';
import { homeStyles } from '../../../../../assets/styles/home.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { useNotification } from '../../../../contexts/NotificationContext';
import { branchApi } from '../../../../api/branch.api';
import { userApi, UserData } from '../../../../api/user.api';
import { forexApi, ForexRate } from '../../../../api/forexApi';
import { BranchData } from '../../../../components/branch/BranchCard';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { unreadCount, openNotificationModal } = useNotification();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [nearestBranch, setNearestBranch] = useState<BranchData | null>(null);
  const [forexRates, setForexRates] = useState<ForexRate[]>([]);
  const [forexLoading, setForexLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUserData = useCallback(async () => {
    try {
      const dbUser = await userApi.getMe();
      if (dbUser) {
        setUserData(dbUser);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchNearestBranch = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await branchApi.getBranches({ limit: 1 });
      if (response?.branches && response.branches.length > 0) {
        setNearestBranch(response.branches[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch nearest branch:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchForexRates = useCallback(async () => {
    try {
      setForexLoading(true);
      const response = await forexApi.getRates({ filter: 'MAJOR' });
      if (response?.rates) {
        setForexRates(response.rates);
      }
    } catch (err) {
      console.warn('Failed to fetch live forex rates for home:', err);
    } finally {
      setForexLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchNearestBranch();
    fetchForexRates();
  }, [fetchUserData, fetchNearestBranch, fetchForexRates]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchNearestBranch();
      fetchForexRates();
    }, [fetchUserData, fetchNearestBranch, fetchForexRates])
  );

  const handleFindNearbyBranches = () => {
    router.push('/(app)/customer/branches');
  };

  const handleJoinQueue = () => {
    router.push('/(app)/customer/queue');
  };

  const handleForexPress = () => {
    router.push('/customer/Forex/forex');
  };

  const handleAiAgentPress = () => {
    console.log('AI Agent pressed');
  };

  const handleNearestBranchJoin = () => {
    if (nearestBranch?.id) {
      router.push({
        pathname: '/(app)/customer/Branches/[id]',
        params: { id: nearestBranch.id },
      });
    } else {
      handleJoinQueue();
    }
  };

  // Robustly resolve the user's first name across DB profile and Clerk
  const rawFirstName = (() => {
    // 1. PostgreSQL DB profile
    if (userData?.firstName && userData.firstName.trim()) {
      return userData.firstName.trim();
    }
    // 2. Clerk User profile
    if (user?.firstName && user.firstName.trim()) {
      return user.firstName.trim();
    }
    // 3. Clerk unsafeMetadata
    if (user?.unsafeMetadata?.firstName && typeof user.unsafeMetadata.firstName === 'string') {
      return user.unsafeMetadata.firstName.trim();
    }
    // 4. Clerk publicMetadata
    if (user?.publicMetadata?.firstName && typeof user.publicMetadata.firstName === 'string') {
      return user.publicMetadata.firstName.trim();
    }
    // 5. Clerk fullName (first word)
    if (user?.fullName && user.fullName.trim()) {
      const parts = user.fullName.trim().split(' ');
      if (parts[0]) return parts[0];
    }
    // 6. Clerk username
    if (user?.username && user.username.trim()) {
      return user.username.trim();
    }
    // 7. Email username prefix
    const email = userData?.email || user?.primaryEmailAddress?.emailAddress;
    if (email && email.includes('@')) {
      const emailPrefix = email.split('@')[0].replace(/[._0-9]/g, ' ').trim().split(' ')[0];
      if (emailPrefix) return emailPrefix;
    }
    return '';
  })();

  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1)
    : '';

  const welcomeTitle = firstName ? `Welcome, ${firstName}!` : 'Welcome!';

  const handleSlidePress = (index: number) => {
    if (index === 0) {
      handleFindNearbyBranches();
    } else if (index === 1) {
      handleJoinQueue();
    } else if (index === 2) {
      handleForexPress();
    }
  };

  const usdRate = forexRates.find((r) => r.currencyCode === 'USD');
  const eurRate = forexRates.find((r) => r.currencyCode === 'EUR');

  return (
    <View style={commonStyles.safeArea}>
      {/* Top Header */}
      <Header
        title="Wegagen plus"
        unreadCount={unreadCount}
        onAiAgentPress={handleAiAgentPress}
        onNotificationPress={openNotificationModal}
      />

      <ScrollView
        style={homeStyles.container}
        contentContainerStyle={homeStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              fetchUserData();
              fetchNearestBranch(true);
              fetchForexRates();
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={homeStyles.welcomeSection}>
          <Text style={homeStyles.welcomeTitle}>{welcomeTitle}</Text>
          <Text style={homeStyles.welcomeSubtitle}>
            What would you like to do today?
          </Text>
        </View>

        {/* Image Slider */}
        <HomeImageSlider onSlidePress={handleSlidePress} />

        {/* Main CTA Button: Find Nearby Branches */}
        <Button
          title="Find Branch & Join Queue"
          onPress={handleFindNearbyBranches}
          icon={<Ionicons name="location-sharp" size={25} color={COLORS.white} />}
          style={homeStyles.mainCtaButton}
          textStyle={homeStyles.mainCtaText}
        />

        {/* Quick Actions Header */}
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Quick Actions</Text>
        </View>

        {/* Quick Action Square Cards */}
        <View style={homeStyles.quickActionsGrid}>
          <QuickActionCard
            title="Branches"
            icon={<Ionicons name="business" size={26} color={COLORS.primary} />}
            onPress={handleFindNearbyBranches}
          />
          <QuickActionCard
            title="Join Queue"
            icon={<MaterialCommunityIcons name="ticket-confirmation-outline" size={26} color={COLORS.primary} />}
            onPress={handleJoinQueue}
          />
        </View>

        {/* Forex Rates Card */}
        <ForexRateCard
          usdBuyRate={usdRate?.cashBuy}
          usdSellRate={usdRate?.cashSell}
          eurBuyRate={eurRate?.cashBuy}
          eurSellRate={eurRate?.cashSell}
          loading={forexLoading}
          onPress={handleForexPress}
        />

        {/* Nearest Branch Section */}
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Nearest Branch</Text>
        </View>

        {/* Nearest Branch Overview Card with Live Dynamic Open/Closed Status */}
        <NearestBranchCard
          branchName={nearestBranch?.name || 'Wegagen - Bole Branch'}
          isOpen={nearestBranch?.isOpen}
          distance={nearestBranch?.distance || '0.5km away'}
          waitingCount={nearestBranch?.waitingCount ?? 4}
          hours={nearestBranch?.hours}
          onJoinQueue={handleNearestBranchJoin}
          onMapPress={handleFindNearbyBranches}
        />
      </ScrollView>
    </View>
  );
}

