import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branchesStyles } from '../../../assets/styles/branches.styles';
import { Badge } from '../common/Badge';
import { COLORS } from '../../../constants/colors';
import { Button } from '../common/Button';

export interface BranchData {
  id: string;
  name: string;
  address: string;
  distance?: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  isOpen: boolean;
  hours: string;
  phone?: string | null;
  waitingCount: number;
  estimatedWaitMins: number;
  services: string[];
  imageUrl?: string;
}

interface BranchCardProps {
  branch: BranchData;
  onJoinQueue: (branch: BranchData) => void;
  onDetails?: (branch: BranchData) => void;
  onGetDirections?: (branch: BranchData) => void;
}

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onJoinQueue,
  onDetails,
  onGetDirections,
}) => {
  return (
    <View style={branchesStyles.branchCard}>
      {/* Branch Title & Badges Header */}
      <View style={branchesStyles.branchHeaderRow}>
        <Text style={branchesStyles.branchTitle}>{branch.name}</Text>
        <View style={branchesStyles.badgeRow}>
          {branch.distance ? (
            <Text style={branchesStyles.distanceTag}>{branch.distance}</Text>
          ) : null}
          <Badge
            label={branch.isOpen ? 'Open Now' : 'Closed'}
            variant={branch.isOpen ? 'open' : 'danger'}
            style={branch.isOpen ? branchesStyles.statusBadgeOpen : branchesStyles.statusBadgeClosed}
            textStyle={branch.isOpen ? branchesStyles.statusBadgeOpenText : branchesStyles.statusBadgeClosedText}
          />
        </View>
      </View>

      {/* Address / Location Row */}
      <View style={branchesStyles.locationRow}>
        <Ionicons name="location-outline" size={15} color={COLORS.textSecondary} />
        <Text style={branchesStyles.locationText}>{branch.address}</Text>
      </View>

      {/* Working Hours Row */}
      <View style={branchesStyles.hoursRow}>
        <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
        <Text style={branchesStyles.hoursText}>Hours: {branch.hours}</Text>
      </View>

      {/* Live Queue Status Banner */}
      <View style={branchesStyles.queueStatusBanner}>
        <View style={branchesStyles.queueInfoLeft}>
          <View style={branchesStyles.queueIconCircle}>
            <Ionicons name="people" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={branchesStyles.queueCountText}>
              {branch.waitingCount} People Waiting
            </Text>
            <Text style={branchesStyles.queueSubtext}>Live Branch Queue</Text>
          </View>
        </View>

        <View style={branchesStyles.waitEstimateBadge}>
          <Text style={branchesStyles.waitEstimateText}>
            ~{branch.estimatedWaitMins} mins wait
          </Text>
        </View>
      </View>

    

      {/* Action Buttons: Details & Join Queue */}
      <View style={branchesStyles.cardActionsRow}>
        <Button
          title="View Details"
          onPress={() => (onDetails ? onDetails(branch) : onGetDirections && onGetDirections(branch))}
          variant="outlineNavy"
          icon={<Ionicons name="information-circle-outline" size={16} color={COLORS.navy} />}
          style={branchesStyles.detailsButton}
          textStyle={branchesStyles.detailsText}
        />

        <Button
          title="Join Queue"
          onPress={() => onJoinQueue(branch)}
          variant="primary"
          icon={<MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={COLORS.white} />}
          style={branchesStyles.joinQueueButton}
          textStyle={branchesStyles.joinQueueText}
        />
      </View>
    </View>
  );
};
