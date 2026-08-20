import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Header } from '../../../../components/common/Header';
import { BranchCard, BranchData } from '../../../../components/branch/BranchCard';
import { BranchFilterBar, FilterCategory } from '../../../../components/branch/BranchFilterBar';
import { BranchMapPreview } from '../../../../components/branch/BranchMapPreview';
import { branchesStyles } from '../../../../../assets/styles/branches.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import {SAMPLE_WEGAGEN_BRANCHES} from '../../../../../src/data/Branch_Mock_Data';



export default function BranchesScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');

  // Filter logic
  const filteredBranches = SAMPLE_WEGAGEN_BRANCHES.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (activeFilter === 'OPEN') {
      matchesCategory = branch.isOpen;
    } else if (activeFilter === 'FOREX') {
      matchesCategory = branch.services.some((s) => s.includes('Forex'));
    } else if (activeFilter === 'LOW_QUEUE') {
      matchesCategory = branch.waitingCount < 10;
    }

    return matchesSearch && matchesCategory;
  });

  const handleJoinQueue = (branch: BranchData) => {
    // Navigate to queue tab
    router.push('/customer/queue');
  };

  const handleGetDirections = (branch: BranchData) => {
    console.log(`Directions requested for ${branch.name}`);
  };

  return (
    <View style={commonStyles.safeArea}>
      {/* Top Header */}
      <Header title="Tera Mobile Banking" />

      <ScrollView style={branchesStyles.container} contentContainerStyle={branchesStyles.scrollContent}>
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

        {/* Section Title & Count Badge */}
        <View style={branchesStyles.sectionHeaderRow}>
          <Text style={branchesStyles.sectionTitle}>Wegagen Branches</Text>
          <Text style={branchesStyles.branchCountBadge}>
            {filteredBranches.length} {filteredBranches.length === 1 ? 'Branch' : 'Branches'} Found
          </Text>
        </View>

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
      </ScrollView>
    </View>
  );
}
