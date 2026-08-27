import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { EmployeeTicket } from '../../api/employee.api';
import { COLORS } from '../../../constants/colors';

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
      style={styles.card}
      onPress={() => onPress?.(ticket)}
      activeOpacity={0.8}
    >
      {/* Main Info Row */}
      <View style={styles.mainRow}>
        {/* Token Badge */}
        <View style={styles.tokenBadge}>
          <Text style={styles.tokenText}>{formattedToken}</Text>
        </View>

        {/* Details Column */}
        <View style={styles.detailsCol}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {ticket.serviceName || 'Cashier'}
          </Text>

          <View style={styles.statusRow}>
            {/* Time Indicator */}
            <View style={styles.timeWrapper}>
              <Feather
                name="clock"
                size={13}
                color={isDelayed || isCancelled ? '#EF4444' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.timeText,
                  (isDelayed || isCancelled) && { color: '#EF4444', fontWeight: '600' },
                ]}
              >
                {timeText}
              </Text>
            </View>

            {/* Status Dot & Label */}
            <View style={styles.statusWrapper}>
              <View
                style={[styles.statusDot, { backgroundColor: statusConfig.dotColor }]}
              />
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Row */}
      <View style={styles.bottomRow}>
        {/* Reassign / Transfer Action (only for uncompleted / active tickets) */}
        {!isCompleted && !isCancelled ? (
          <TouchableOpacity
            style={styles.transferBtn}
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
            style={styles.callNextBtn}
            onPress={() => onCallNext?.(ticket)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="megaphone-outline"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.callNextBtnText}>Call Next</Text>
          </TouchableOpacity>
        )}

        {isServing && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => onComplete?.(ticket)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#334155"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.completeBtnText}>Complete</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color="#10B981"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        )}

        {isCancelled && (
          <View style={styles.cancelledBadge}>
            <Ionicons
              name="close-circle"
              size={15}
              color="#EF4444"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.cancelledBadgeText}>Cancelled</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenBadge: {
    width: 62,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tokenText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A2540',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  detailsCol: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
  },
  transferBtn: {
    padding: 6,
  },
  callNextBtn: {
    backgroundColor: '#0A2540', // Deep Navy
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  callNextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  completeBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelledBadgeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ActiveTokenCard;
