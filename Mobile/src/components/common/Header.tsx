import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { headerStyles } from '../../../assets/styles/header.styles';
import { COLORS } from '../../../constants/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showBankIcon?: boolean;
  showAiAgent?: boolean;
  showNotification?: boolean;
  unreadCount?: number;
  onBankPress?: () => void;
  onAiAgentPress?: () => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'ተራ Mobile Services',
  subtitle,
  showBack = false,
  onBackPress,
  showBankIcon = true,
  showAiAgent = true,
  showNotification = true,
  unreadCount = 0,
  onBankPress,
  onAiAgentPress,
  onNotificationPress,
}) => {
  return (
    <View style={headerStyles.container}>
      {/* Left: Back Button OR Bank Icon + Title & Subtitle */}
      <View style={headerStyles.leftContainer}>
        {showBack ? (
          <Pressable style={headerStyles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
          </Pressable>
        ) : (
          showBankIcon && (
            <Pressable style={headerStyles.bankIconCircle} onPress={onBankPress}>
              <Image
                source={require('../../../assets/images/wegagenLogo2.webp')}
                style={{ width: 28, height: 28, resizeMode: 'contain' }}
              />
            </Pressable>
          )
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
            {unreadCount > 0 && (
              <View style={headerStyles.unreadBadge}>
                <Text style={headerStyles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default Header;
