import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { branchDetailsStyles } from '../../../../assets/styles/branch-details.styles';
import { COLORS } from '../../../../constants/colors';

interface BranchLiveQueueCardProps {
  waitingCount: number;
  estimatedWaitMins: number;
  isOpen?: boolean;
  nextOpenText?: string;
  onJoinQueue: () => void;
}

export const BranchLiveQueueCard: React.FC<BranchLiveQueueCardProps> = ({
  waitingCount,
  estimatedWaitMins,
  isOpen = true,
  nextOpenText,
  onJoinQueue,
}) => {
  // Determine Queue Level status
  const getQueueLevel = () => {
    if (!isOpen) {
      return {
        label: 'Branch Closed',
        bg: '#FEE2E2',
        color: COLORS.danger,
      };
    }
    if (waitingCount <= 10) {
      return {
        label: 'Low Queue',
        bg: COLORS.successBg,
        color: COLORS.success,
      };
    }
    if (waitingCount <= 25) {
      return {
        label: 'Medium Queue',
        bg: '#FEF3C7',
        color: '#D97706',
      };
    }
    return {
      label: 'High Queue',
      bg: '#FEE2E2',
      color: COLORS.danger,
    };
  };

  const queueLevel = getQueueLevel();

  return (
    <View style={branchDetailsStyles.queueCard}>
      {/* 2-Column Stats: Wait time & Waiting count */}
      <View style={branchDetailsStyles.queueStatsRow}>
        <View style={branchDetailsStyles.queueStatCol}>
          <Text style={branchDetailsStyles.queueStatVal}>{isOpen ? `${estimatedWaitMins} min` : 'Closed'}</Text>
          <Text style={branchDetailsStyles.queueStatLabel}>Wait time</Text>
        </View>

        <View style={branchDetailsStyles.queueDivider} />

        <View style={branchDetailsStyles.queueStatCol}>
          <Text style={branchDetailsStyles.queueStatVal}>{isOpen ? waitingCount : 0}</Text>
          <Text style={branchDetailsStyles.queueStatLabel}>People waiting</Text>
        </View>
      </View>

      {/* Queue Level Row */}
      <View style={branchDetailsStyles.queueLevelBox}>
        <Text style={branchDetailsStyles.queueLevelLabel}>Queue Level</Text>
        <View style={[branchDetailsStyles.queueLevelPill, { backgroundColor: queueLevel.bg }]}>
          <View
            style={[
              branchDetailsStyles.statusBadgeDot,
              { backgroundColor: queueLevel.color },
            ]}
          />
          <Text style={[branchDetailsStyles.queueLevelPillText, { color: queueLevel.color }]}>
            {queueLevel.label}
          </Text>
        </View>
      </View>

      {/* Join Queue CTA Button */}
      <TouchableOpacity
        style={[
          branchDetailsStyles.joinQueueBtn,
          !isOpen && { backgroundColor: COLORS.navy, opacity: 0.9 },
        ]}
        onPress={onJoinQueue}
        activeOpacity={0.85}
      >
        {isOpen ? (
          <>
            <MaterialCommunityIcons name="account-arrow-right-outline" size={19} color={COLORS.white} />
            <Text style={branchDetailsStyles.joinQueueBtnText}>Join Queue</Text>
          </>
        ) : (
          <>
            <Ionicons name="time-outline" size={19} color={COLORS.white} />
            <Text style={branchDetailsStyles.joinQueueBtnText} numberOfLines={1} ellipsizeMode="tail">
              {nextOpenText ? `Closed • ${nextOpenText}` : 'Branch Closed • View Hours'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

