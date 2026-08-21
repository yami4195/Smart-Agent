import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { commonStyles } from '../../../assets/styles/common.styles';
import { COLORS } from '../../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'open' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'open',
  icon,
  style,
  textStyle,
}) => {
  const variantStyles = {
    open: {
      container: commonStyles.badgeOpen,
      text: commonStyles.badgeOpenText,
    },
    success: {
      container: badgeVariants.successBg,
      text: badgeVariants.successText,
    },
    warning: {
      container: badgeVariants.warningBg,
      text: badgeVariants.warningText,
    },
    danger: {
      container: badgeVariants.dangerBg,
      text: badgeVariants.dangerText,
    },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.open;

  return (
    <View style={[commonStyles.badge, badgeVariants.badgeContainer, selectedVariant.container, style]}>
      {icon}
      <Text style={[commonStyles.badgeText, selectedVariant.text, textStyle]}>{label}</Text>
    </View>
  );
};

const badgeVariants = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  successBg: {
    backgroundColor: COLORS.successBg,
  },
  successText: {
    color: '#059669',
    fontWeight: '700',
  },
  warningBg: {
    backgroundColor: COLORS.warningBg,
  },
  warningText: {
    color: COLORS.warning,
    fontWeight: '700',
  },
  dangerBg: {
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    color: COLORS.danger,
    fontWeight: '700',
  },
});
