import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import {
  BranchDetailsBanner,
  BranchDetailsHeader,
  BranchLiveQueueCard,
  BranchServicesGrid,
  BranchInfoCard,
} from '../../../../components/branch/details';
import { getBranchImage } from '../../../../../assets/branchImages';
import { BranchData } from '../../../../components/branch/BranchCard';
import { branchDetailsStyles } from '../../../../../assets/styles/branch-details.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { branchApi } from '../../../../api/branch.api';
import { queueApi } from '../../../../api/queue.api';

const FALLBACK_BRANCH: BranchData = {
  id: 'default-branch',
  name: 'Bole Branch',
  address: 'Bole Road, Near Edna Mall, Addis Ababa',
  distance: '1.2 km away',
  isOpen: true,
  hours: 'Mon-Fri: 8:00 AM - 5:00 PM\nSat: 8:00 AM - 12:00 PM',
  phone: '+251 11 661 2345',
  waitingCount: 8,
  estimatedWaitMins: 12,
  services: [
    'Cash Services',
    'Account Services',
    'Loan & Credit',
    'Digital Banking',
  ],
};

export default function BranchDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const scrollY = useRef(new Animated.Value(0)).current;

  const [branch, setBranch] = useState<BranchData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('Cash Services');

  const fetchBranchDetails = useCallback(async (isRefresh: boolean = false) => {
    if (!id) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const branchData = await branchApi.getBranchById(id);
      setBranch(branchData);
      if (branchData?.services && branchData.services.length > 0) {
        setSelectedService(branchData.services[0]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to load branch details from server.';
        console.warn('Branch fetch error:', msg);
        setBranch(FALLBACK_BRANCH);
      } else {
        setBranch(FALLBACK_BRANCH);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBranchDetails();
  }, [fetchBranchDetails]);

  const handleBack = () => {
    router.back();
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
  };

  const handleJoinQueue = async () => {
    const activeBranch = branch || FALLBACK_BRANCH;
    const chosenService = selectedService || 'Cash Services';

    try {
      await queueApi.joinQueue({
        branchId: activeBranch.id,
        branchName: activeBranch.name,
        serviceName: chosenService,
      });
    } catch (e) {
      console.warn('Error joining queue:', e);
    }

    // Navigate to My Queue tab screen with selected branch & service parameters
    router.push({
      pathname: '/(app)/customer/(tabs)/queue',
      params: {
        branchId: activeBranch.id,
        branchName: activeBranch.name,
        serviceName: chosenService,
      },
    });
  };

  const handleGetDirections = () => {
    console.log(`Getting directions to ${branch?.name}`);
  };

  const activeBranch = branch || FALLBACK_BRANCH;
  const backButtonTop = insets.top > 0 ? insets.top + 8 : 44;

  return (
    <View style={commonStyles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Persistent Floating Back Button (Fixed on scroll) */}
      <TouchableOpacity
        style={[branchDetailsStyles.backButton, { top: backButtonTop }]}
        onPress={handleBack}
        activeOpacity={0.85}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
      </TouchableOpacity>

      {loading && !branch ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
            Loading branch details...
          </Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={branchDetailsStyles.container}
          contentContainerStyle={branchDetailsStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBranchDetails(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* 1. Top Banner Image with Stretchy Scroll-Down & Full-Photo Tap Reveal */}
          <BranchDetailsBanner
            imageSource={getBranchImage(activeBranch.id, activeBranch.name)}
            scrollY={scrollY}
            expandBadgeTop={backButtonTop}
          />

          {/* 2. Main Content Rounded Sheet */}
          <View style={branchDetailsStyles.contentSheet}>
            {/* Top Sheet Handle Bar */}
            <View style={branchDetailsStyles.handleBar} />

            {/* Branch Header Card (Title, Status, Distance, Address, Directions) */}
            <BranchDetailsHeader
              name={activeBranch.name}
              isOpen={activeBranch.isOpen}
              distance={activeBranch.distance}
              address={activeBranch.address}
              onGetDirections={handleGetDirections}
            />

            {/* 3. Live Queue Status Section */}
            <Text style={branchDetailsStyles.sectionHeader}>Live Queue Status</Text>
            <BranchLiveQueueCard
              waitingCount={activeBranch.waitingCount}
              estimatedWaitMins={activeBranch.estimatedWaitMins}
              onJoinQueue={handleJoinQueue}
            />

            {/* 4. Available Services Section (Dynamic with interactive selection) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[branchDetailsStyles.sectionHeader, { marginBottom: 0 }]}>Available Services</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Tap to select</Text>
            </View>
            <BranchServicesGrid
              services={activeBranch.services}
              selectedService={selectedService}
              onSelectService={handleSelectService}
            />

            {/* 5. Branch Information Section */}
            <Text style={branchDetailsStyles.sectionHeader}>Branch Information</Text>
            <BranchInfoCard
              hours={activeBranch.hours}
              phone={activeBranch.phone}
            />
          </View>
        </Animated.ScrollView>
      )}
    </View>
  );
}
