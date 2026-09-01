import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../../../assets/styles/home.styles';
import { Badge } from '../common/Badge';
import { COLORS } from '../../../constants/colors';
import { isBranchOpenNow, getBranchStatusInfo } from '../../utils/openingHours';

interface NearestBranchCardProps {
  branchName?: string;
  isOpen?: boolean;
  distance?: string;
  waitingCount?: number;
  hours?: string;
  onJoinQueue?: () => void;
  onMapPress?: () => void;
}

export const NearestBranchCard: React.FC<NearestBranchCardProps> = ({
  branchName = 'Wegagen - Bole Branch',
  isOpen: propIsOpen,
  distance = '0.5km away',
  waitingCount = 0,
  hours,
  onJoinQueue,
  onMapPress,
}) => {
  // If propIsOpen was explicitly provided, use it; otherwise compute based on local schedule
  const effectiveIsOpen =
    propIsOpen !== undefined
      ? isBranchOpenNow(propIsOpen, hours)
      : isBranchOpenNow(true, hours);

  const statusInfo = getBranchStatusInfo(effectiveIsOpen, hours);

  return (
    <View style={homeStyles.nearestBranchCard}>
      {/* Branch Header */}
      <View style={homeStyles.branchHeaderRow}>
        <View style={homeStyles.branchNameContainer}>
          <Text style={homeStyles.branchName} numberOfLines={1}>
            {branchName}
          </Text>
          <Badge
            label={statusInfo.statusText}
            variant={statusInfo.badgeVariant}
          />
        </View>

        <Pressable
          style={homeStyles.mapIconButton}
          onPress={onMapPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome5 name="map-marked-alt" size={16} color={COLORS.navy} />
        </Pressable>
      </View>

      {/* Distance & Schedule Row */}
      <View style={homeStyles.subInfoRow}>
        <View style={homeStyles.distanceBadge}>
          <FontAwesome5 name="walking" size={12} color={COLORS.textSecondary} />
          <Text style={homeStyles.distanceText}>{distance}</Text>
        </View>
        {!effectiveIsOpen && statusInfo.nextOpenText ? (
          <Text style={homeStyles.nextOpenBadge} numberOfLines={1} ellipsizeMode="tail">
            {statusInfo.nextOpenText}
          </Text>
        ) : null}
      </View>

      {/* Live Queue Sub-Card */}
      <View style={homeStyles.liveQueueCard}>
        <View style={homeStyles.queueInfoLeft}>
          <View style={homeStyles.peopleIconCircle}>
            <Ionicons name="people" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={homeStyles.queueLabel}>Current Queue</Text>
            <Text style={homeStyles.queueCount}>
              {effectiveIsOpen ? `${waitingCount} people waiting` : 'Queue closed'}
            </Text>
          </View>
        </View>

        <Pressable
          style={homeStyles.joinNowButton}
          onPress={onJoinQueue}
        >
          <Text style={homeStyles.joinNowText}>
            {effectiveIsOpen ? 'Join Now' : 'View Branch'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
