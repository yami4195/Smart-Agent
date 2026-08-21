import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from '../../../assets/styles/profile.styles';
import { Badge } from '../common/Badge';
import { COLORS } from '../../../constants/colors';

export interface ProfileStatusCardProps {
  label: string;
  status: string;
  variant?: 'success' | 'open' | 'warning' | 'danger';
}

export const ProfileStatusCard: React.FC<ProfileStatusCardProps> = ({
  label,
  status,
  variant = 'success',
}) => {
  return (
    <View style={profileStyles.statusCard}>
      <Text style={profileStyles.statusLabel}>{label}</Text>
      <Badge
        label={status}
        variant={variant}
        icon={<Ionicons name="checkmark-circle" size={14} color={variant === 'success' ? '#059669' : COLORS.primary} />}
      />
    </View>
  );
};
