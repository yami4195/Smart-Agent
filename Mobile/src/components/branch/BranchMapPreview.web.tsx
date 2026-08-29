import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { branchesStyles } from '../../../assets/styles/branches.styles';
import { BranchData } from './BranchCard';
import { COLORS } from '../../../constants/colors';
import { isBranchOpenNow } from '../../utils/openingHours';

interface BranchMapPreviewProps {
  branches: BranchData[];
  selectedBranch?: BranchData | null;
  onSelectBranch?: (branch: BranchData) => void;
  onJoinQueue: (branch: BranchData) => void;
  onViewDetails?: (branch: BranchData) => void;
}

export const BranchMapPreview: React.FC<BranchMapPreviewProps> = ({
  branches,
  selectedBranch: propSelectedBranch,
  onSelectBranch,
  onJoinQueue,
  onViewDetails,
}) => {
  const [activeBranch, setActiveBranch] = useState<BranchData | null>(
    propSelectedBranch || (branches.length > 0 ? branches[0] : null)
  );

  useEffect(() => {
    if (propSelectedBranch) {
      setActiveBranch(propSelectedBranch);
    } else if (!activeBranch && branches.length > 0) {
      setActiveBranch(branches[0]);
    }
  }, [propSelectedBranch, branches]);

  const handleSelect = (branch: BranchData) => {
    setActiveBranch(branch);
    if (onSelectBranch) {
      onSelectBranch(branch);
    }
  };

  return (
    <View style={branchesStyles.mapWrapper}>
      {/* Web Map View (Interactive OpenStreetMap iframe) */}
      <iframe
        title="Branch Locations Map"
        src="https://www.openstreetmap.org/export/embed.html?bbox=38.7000%2C8.9500%2C38.8300%2C9.0600&amp;layer=mapnik"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          borderRadius: 16,
        }}
      />

      {/* Top Map Badge Indicator */}
      <View style={branchesStyles.mapOverlayHeader}>
        <View style={branchesStyles.mapBadge}>
          <FontAwesome5 name="map-marked-alt" size={12} color={COLORS.white} />
          <Text style={branchesStyles.mapBadgeText}>
            {branches.length} {branches.length === 1 ? 'Location' : 'Locations'} (Web View)
          </Text>
        </View>
      </View>

      {/* Floating Active Branch Popup Overlay Card */}
      {activeBranch && (
        <View style={branchesStyles.mapCardOverlay}>
          {/* Card Title & Close Button */}
          <View style={branchesStyles.mapCardHeader}>
            <Text style={branchesStyles.mapCardTitle} numberOfLines={1}>
              {activeBranch.name}
            </Text>
            <TouchableOpacity
              onPress={() => setActiveBranch(null)}
              style={branchesStyles.mapCardCloseBtn}
            >
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Status & Distance Row */}
          {(() => {
            const isOpen = isBranchOpenNow(activeBranch.isOpen, activeBranch.hours);
            return (
              <View style={branchesStyles.mapCardStatusRow}>
                <View
                  style={[
                    branchesStyles.mapCardStatusDot,
                    { backgroundColor: isOpen ? COLORS.success : COLORS.danger },
                  ]}
                />
                <Text
                  style={[
                    branchesStyles.mapCardStatusText,
                    { color: isOpen ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {isOpen ? 'Open' : 'Closed'}
                </Text>
                <Text style={branchesStyles.mapCardDotSeparator}>•</Text>
                <Text style={branchesStyles.mapCardDistanceText}>
                  {activeBranch.distance || '0.8km away'}
                </Text>
              </View>
            );
          })()}

          {/* Queue and Wait Time Metrics */}
          <View style={branchesStyles.mapCardStatsBox}>
            <View style={branchesStyles.mapCardStatCol}>
              <Text style={branchesStyles.mapCardStatLabel}>Queue</Text>
              <Text style={branchesStyles.mapCardStatVal}>
                {activeBranch.waitingCount} waiting
              </Text>
            </View>
            <View style={branchesStyles.mapCardStatDivider} />
            <View style={branchesStyles.mapCardStatCol}>
              <Text style={branchesStyles.mapCardStatLabel}>Est. Wait</Text>
              <Text style={branchesStyles.mapCardStatVal}>
                {activeBranch.estimatedWaitMins} min
              </Text>
            </View>
          </View>

          {/* Action Buttons: Details and Join Queue */}
          <View style={branchesStyles.mapCardActionsRow}>
            <TouchableOpacity
              style={branchesStyles.mapCardDetailsBtn}
              onPress={() =>
                onViewDetails ? onViewDetails(activeBranch) : onJoinQueue(activeBranch)
              }
            >
              <Text style={branchesStyles.mapCardDetailsBtnText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={branchesStyles.mapCardJoinBtn}
              onPress={() => onJoinQueue(activeBranch)}
            >
              <Text style={branchesStyles.mapCardJoinBtnText}>Join Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default BranchMapPreview;