import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Header } from '../../../../components/common/Header';
import { QuickActionCard } from '../../../../components/customer/QuickActionCard';
import { ForexRateCard } from '../../../../components/customer/ForexRateCard';
import { NearestBranchCard } from '../../../../components/customer/NearestBranchCard';
import { Button } from '../../../../components/common/Button';
import { homeStyles } from '../../../../../assets/styles/home.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { useNotification } from '../../../../contexts/NotificationContext';
import { branchApi } from '../../../../api/branch.api';
import { BranchData } from '../../../../components/branch/BranchCard';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { unreadCount, openNotificationModal } = useNotification();

  const [nearestBranch, setNearestBranch] = useState<BranchData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNearestBranch = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      // Fetch the nearest branch or top branch from the backend
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

  useEffect(() => {
    fetchNearestBranch();
  }, [fetchNearestBranch]);

  useFocusEffect(
    useCallback(() => {
      fetchNearestBranch();
    }, [fetchNearestBranch])
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
            onRefresh={() => fetchNearestBranch(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={homeStyles.welcomeSection}>
          <Text style={homeStyles.welcomeTitle}>Welcome to Smart Agent</Text>
          <Text style={homeStyles.welcomeSubtitle}>
            Your digital gateway to Wegagen Bank services.
          </Text>
        </View>

        {/* Main CTA Button: Find Nearby Branches */}
        <Button
          title="Find Nearby Branches"
          onPress={handleFindNearbyBranches}
          icon={<Ionicons name="location-sharp" size={20} color={COLORS.white} />}
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
          usdBuyRate="125.40"
          usdSellRate="127.90"
          eurBuyRate="136.10"
          eurSellRate="138.80"
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
