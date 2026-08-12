import React from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import { commonStyles } from '../../../assets/styles/common.styles';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <Pressable style={[commonStyles.card, style]} onPress={onPress}>
        {children}
      </Pressable>
    );
  }
  return <View style={[commonStyles.card, style]}>{children}</View>;
};
