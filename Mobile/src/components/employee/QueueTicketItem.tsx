import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EmployeeTicket } from '../../api/employee.api';
import { employeeStyles } from '../../../assets/styles/employee.styles';
import { COLORS } from '../../../constants/colors';

interface QueueTicketItemProps {
  ticket: EmployeeTicket;
  onServe?: (ticket: EmployeeTicket) => void;
  onPress?: (ticket: EmployeeTicket) => void;
  showServeAction?: boolean;
}

export const QueueTicketItem: React.FC<QueueTicketItemProps> = ({
  ticket,
  onServe,
  onPress,
  showServeAction = true,
}) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'WAITING':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'SERVING':
        return { bg: '#FFF3E0', text: '#EE7D17' };
      case 'COMPLETED':
        return { bg: '#ECFDF5', text: '#10B981' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#EF4444' };
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const statusColors = getStatusBadgeColor(ticket.status);

  return (
    <TouchableOpacity
      style={employeeStyles.ticketItem}
      onPress={() => onPress?.(ticket)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={employeeStyles.ticketItemLeft}>
        <View style={employeeStyles.ticketItemTokenBadge}>
          <Text style={employeeStyles.ticketItemTokenText}>{ticket.ticketNumber}</Text>
        </View>

        <View style={employeeStyles.ticketItemDetails}>
          <Text style={employeeStyles.ticketItemCustomerName} numberOfLines={1}>
            {ticket.customerName || 'Walk-in Customer'}
          </Text>

          <View style={employeeStyles.ticketItemServiceRow}>
            <Text style={employeeStyles.ticketItemServiceName} numberOfLines={1}>
              {ticket.serviceName}
            </Text>
            {ticket.status === 'WAITING' && (
              <Text style={employeeStyles.ticketItemWaitTime}>
                ~{ticket.estimatedWaitMins || 5} min wait
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={employeeStyles.ticketItemRight}>
        {ticket.status === 'WAITING' && showServeAction && onServe ? (
          <TouchableOpacity
            style={employeeStyles.ticketServeButton}
            onPress={() => onServe(ticket)}
            activeOpacity={0.8}
          >
            <Text style={employeeStyles.ticketServeButtonText}>Serve</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
              {ticket.status}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default QueueTicketItem;
