import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { commonStyles } from '../../../assets/styles/common.styles';

interface BadgeProps {
  label: string;
  variant?: 'open' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'open', style, textStyle }) => {
  return (
    <View style={[commonStyles.badge, commonStyles.badgeOpen, style]}>
      <Text style={[commonStyles.badgeText, commonStyles.badgeOpenText, textStyle]}>{label}</Text>
    </View>
  );
};
