import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { queueStyles } from '../../../assets/styles/queue.styles';

interface QueueActionButtonsProps {
  onCancelTicket: () => void;
  onReschedule?: () => void;
  isCanceling?: boolean;
}

export const QueueActionButtons: React.FC<QueueActionButtonsProps> = ({
  onCancelTicket,
  onReschedule,
  isCanceling = false,
}) => {
  const handleCancelPress = () => {
    Alert.alert(
      'Cancel Ticket',
      'Are you sure you want to cancel your queue ticket? You will lose your position in line.',
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: onCancelTicket,
        },
      ]
    );
  };

  const handleReschedulePress = () => {
    if (onReschedule) {
      onReschedule();
    } else {
      Alert.alert(
        'Reschedule Appointment',
        'Would you like to book a scheduled slot for another time at this branch?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Choose Time',
            onPress: () => {
              Alert.alert('Success', 'Reschedule request submitted. We will notify you once confirmed.');
            },
          },
        ]
      );
    }
  };

  return (
    <View style={queueStyles.actionButtonsRow}>
      {/* Cancel Ticket Button */}
      <TouchableOpacity
        style={queueStyles.actionButton}
        onPress={handleCancelPress}
        disabled={isCanceling}
        activeOpacity={0.75}
      >
        <Ionicons
          name="close"
          size={18}
          color="#0F172A"
          style={queueStyles.actionButtonIcon}
        />
        <Text style={queueStyles.actionButtonText}>Cancel Ticket</Text>
      </TouchableOpacity>

      {/* Reschedule Button */}
      <TouchableOpacity
        style={queueStyles.actionButton}
        onPress={handleReschedulePress}
        activeOpacity={0.75}
      >
        <MaterialCommunityIcons
          name="calendar-clock-outline"
          size={18}
          color="#0F172A"
          style={queueStyles.actionButtonIcon}
        />
        <Text style={queueStyles.actionButtonText}>Reschedule</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QueueActionButtons;
