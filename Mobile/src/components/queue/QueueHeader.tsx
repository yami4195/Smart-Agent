import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { queueStyles } from '../../../assets/styles/queue.styles';

interface QueueHeaderProps {
  title?: string;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  showBack?: boolean;
}

export const QueueHeader: React.FC<QueueHeaderProps> = ({
  title = 'My Queue',
  onBackPress,
  onNotificationPress,
  showBack = true,
}) => {
  return (
    <View style={queueStyles.headerContainer}>
      {/* Left: Back Button */}
      {showBack ? (
        <TouchableOpacity
          style={queueStyles.headerIconButton}
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
      ) : (
        <View style={queueStyles.headerIconButton} />
      )}

      {/* Center: Title */}
      <Text style={queueStyles.headerTitle}>{title}</Text>

      {/* Right: Notifications Bell */}
      <TouchableOpacity
        style={queueStyles.headerIconButton}
        onPress={onNotificationPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="notifications-outline" size={22} color="#0F172A" />
      </TouchableOpacity>
    </View>
  );
};

export default QueueHeader;
