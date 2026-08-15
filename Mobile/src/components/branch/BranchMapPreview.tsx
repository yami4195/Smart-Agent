import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { branchesStyles } from '../../../assets/styles/branches.styles';
import { BranchData } from './BranchCard';
import { COLORS } from '../../../constants/colors';

interface BranchMapPreviewProps {
  branches: BranchData[];
  onSelectBranchPin: (branch: BranchData) => void;
}

export const BranchMapPreview: React.FC<BranchMapPreviewProps> = ({
  branches,
  onSelectBranchPin,
}) => {
  return (
    <View style={branchesStyles.mapContainer}>
      {/* Top Map Badge Overlay */}
      <View style={branchesStyles.mapOverlayHeader}>
        <View style={branchesStyles.mapBadge}>
          <FontAwesome5 name="map-marked-alt" size={12} color={COLORS.white} />
          <Text style={branchesStyles.mapBadgeText}>Addis Ababa Branches ({branches.length})</Text>
        </View>
      </View>

      {/* Simulated Pin Markers Container */}
      <View style={{ gap: 12, paddingVertical: 10 }}>
        {branches.slice(0, 3).map((branch) => (
          <Pressable
            key={branch.id}
            style={branchesStyles.mapPinMarker}
            onPress={() => onSelectBranchPin(branch)}
          >
            <View style={branchesStyles.mapPinBubble}>
              <Text style={branchesStyles.mapPinText}>📍 {branch.name} ({branch.waitingCount} in Q)</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Bottom Hint */}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' }}>
          Tap a pin to select branch & join queue
        </Text>
      </View>
    </View>
  );
};
