import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { commonStyles } from '../../../assets/styles/common.styles';
import { COLORS } from '../../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  leftIcon,
  rightIcon,
  error,
  style,
  ...props
}) => {
  return (
    <View style={commonStyles.inputWrapper}>
      {label && <Text style={commonStyles.inputLabel}>{label}</Text>}
      <View style={[commonStyles.inputContainer, error && { borderColor: COLORS.danger }]}>
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <TextInput
          style={[commonStyles.input, style]}
          placeholderTextColor={COLORS.textMuted}
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
      </View>
      {error && <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
};
