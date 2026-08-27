import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';

import { Header } from '../../../../components/common/Header';
import { QuickActionCard } from '../../../../components/customer/QuickActionCard';
import { ForexRateCard } from '../../../../components/customer/ForexRateCard';
import { NearestBranchCard } from '../../../../components/customer/NearestBranchCard';
import { NotificationModal } from '../../../../components/common/NotificationModal';
import { Button } from '../../../../components/common/Button';
import { homeStyles } from '../../../../../assets/styles/home.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { socketService } from '../../../../services/socket.service';
import { notificationApi } from '../../../../api/notification.api';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  const [isNotifModalVisible, setIsNotifModalVisible] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [toastNotif, setToastNotif] = useState<{ title: string; message: string } | null>(null);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications(true);
      setUnreadNotifCount(res.unreadCount || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Socket.IO real-time notification listener
  useEffect(() => {
    socketService.connect();

    if (clerkUser?.id) {
      socketService.joinUser(clerkUser.id);
    }

    const unsubNotif = socketService.onCustomerNotification((notif) => {
      notificationApi.addLocalNotification(
        notif.title || 'Queue Update',
        notif.message || '',
        notif.id
      );
      setToastNotif({
        title: notif.title || 'Queue Update',
        message: notif.message || '',
      });
      setUnreadNotifCount((prev) => prev + 1);

      // Auto-hide toast after 6 seconds
      setTimeout(() => {
        setToastNotif(null);
      }, 6000);
    });

    return () => {
      unsubNotif();
    };
  }, [clerkUser?.id]);

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
    setIsNotifModalVisible(true);
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* Real-time Notification Banner Toast */}
      {toastNotif && (
        <TouchableOpacity
          style={styles.toastBanner}
          onPress={() => {
            setToastNotif(null);
            setIsNotifModalVisible(true);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.toastIconBox}>
            <Ionicons name="notifications" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>{toastNotif.title}</Text>
            <Text style={styles.toastMessage} numberOfLines={2}>
              {toastNotif.message}
            </Text>
          </View>
          <Ionicons name="close" size={16} color="#64748B" />
        </TouchableOpacity>
      )}

      {/* Top Header */}
      <Header
        title="ተራ Mobile Services"
        unreadCount={unreadNotifCount}
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

        {/* Nearest Branch Overview Card */}
        <NearestBranchCard
          branchName="Wegagen - Bole Branch"
          status="Open"
          distance="0.5km away"
          waitingCount={4}
          onJoinQueue={handleJoinQueue}
          onMapPress={handleFindNearbyBranches}
        />
      </ScrollView>

      {/* Full Notification Center Modal */}
      <NotificationModal
        visible={isNotifModalVisible}
        onClose={() => setIsNotifModalVisible(false)}
        onRefreshUnreadCount={fetchUnreadCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toastBanner: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#93C5FD',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0A2540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2540',
  },
  toastMessage: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
});
