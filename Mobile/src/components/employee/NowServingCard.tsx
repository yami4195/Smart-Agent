import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EmployeeTicket } from '../../api/employee.api';
import { employeeStyles } from '../../../assets/styles/employee.styles';
import { COLORS } from '../../../constants/colors';

interface NowServingCardProps {
  ticket: EmployeeTicket;
  counterNumber: string;
  onComplete: (ticketId: string) => void;
  onNoShow: (ticketId: string) => void;
  onRecall?: (ticketId: string) => void;
}

export const NowServingCard: React.FC<NowServingCardProps> = ({
  ticket,
  counterNumber,
  onComplete,
  onNoShow,
  onRecall,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Live timer counting service duration
  useEffect(() => {
    // calculate start from ticket updatedAt or now
    const startTime = new Date(ticket.updatedAt || ticket.createdAt).getTime();
    const now = Date.now();
    const initialElapsed = Math.max(0, Math.floor((now - startTime) / 1000));
    setSecondsElapsed(initialElapsed);

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket.id, ticket.updatedAt]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRecallPress = () => {
    if (onRecall) {
      onRecall(ticket.id);
    } else {
      Alert.alert(
        'Recall Customer',
        `Re-calling ticket ${ticket.ticketNumber} to Counter ${counterNumber}. Notification sent to customer.`
      );
    }
  };

  const handleNoShowPress = () => {
    Alert.alert(
      'Mark as No-Show?',
      `Are you sure customer ${ticket.ticketNumber} did not show up? This will cancel the ticket.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm No-Show',
          style: 'destructive',
          onPress: () => onNoShow(ticket.id),
        },
      ]
    );
  };

  return (
    <View style={employeeStyles.servingCard}>
      {/* Top Row: Badge & Live Timer */}
      <View style={employeeStyles.servingTopRow}>
        <View style={employeeStyles.servingBadge}>
          <Text style={employeeStyles.servingBadgeText}>NOW SERVING</Text>
        </View>

        <View style={employeeStyles.servingTimerContainer}>
          <Feather name="clock" size={13} color="#FFFFFF" />
          <Text style={employeeStyles.servingTimerText}>{formatTimer(secondsElapsed)}</Text>
        </View>
      </View>

      {/* Ticket Number & Service Pill */}
      <View style={employeeStyles.ticketHeroRow}>
        <Text style={employeeStyles.ticketHeroNumber}>{ticket.ticketNumber}</Text>
        <View style={employeeStyles.ticketServicePill}>
          <Text style={employeeStyles.ticketServiceText}>{ticket.serviceName}</Text>
        </View>
      </View>

      {/* Customer Info Card */}
      <View style={employeeStyles.customerInfoBox}>
        <Text style={employeeStyles.customerName}>{ticket.customerName || 'Walk-in Customer'}</Text>
        {ticket.customerPhone ? (
          <Text style={employeeStyles.customerPhone}>{ticket.customerPhone}</Text>
        ) : null}
      </View>

      {/* Action Buttons: Complete, No-Show, Recall */}
      <View style={employeeStyles.servingActionsRow}>
        <TouchableOpacity
          style={employeeStyles.completeButton}
          onPress={() => onComplete(ticket.id)}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={employeeStyles.completeButtonText}>Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={employeeStyles.noShowButton}
          onPress={handleNoShowPress}
          activeOpacity={0.85}
        >
          <Feather name="user-x" size={16} color="#EF4444" />
          <Text style={employeeStyles.noShowButtonText}>No-Show</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={employeeStyles.recallButton}
          onPress={handleRecallPress}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="bullhorn-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NowServingCard;
