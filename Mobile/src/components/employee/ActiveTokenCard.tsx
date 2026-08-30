import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { EmployeeTicket } from '../../api/employee.api';
import { employeeStyles } from '../../../assets/styles/employee.styles';

interface ActiveTokenCardProps {
  ticket: EmployeeTicket;
  onCallNext?: (ticket: EmployeeTicket) => void;
  onComplete?: (ticket: EmployeeTicket) => void;
  onTransfer?: (ticket: EmployeeTicket) => void;
  onPress?: (ticket: EmployeeTicket) => void;
}

export const ActiveTokenCard: React.FC<ActiveTokenCardProps> = ({
  ticket,
  onCallNext,
  onComplete,
  onTransfer,
  onPress,
}) => {
  const isWaiting = ticket.status === 'WAITING';
  const isServing = ticket.status === 'SERVING';
  const isCompleted = ticket.status === 'COMPLETED';
  const isCancelled = ticket.status === 'CANCELLED';

  const isDelayed = isWaiting && (ticket.estimatedWaitMins ? ticket.estimatedWaitMins > 25 : false);

  const timeText = (() => {
    if (isCompleted) return 'Completed';
    if (isCancelled) return 'Cancelled';
    if (isServing) return '5m elapsed';
    return `${ticket.estimatedWaitMins || 12}m wait`;
  })();

  const statusConfig = (() => {
    if (isCompleted) {
      return { label: 'Completed', color: '#10B981', dotColor: '#10B981' };
    }
    if (isCancelled) {
      return { label: 'Cancelled', color: '#EF4444', dotColor: '#EF4444' };
    }
    if (isServing) {
      return { label: 'Serving', color: '#10B981', dotColor: '#10B981' };
    }
    if (isDelayed) {
      return { label: 'Delayed', color: '#EF4444', dotColor: '#EF4444' };
    }
    return { label: 'Waiting', color: '#EE7D17', dotColor: '#EE7D17' };
  })();

  // Format token number to match e.g. A-101
  const formattedToken = ticket.ticketNumber.includes('-')
    ? ticket.ticketNumber
    : ticket.ticketNumber.length > 1 && !isNaN(Number(ticket.ticketNumber.slice(1)))
    ? `${ticket.ticketNumber[0]}-${ticket.ticketNumber.slice(1)}`
    : ticket.ticketNumber;

  return (
    <TouchableOpacity
      style={employeeStyles.activeTokenCard}
      onPress={() => onPress?.(ticket)}
      activeOpacity={0.8}
    >
      {/* Main Info Row */}
      <View style={employeeStyles.activeTokenMainRow}>
        {/* Token Badge */}
        <View style={employeeStyles.activeTokenBadge}>
          <Text style={employeeStyles.activeTokenText}>{formattedToken}</Text>
        </View>

        {/* Details Column */}
        <View style={employeeStyles.activeTokenDetailsCol}>
          <Text style={employeeStyles.activeTokenServiceName} numberOfLines={1}>
            {ticket.serviceName || 'Cashier'}
          </Text>

          <View style={employeeStyles.activeTokenStatusRow}>
            {/* Time Indicator */}
            <View style={employeeStyles.activeTokenTimeWrapper}>
              <Feather
                name="clock"
                size={13}
                color={isDelayed || isCancelled ? '#EF4444' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  employeeStyles.activeTokenTimeText,
                  (isDelayed || isCancelled) && { color: '#EF4444', fontWeight: '600' },
                ]}
              >
                {timeText}
              </Text>
            </View>

            {/* Status Dot & Label */}
            <View style={employeeStyles.activeTokenStatusWrapper}>
              <View
                style={[employeeStyles.activeTokenStatusDot, { backgroundColor: statusConfig.dotColor }]}
              />
              <Text style={[employeeStyles.activeTokenStatusLabel, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Row */}
      <View style={employeeStyles.activeTokenBottomRow}>
        {/* Reassign / Transfer Action (only for uncompleted / active tickets) */}
        {!isCompleted && !isCancelled ? (
          <TouchableOpacity
            style={employeeStyles.activeTokenTransferBtn}
            onPress={() => onTransfer?.(ticket)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="swap-horizontal" size={20} color="#94A3B8" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        {/* Action Button:
            1. WAITING (uncompleted) -> Call Next button
            2. SERVING (in progress) -> Complete button
            3. COMPLETED -> Completed Pill Badge
            4. CANCELLED -> Cancelled Pill Badge
        */}
        {isWaiting && (
          <TouchableOpacity
            style={employeeStyles.activeTokenCallNextBtn}
            onPress={() => onCallNext?.(ticket)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="megaphone-outline"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={employeeStyles.activeTokenCallNextBtnText}>Call Next</Text>
          </TouchableOpacity>
        )}

        {isServing && (
          <TouchableOpacity
            style={employeeStyles.activeTokenCompleteBtn}
            onPress={() => onComplete?.(ticket)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#334155"
              style={{ marginRight: 6 }}
            />
            <Text style={employeeStyles.activeTokenCompleteBtnText}>Complete</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View style={employeeStyles.activeTokenCompletedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color="#10B981"
              style={{ marginRight: 4 }}
            />
            <Text style={employeeStyles.activeTokenCompletedBadgeText}>Completed</Text>
          </View>
        )}

        {isCancelled && (
          <View style={employeeStyles.activeTokenCancelledBadge}>
            <Ionicons
              name="close-circle"
              size={15}
              color="#EF4444"
              style={{ marginRight: 4 }}
            />
            <Text style={employeeStyles.activeTokenCancelledBadgeText}>Cancelled</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ActiveTokenCard;
