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
  distance: string;
  isOpen: boolean;
  hours: string;
  waitingCount: number;
  estimatedWaitMins: number;
  services: string[];
}

interface BranchCardProps {
  branch: BranchData;
  onJoinQueue: (branch: BranchData) => void;
  onGetDirections?: (branch: BranchData) => void;
}

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onJoinQueue,
  onGetDirections,
}) => {
  return (
    <View style={branchesStyles.branchCard}>
      {/* Branch Title & Badges Header */}
      <View style={branchesStyles.branchHeaderRow}>
        <Text style={branchesStyles.branchTitle}>{branch.name}</Text>
        <View style={branchesStyles.badgeRow}>
          <Text style={branchesStyles.distanceTag}>{branch.distance}</Text>
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

      {/* Available Services Section */}
      <View style={branchesStyles.servicesContainer}>
        <Text style={branchesStyles.servicesLabel}>Available Services</Text>
        <View style={branchesStyles.servicesWrap}>
          {branch.services.map((service, idx) => (
            <View key={idx} style={branchesStyles.servicePill}>
              {service.includes('Forex') ? (
                <MaterialCommunityIcons name="currency-usd" size={12} color={COLORS.primary} />
              ) : service.includes('ATM') ? (
                <FontAwesome5 name="credit-card" size={10} color={COLORS.navy} />
              ) : (
                <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
              )}
              <Text style={branchesStyles.servicePillText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons Stack */}
      <View style={branchesStyles.cardActionsRow}>
        
        <Button
          title="Join Queue"
          onPress={()=>onJoinQueue(branch)}
          variant="primary"
          icon={<MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={COLORS.white} />}
          style={branchesStyles.joinQueueButton}
          textStyle={branchesStyles.joinQueueText}
        ></Button>

        <Button
          title="Directions"
          onPress={()=>onGetDirections && onGetDirections(branch)}
          variant="secondary"
          icon={<FontAwesome5 name="directions" size={14} color={COLORS.navy} />}
          style={branchesStyles.directionsButton}
          textStyle={branchesStyles.directionsText}
        ></Button>
      
      </View>
    </View>
  );
};
