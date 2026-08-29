import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  title = "ተራ Mobile Services",
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
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : (
              <View style={headerStyles.notificationBadgeDot} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  unreadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
