import React from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branchesStyles } from '../../../assets/styles/branches.styles';
import { COLORS } from '../../../constants/colors';

export type FilterCategory = 'ALL' | 'OPEN' | 'FOREX' | 'LOW_QUEUE';

interface BranchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}

export const BranchFilterBar: React.FC<BranchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <View>
      {/* Search Input Bar */}
      <View style={branchesStyles.searchContainer}>
        <Feather name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={branchesStyles.searchInput}
          placeholder="Search branch name or location (e.g. Bole, Kazanchis)..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Filter Chips Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={branchesStyles.filterScroll}
      >
        <Pressable
          style={[
            branchesStyles.filterChip,
            activeFilter === 'ALL' && branchesStyles.filterChipActive,
          ]}
          onPress={() => onFilterChange('ALL')}
        >
          <Text
            style={[
              branchesStyles.filterChipText,
              activeFilter === 'ALL' && branchesStyles.filterChipTextActive,
            ]}
          >
            All Branches
          </Text>
        </Pressable>

        <Pressable
          style={[
            branchesStyles.filterChip,
            activeFilter === 'OPEN' && branchesStyles.filterChipActive,
          ]}
          onPress={() => onFilterChange('OPEN')}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color={activeFilter === 'OPEN' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              branchesStyles.filterChipText,
              activeFilter === 'OPEN' && branchesStyles.filterChipTextActive,
            ]}
          >
            Open Now
          </Text>
        </Pressable>

        <Pressable
          style={[
            branchesStyles.filterChip,
            activeFilter === 'FOREX' && branchesStyles.filterChipActive,
          ]}
          onPress={() => onFilterChange('FOREX')}
        >
          <MaterialCommunityIcons
            name="currency-usd"
            size={14}
            color={activeFilter === 'FOREX' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              branchesStyles.filterChipText,
              activeFilter === 'FOREX' && branchesStyles.filterChipTextActive,
            ]}
          >
            Forex Available
          </Text>
        </Pressable>

        <Pressable
          style={[
            branchesStyles.filterChip,
            activeFilter === 'LOW_QUEUE' && branchesStyles.filterChipActive,
          ]}
          onPress={() => onFilterChange('LOW_QUEUE')}
        >
          <Ionicons
            name="people-outline"
            size={14}
            color={activeFilter === 'LOW_QUEUE' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              branchesStyles.filterChipText,
              activeFilter === 'LOW_QUEUE' && branchesStyles.filterChipTextActive,
            ]}
          >
            Short Queue (&lt;10)
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
