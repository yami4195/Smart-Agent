import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { headerStyles } from '../../../assets/styles/header.styles';
import { COLORS } from '../../../constants/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBankIcon?: boolean;
  showAiAgent?: boolean;
  showNotification?: boolean;
  onBankPress?: () => void;
  onAiAgentPress?: () => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Tera Mobile Banking",
  subtitle,
  showBankIcon = true,
  showAiAgent = true,
  showNotification = true,
  onBankPress,
  onAiAgentPress,
  onNotificationPress,
}) => {
  return (
    <View style={headerStyles.container}>
      {/* Left: Bank Icon + Title & Subtitle */}
      <View style={headerStyles.leftContainer}>
        {showBankIcon && (
          <Pressable style={headerStyles.bankIconCircle} onPress={onBankPress}>
            <FontAwesome5 name="university" size={18} color={COLORS.primary} />
          </Pressable>
        )}
        <View style={headerStyles.titleContainer}>
          <Text style={headerStyles.title}>{title}</Text>
          {subtitle ? <Text style={headerStyles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {/* Right: AI Agent Icon + Notification Icon */}
      <View style={headerStyles.rightContainer}>
        {showAiAgent && (
          <Pressable
            style={[headerStyles.iconButton, headerStyles.aiIconButton]}
            onPress={onAiAgentPress}
          >
            <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.aiPurple} />
          </Pressable>
        )}

        {showNotification && (
          <Pressable style={headerStyles.iconButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.navy} />
            <View style={headerStyles.notificationBadgeDot} />
          </Pressable>
        )}
      </View>
    </View>
  );
};
