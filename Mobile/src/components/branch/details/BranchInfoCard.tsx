import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { branchDetailsStyles } from '../../../../assets/styles/branch-details.styles';
import { COLORS } from '../../../../constants/colors';

interface BranchInfoCardProps {
  hours?: string;
  phone?: string | null;
  facilities?: string;
}

export const BranchInfoCard: React.FC<BranchInfoCardProps> = ({
  hours = 'Mon-Fri: 8:00 AM - 5:00 PM\nSat: 8:00 AM - 12:00 PM',
  phone = '+251 11 661 2345',
  facilities = 'ATM (24/7), Wheelchair Accessible, Parking',
}) => {
  return (
    <View style={branchDetailsStyles.infoCard}>
      {/* Operating Hours */}
      <View style={branchDetailsStyles.infoRow}>
        <View style={branchDetailsStyles.infoIconWrap}>
          <Ionicons name="time-outline" size={17} color={COLORS.primary} />
        </View>
        <View style={branchDetailsStyles.infoContent}>
          <Text style={branchDetailsStyles.infoLabel}>Operating Hours</Text>
          <Text style={branchDetailsStyles.infoValue}>{hours}</Text>
        </View>
      </View>

      <View style={branchDetailsStyles.infoDivider} />

      {/* Contact Number */}
      <View style={branchDetailsStyles.infoRow}>
        <View style={branchDetailsStyles.infoIconWrap}>
          <Ionicons name="call-outline" size={16} color={COLORS.primary} />
        </View>
        <View style={branchDetailsStyles.infoContent}>
          <Text style={branchDetailsStyles.infoLabel}>Contact Number</Text>
          <Text style={branchDetailsStyles.infoValue}>{phone || '+251 11 661 2345'}</Text>
        </View>
      </View>

      <View style={branchDetailsStyles.infoDivider} />

      {/* Facilities */}
      <View style={branchDetailsStyles.infoRow}>
        <View style={branchDetailsStyles.infoIconWrap}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
        </View>
        <View style={branchDetailsStyles.infoContent}>
          <Text style={branchDetailsStyles.infoLabel}>Facilities</Text>
          <Text style={branchDetailsStyles.infoValue}>{facilities}</Text>
        </View>
      </View>
    </View>
  );
};
