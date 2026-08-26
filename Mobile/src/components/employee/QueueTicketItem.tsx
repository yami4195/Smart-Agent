import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { EmployeeTicket } from '../../api/employee.api';
import { employeeStyles } from '../../../assets/styles/employee.styles';
import { COLORS } from '../../../constants/colors';

interface QueueTicketItemProps {
  ticket: EmployeeTicket;
  onPress?: (ticket: EmployeeTicket) => void;
  actionText?: string;
  onActionPress?: (ticket: EmployeeTicket) => void;
  onServe?: (ticket: EmployeeTicket) => void;
  showServeAction?: boolean;
}

export const QueueTicketItem: React.FC<QueueTicketItemProps> = ({
  ticket,
  onPress,
  actionText = 'Details',
  onActionPress,
  onServe,
  showServeAction = false,
}) => {
  return (
    <TouchableOpacity
      style={employeeStyles.queueRowItem}
      onPress={() => onPress?.(ticket)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={employeeStyles.queueRowLeft}>
        {/* Token Circle Badge */}
        <View style={employeeStyles.ticketCircleBadge}>
          <Text style={employeeStyles.ticketCircleText}>{ticket.ticketNumber}</Text>
        </View>

        {/* Ticket Details */}
        <View style={employeeStyles.ticketRowDetails}>
          <Text style={employeeStyles.ticketRowService} numberOfLines={1}>
            {ticket.serviceName || 'General Banking'}
          </Text>
          <Text style={employeeStyles.ticketRowWaitTime}>
            Waiting: {ticket.estimatedWaitMins ? `${ticket.estimatedWaitMins} mins` : '5 mins'}
          </Text>
        </View>
      </View>

      {/* Action Button: Serve or Details */}
      {showServeAction && onServe && ticket.status === 'WAITING' ? (
        <TouchableOpacity
          style={[employeeStyles.ticketActionBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
          onPress={() => onServe(ticket)}
          activeOpacity={0.7}
        >
          <Text style={[employeeStyles.ticketActionBtnText, { color: '#FFFFFF' }]}>Serve</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={employeeStyles.ticketActionBtn}
          onPress={() => (onActionPress ? onActionPress(ticket) : onPress?.(ticket))}
          activeOpacity={0.7}
        >
          <Text style={employeeStyles.ticketActionBtnText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default QueueTicketItem;
