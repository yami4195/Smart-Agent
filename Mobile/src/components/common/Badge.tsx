import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { commonStyles } from '../../../assets/styles/common.styles';

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
      container: commonStyles.badgeSuccess,
      text: commonStyles.badgeSuccessText,
    },
    warning: {
      container: commonStyles.badgeWarning,
      text: commonStyles.badgeWarningText,
    },
    danger: {
      container: commonStyles.badgeDanger,
      text: commonStyles.badgeDangerText,
    },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.open;

  return (
    <View style={[commonStyles.badge, commonStyles.badgeContainer, selectedVariant.container, style]}>
      {icon}
      <Text style={[commonStyles.badgeText, selectedVariant.text, textStyle]}>{label}</Text>
    </View>
  );
};

export default Badge;
