import React from 'react';
import { View, Text, ScrollView,  } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../../../components/common/Header';
import { QuickActionCard } from '../../../../components/customer/QuickActionCard';
import { ForexRateCard } from '../../../../components/customer/ForexRateCard';
import { NearestBranchCard } from '../../../../components/customer/NearestBranchCard';
import { Button } from '../../../../components/common/Button';
import { homeStyles } from '../../../../../assets/styles/home.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
export default function CustomerHomeScreen() {
  const router = useRouter();

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

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* I & VI. Custom Top Navigation Header (White bar, Bank Icon on Left, AI Agent + Bell on Right) */}
      <Header
        title="ተራ Mobile Services"
        onAiAgentPress={handleAiAgentPress}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView style={homeStyles.container} contentContainerStyle={homeStyles.scrollContent}>
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
            title="Nearby Branches"
            icon={<MaterialCommunityIcons name="store-search-outline" size={26} color={COLORS.primary} />}
            onPress={handleFindNearbyBranches}
          />
          <QuickActionCard
            title="Join Queue"
            icon={<MaterialCommunityIcons name="ticket-confirmation-outline" size={26} color={COLORS.primary} />}
            onPress={handleJoinQueue}
          />
        </View>

        {/* V. Small Reusable Forex Rates Card */}
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

        {/* Nearest Branch Overview Card */}
        <NearestBranchCard
          branchName="Wegagen - Bole Branch"
          status="Open"
          distance="0.5km away"
          waitingCount={12}
          onJoinQueue={handleJoinQueue}
          onMapPress={handleFindNearbyBranches}
        />
      </ScrollView>
    </View>
  );
}
