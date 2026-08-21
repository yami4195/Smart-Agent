import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from '../../../assets/styles/profile.styles';
import { COLORS } from '../../../constants/colors';

export interface MemberSinceCardProps {
  memberSince: string;
}

export const MemberSinceCard: React.FC<MemberSinceCardProps> = ({
  memberSince,
}) => {
  return (
    <View style={profileStyles.memberSinceCard}>
      <View style={profileStyles.memberSinceHeader}>
        <Ionicons name="calendar-outline" size={16} color={COLORS.navy} />
        <Text style={profileStyles.memberSinceLabel}>MEMBER SINCE</Text>
      </View>
      <Text style={profileStyles.memberSinceValue}>{memberSince || 'January 2022'}</Text>
    </View>
  );
};
