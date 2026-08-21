import React, { useState, useEffect, useCallback } from 'react';
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

export default function BranchesScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');

  // API State variables
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch branches from backend API
  const fetchBranches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await branchApi.getBranches();
      setBranches(data);
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
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Pull-to-refresh handler
  const handleRefresh = () => {
    fetchBranches(true);
  };

  // Client-side filtering on fetched branches for instant search & chip responsiveness
  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (activeFilter === 'OPEN') {
      matchesCategory = branch.isOpen;
    } else if (activeFilter === 'FOREX') {
      matchesCategory = branch.services?.some((s) => s.toLowerCase().includes('forex')) ?? false;
    } else if (activeFilter === 'LOW_QUEUE') {
      matchesCategory = branch.waitingCount < 10;
    }

    return matchesSearch && matchesCategory;
  });

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
              onPress={() => fetchBranches()}
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
                {filteredBranches.length} {filteredBranches.length === 1 ? 'Branch' : 'Branches'} Found
              </Text>
            </View>

            {/* Empty State */}
            {filteredBranches.length === 0 ? (
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
                    branches={filteredBranches}
                    onSelectBranchPin={(branch) => handleJoinQueue(branch)}
                  />
                ) : null}

                {/* Branch Cards List */}
                {filteredBranches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    onJoinQueue={handleJoinQueue}
                    onGetDirections={handleGetDirections}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
