import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { commonStyles } from '../../../assets/styles/common.styles';
import { COLORS } from '../../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  const baseStyle = isPrimary ? commonStyles.buttonPrimary : commonStyles.buttonSecondary;
  const baseTextStyle = isPrimary ? commonStyles.buttonPrimaryText : commonStyles.buttonSecondaryText;

  return (
    <Pressable
      style={[
        baseStyle,
        disabled && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[baseTextStyle, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};
