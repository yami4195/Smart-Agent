import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { homeStyles } from '../../../assets/styles/home.styles';
import { Badge } from '../common/Badge';
import { COLORS } from '../../../constants/colors';

interface NearestBranchCardProps {
  branchName?: string;
  status?: string;
  distance?: string;
  waitingCount?: number;
  onJoinQueue?: () => void;
  onMapPress?: () => void;
}

export const NearestBranchCard: React.FC<NearestBranchCardProps> = ({
  branchName = "Wegagen - Bole Branch",
  status = "Open",
  distance = "0.5km away",
  waitingCount = 12,
  onJoinQueue,
  onMapPress,
}) => {
  return (
    <View style={homeStyles.nearestBranchCard}>
      {/* Branch Header */}
      <View style={homeStyles.branchHeaderRow}>
        <View style={homeStyles.branchNameContainer}>
          <Text style={homeStyles.branchName}>{branchName}</Text>
          <Badge label={status} variant="open" />
        </View>

        <Pressable style={homeStyles.mapIconButton} onPress={onMapPress}>
          <FontAwesome5 name="map-marked-alt" size={16} color={COLORS.navy} />
        </Pressable>
      </View>

      {/* Distance Row */}
      <View style={homeStyles.branchDistanceRow}>
        <FontAwesome5 name="walking" size={13} color={COLORS.textSecondary} />
        <Text style={homeStyles.distanceText}>{distance}</Text>
      </View>

      {/* Live Queue Sub-Card */}
      <View style={homeStyles.liveQueueCard}>
        <View style={homeStyles.queueInfoLeft}>
          <View style={homeStyles.peopleIconCircle}>
            <Ionicons name="people" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={homeStyles.queueLabel}>Current Queue</Text>
            <Text style={homeStyles.queueCount}>{waitingCount} people waiting</Text>
          </View>
        </View>

        <Pressable style={homeStyles.joinNowButton} onPress={onJoinQueue}>
          <Text style={homeStyles.joinNowText}>Join Now</Text>
        </Pressable>
      </View>
    </View>
  );
};
