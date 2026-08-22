import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { Header } from '../../../../components/common/Header';
import { BranchCard, BranchData } from '../../../../components/branch/BranchCard';
import { BranchFilterBar, FilterCategory } from '../../../../components/branch/BranchFilterBar';
import { BranchMapPreview } from '../../../../components/branch/BranchMapPreview';
import { branchesStyles } from '../../../../../assets/styles/branches.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { branchApi } from '../../../../api/branch.api';

const PAGE_SIZE = 10;

export default function BranchesScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');

  // API & Pagination State variables
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalBranches, setTotalBranches] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to debounce timer for search queries
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch branches with pagination
  const fetchBranches = useCallback(
    async (
      targetPage: number = 1,
      options: { isRefresh?: boolean; isLoadMore?: boolean; search?: string; filter?: FilterCategory } = {}
    ) => {
      const { isRefresh = false, isLoadMore = false, search = searchQuery, filter = activeFilter } = options;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await branchApi.getBranches({
          page: targetPage,
          limit: PAGE_SIZE,
          search: search.trim().length > 0 ? search.trim() : undefined,
          openNow: filter === 'OPEN' ? true : undefined,
          forexOnly: filter === 'FOREX' ? true : undefined,
          lowQueueOnly: filter === 'LOW_QUEUE' ? true : undefined,
        });

        if (isLoadMore) {
          setBranches((prev) => [...prev, ...response.branches]);
        } else {
          setBranches(response.branches);
        }

        setPage(response.page);
        setTotalBranches(response.total);
        setHasMore(response.hasMore);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Failed to connect to the server. Please check your connection.';
          setError(msg);
        } else {
          setError('An unexpected error occurred while loading branches.');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [searchQuery, activeFilter]
  );

  // Trigger search/filter with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchBranches(1, { search: searchQuery, filter: activeFilter });
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, activeFilter]);

  // Pull-to-refresh handler
  const handleRefresh = () => {
    fetchBranches(1, { isRefresh: true, search: searchQuery, filter: activeFilter });
  };

  // Load more handler
  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    fetchBranches(page + 1, { isLoadMore: true, search: searchQuery, filter: activeFilter });
  };

  const handleJoinQueue = (branch: BranchData) => {
    router.push('/(app)/customer/queue');
  };

  const handleGetDirections = (branch: BranchData) => {
    console.log(`Directions requested for ${branch.name}`);
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* Top Header */}
      <Header title="Tera Mobile Banking" />

      <ScrollView
        style={branchesStyles.container}
        contentContainerStyle={branchesStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* View Mode Toggle: List vs Map */}
        <View style={branchesStyles.viewModeContainer}>
          <Pressable
            style={[
              branchesStyles.viewModeButton,
              viewMode === 'LIST' && branchesStyles.viewModeActive,
            ]}
            onPress={() => setViewMode('LIST')}
          >
            <Ionicons
              name="list-outline"
              size={16}
              color={viewMode === 'LIST' ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                branchesStyles.viewModeText,
                viewMode === 'LIST' && branchesStyles.viewModeTextActive,
              ]}
            >
              List View
            </Text>
          </Pressable>

          <Pressable
            style={[
              branchesStyles.viewModeButton,
              viewMode === 'MAP' && branchesStyles.viewModeActive,
            ]}
            onPress={() => setViewMode('MAP')}
          >
            <FontAwesome5
              name="map-marked-alt"
              size={14}
              color={viewMode === 'MAP' ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                branchesStyles.viewModeText,
                viewMode === 'MAP' && branchesStyles.viewModeTextActive,
              ]}
            >
              Map View
            </Text>
          </Pressable>
        </View>

        {/* Search & Category Filter Bar */}
        <BranchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Loading Indicator */}
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
              Loading branches...
            </Text>
          </View>
        ) : error ? (
          /* Error State Banner with Retry */
          <View
            style={{
              backgroundColor: '#FEE2E2',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginVertical: 16,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <Ionicons name="alert-circle" size={32} color={COLORS.danger} />
            <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 14, marginTop: 6, textAlign: 'center' }}>
              Failed to load branches
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => fetchBranches(1)}
              style={{
                marginTop: 12,
                backgroundColor: COLORS.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Section Title & Count Badge */}
            <View style={branchesStyles.sectionHeaderRow}>
              <Text style={branchesStyles.sectionTitle}>Wegagen Branches</Text>
              <Text style={branchesStyles.branchCountBadge}>
                {branches.length} of {totalBranches} {totalBranches === 1 ? 'Branch' : 'Branches'}
              </Text>
            </View>

            {/* Empty State */}
            {branches.length === 0 ? (
              <View style={{ paddingVertical: 36, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={40} color={COLORS.textMuted} />
                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '700', color: COLORS.navy }}>
                  No branches found
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                  Try changing your search terms or filters
                </Text>
              </View>
            ) : (
              <>
                {/* Conditional Rendering: Map Preview vs List Cards */}
                {viewMode === 'MAP' ? (
                  <BranchMapPreview
                    branches={branches}
                    onSelectBranchPin={(branch) => handleJoinQueue(branch)}
                  />
                ) : null}

                {/* Branch Cards List */}
                {branches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    onJoinQueue={handleJoinQueue}
                    onGetDirections={handleGetDirections}
                  />
                ))}

                {/* Load More Button or End of List Indicator */}
                {hasMore ? (
                  <View style={branchesStyles.loadMoreContainer}>
                    <TouchableOpacity
                      style={branchesStyles.loadMoreButton}
                      onPress={handleLoadMore}
                      disabled={loadingMore}
                      activeOpacity={0.8}
                    >
                      {loadingMore ? (
                        <>
                          <ActivityIndicator size="small" color={COLORS.primary} />
                          <Text style={branchesStyles.loadMoreText}>Loading more branches...</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="chevron-down-circle-outline" size={18} color={COLORS.primary} />
                          <Text style={branchesStyles.loadMoreText}>
                            Load More ({branches.length} of {totalBranches})
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : branches.length > 0 ? (
                  <View style={branchesStyles.endOfListContainer}>
                    <Text style={branchesStyles.endOfListText}>
                      ✓ All {totalBranches} branches loaded
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
