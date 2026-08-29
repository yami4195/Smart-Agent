import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';

import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { queueApi, QueueHistoryItem, TicketStatusType } from '../../../../api/queue.api';
import { useNotification } from '../../../../contexts/NotificationContext';

const FILTER_TABS: { id: string; label: string; status?: TicketStatusType }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'COMPLETED', label: 'Completed', status: 'COMPLETED' },
  { id: 'CANCELLED', label: 'Cancelled', status: 'CANCELLED' },
  { id: 'NO_SHOW', label: 'No Show', status: 'NO_SHOW' },
];

export default function CustomerQueueHistoryScreen() {
  const router = useRouter();
  const { unreadCount, openNotificationModal } = useNotification();

  const [history, setHistory] = useState<QueueHistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await queueApi.getHistory();
      setHistory(data || []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to connect to the server. Please check your connection.';
        setError(msg);
      } else {
        setError('An unexpected error occurred while loading your queue history.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.status === activeFilter;
  });

  const getStatusBadge = (status: TicketStatusType) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: '#ECFDF5',
          text: '#10B981',
          icon: 'checkmark-circle' as const,
          label: 'Completed',
        };
      case 'CANCELLED':
        return {
          bg: '#FEF2F2',
          text: '#EF4444',
          icon: 'close-circle' as const,
          label: 'Cancelled',
        };
      case 'NO_SHOW':
        return {
          bg: '#FFFBEB',
          text: '#D97706',
          icon: 'alert-circle' as const,
          label: 'Late / No-Show',
        };
      default:
        return {
          bg: '#F1F5F9',
          text: '#64748B',
          icon: 'information-circle' as const,
          label: status,
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return `${d.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateString;
    }
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queue History</Text>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={openNotificationModal}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* History List or Error or Clean Empty State */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHistory(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
              Loading queue history...
            </Text>
          </View>
        ) : error ? (
          /* Error State Banner with Retry */
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color={COLORS.danger} />
            <Text style={styles.errorTitle}>Failed to Load History</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              onPress={() => fetchHistory(false)}
              style={styles.retryButton}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardTopRow}>
                  {/* Token ID Badge */}
                  <View style={styles.tokenBadge}>
                    <Text style={styles.tokenText}>{item.ticketNumber}</Text>
                  </View>

                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Ionicons
                      name={badge.icon}
                      size={13}
                      color={badge.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Service Name */}
                <Text style={styles.serviceTitle}>{item.serviceName}</Text>

                {/* Branch Name */}
                <View style={styles.infoRow}>
                  <FontAwesome5 name="university" size={12} color="#64748B" style={{ marginRight: 6 }} />
                  <Text style={styles.infoText}>{item.branchName}</Text>
                </View>

                {/* Date & Time */}
                <View style={[styles.infoRow, { marginTop: 4 }]}>
                  <Feather name="clock" size={12} color="#94A3B8" style={{ marginRight: 6 }} />
                  <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="history"
                size={34}
                color="#94A3B8"
              />
            </View>
            <Text style={styles.emptyTitle}>No Queue History Found</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'ALL'
                ? 'Your previous queue tickets and completed visits will appear here.'
                : `There are no ${activeFilter.toLowerCase().replace('_', ' ')} tickets in your history.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0A2540',
    borderColor: '#0A2540',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenBadge: {
    backgroundColor: '#EBF3FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A2540',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});
