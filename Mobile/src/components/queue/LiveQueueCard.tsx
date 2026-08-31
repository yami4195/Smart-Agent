import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { queueStyles } from '../../../assets/styles/queue.styles';

interface LiveQueueCardProps {
  ticketNumber: string;
  branchName: string;
  serviceName: string;
  estimatedWaitTime?: string;
}

/**
 * Return an appropriate icon depending on the service category
 */
const getServiceIcon = (service: string) => {
  const s = (service || '').toLowerCase();
  if (s.includes('cash') || s.includes('deposit') || s.includes('withdrawal')) {
    return <MaterialCommunityIcons name="cash-multiple" size={18} color="#93C5FD" />;
  }
  if (s.includes('loan') || s.includes('credit')) {
    return <MaterialCommunityIcons name="credit-card-outline" size={18} color="#93C5FD" />;
  }
  if (s.includes('account')) {
    return <FontAwesome5 name="university" size={15} color="#93C5FD" />;
  }
  if (s.includes('forex') || s.includes('exchange')) {
    return <MaterialCommunityIcons name="currency-usd" size={18} color="#93C5FD" />;
  }
  return <MaterialCommunityIcons name="bank-outline" size={18} color="#93C5FD" />;
};

export const LiveQueueCard: React.FC<LiveQueueCardProps> = ({
  ticketNumber,
  branchName,
  serviceName,
  estimatedWaitTime = '00:00',
}) => {
  return (
    <View style={queueStyles.ticketCard}>
      {/* Top Row: Ticket Number & Branch Badge */}
      <View style={queueStyles.ticketTopRow}>
        <View style={queueStyles.ticketLabelCol}>
          <Text style={queueStyles.ticketLabel}>TICKET NUMBER</Text>
          <Text style={queueStyles.ticketNumber}>{ticketNumber || '—'}</Text>
        </View>

        {/* Branch Name Badge */}
        <View style={queueStyles.branchBadge}>
          <Ionicons
            name="business-outline"
            size={14}
            color="#FFFFFF"
            style={queueStyles.branchBadgeIcon}
          />
          <Text style={queueStyles.branchBadgeText} numberOfLines={2}>
            {branchName || 'Bole Branch'}
          </Text>
        </View>
      </View>

      {/* Inner Rounded Navy Box: Selected Service & Estimated Wait */}
      <View style={queueStyles.ticketInnerCard}>
        {/* Service Row */}
        <View style={queueStyles.ticketDetailRow}>
          {getServiceIcon(serviceName)}
          <Text style={queueStyles.ticketDetailText} numberOfLines={1}>
            {serviceName || 'Cash Services'}
          </Text>
        </View>

        {/* Estimated Wait Row (Static estimated time as designed, no ticking) */}
        <View style={queueStyles.ticketDetailRowSpaced}>
          <Ionicons name="time-outline" size={18} color="#94A3B8" />
          <Text style={queueStyles.ticketWaitLabel}>Est. Wait:</Text>
          <Text style={queueStyles.ticketWaitValue}>{estimatedWaitTime || '00:00'}</Text>
        </View>
      </View>
    </View>
  );
};

export default LiveQueueCard;
