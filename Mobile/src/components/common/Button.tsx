import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { commonStyles } from '../../../assets/styles/common.styles';
import { COLORS } from '../../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'navy' | 'secondary' | 'outline' | 'outlineNavy' | 'text';
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
  
  const styleMap = {
    primary: { container: commonStyles.buttonPrimary, text: commonStyles.buttonPrimaryText },
    navy: { container: commonStyles.buttonNavy, text: commonStyles.buttonNavyText },
    secondary: { container: commonStyles.buttonSecondary, text: commonStyles.buttonSecondaryText },
    outline: { container: commonStyles.buttonOutline, text: commonStyles.buttonOutlineText },
    outlineNavy: { container: commonStyles.buttonOutlineNavy, text: commonStyles.buttonOutlineNavyText },
    text: { container: commonStyles.buttonText, text: commonStyles.buttonTextOnly },
  };

  const { container: baseStyle, text: baseTextStyle } = styleMap[variant];
  const isLightText = variant === 'primary' || variant === 'navy';

  return (
    <Pressable
      style={[baseStyle, disabled && { opacity: 0.6 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isLightText ? COLORS.white : COLORS.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[baseTextStyle, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};
