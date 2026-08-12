import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { headerStyles } from '../../../assets/styles/header.styles';
import { COLORS } from '../../../constants/colors';

interface HeaderProps {
  title?: string;
  onBankPress?: () => void;
  onAiAgentPress?: () => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Tera Mobile Banking",
  onBankPress,
  onAiAgentPress,
  onNotificationPress,
}) => {
  return (
    <View style={headerStyles.container}>
      {/* Left: Bank Icon (Replaces 3-line hamburger menu) */}
      <View style={headerStyles.leftContainer}>
        <Pressable style={headerStyles.bankIconCircle} onPress={onBankPress}>
          <FontAwesome5 name="university" size={18} color={COLORS.primary} />
        </Pressable>
        <Text style={headerStyles.title}>{title}</Text>
      </View>

      {/* Right: AI Agent Icon + Notification Icon */}
      <View style={headerStyles.rightContainer}>
        {/* AI Agent Icon (Just before Notification Icon) */}
        <Pressable
          style={[headerStyles.iconButton, headerStyles.aiIconButton]}
          onPress={onAiAgentPress}
        >
          <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.aiPurple} />
        </Pressable>

        {/* Notification Icon */}
        <Pressable style={headerStyles.iconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.navy} />
          <View style={headerStyles.notificationBadgeDot} />
        </Pressable>
      </View>
    </View>
  );
};
