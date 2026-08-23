import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branchDetailsStyles } from '../../../../assets/styles/branch-details.styles';
import { COLORS } from '../../../../constants/colors';

interface BranchDetailsHeaderProps {
  name: string;
  isOpen: boolean;
  distance?: string;
  address: string;
  onGetDirections?: () => void;
}

export const BranchDetailsHeader: React.FC<BranchDetailsHeaderProps> = ({
  name,
  isOpen,
  distance = '1.2 km away',
  address,
  onGetDirections,
}) => {
  return (
    <View style={branchDetailsStyles.headerCard}>
      {/* Top Title & Status Badge Row */}
      <View style={branchDetailsStyles.headerTopRow}>
        <Text style={branchDetailsStyles.branchTitle}>{name}</Text>
        <View
          style={[
            branchDetailsStyles.statusBadge,
            isOpen
              ? branchDetailsStyles.statusBadgeOpen
              : branchDetailsStyles.statusBadgeClosed,
          ]}
        >
          <View
            style={[
              branchDetailsStyles.statusBadgeDot,
              { backgroundColor: isOpen ? COLORS.success : COLORS.danger },
            ]}
          />
          <Text
            style={
              isOpen
                ? branchDetailsStyles.statusBadgeOpenText
                : branchDetailsStyles.statusBadgeClosedText
            }
          >
            {isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>

      {/* Distance Subtitle */}
      {distance ? (
        <Text style={branchDetailsStyles.distanceText}>{distance}</Text>
      ) : null}

      {/* Address & Get Directions Box */}
      <View style={branchDetailsStyles.addressBox}>
        <View style={branchDetailsStyles.addressRow}>
          <Ionicons name="location-sharp" size={18} color={COLORS.navy} style={{ marginTop: 1 }} />
          <Text style={branchDetailsStyles.addressText}>{address}</Text>
        </View>

        <TouchableOpacity
          style={branchDetailsStyles.directionsBtn}
          onPress={onGetDirections}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="compass-outline" size={17} color={COLORS.navy} />
          <Text style={branchDetailsStyles.directionsBtnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
