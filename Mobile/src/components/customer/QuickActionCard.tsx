import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { homeStyles } from '../../../assets/styles/home.styles';
import { COLORS } from '../../../constants/colors';

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, icon, onPress }) => {
  return (
    <Pressable style={homeStyles.quickActionCard} onPress={onPress}>
      <View style={homeStyles.iconCircle}>{icon}</View>
      <Text style={homeStyles.quickActionTitle}>{title}</Text>
    </Pressable>
  );
};
