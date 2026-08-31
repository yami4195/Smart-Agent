import React from 'react';
import { View, Text } from 'react-native';
import { queueStyles } from '../../../assets/styles/queue.styles';

interface QueueServingBannerProps {
  nowServingTicket?: string;
  counterNumber?: string;
}

export const QueueServingBanner: React.FC<QueueServingBannerProps> = ({
  nowServingTicket,
  counterNumber,
}) => {
  const hasActiveServing = Boolean(
    nowServingTicket &&
    nowServingTicket.trim() &&
    nowServingTicket !== 'None' &&
    nowServingTicket !== '—'
  );

  const formattedTicket = hasActiveServing
    ? nowServingTicket!.startsWith('Ticket')
      ? nowServingTicket!
      : `Ticket ${nowServingTicket}`
    : 'Standby';

  const formattedCounter = hasActiveServing ? (counterNumber || '01') : '—';

  return (
    <View style={queueStyles.servingBox}>
      {/* Left Column: Currently Serving Ticket */}
      <View style={queueStyles.servingCol}>
        <Text style={queueStyles.servingLabel}>Now Serving</Text>
        <Text
          style={[
            queueStyles.servingTicketVal,
            !hasActiveServing && { color: '#64748B', fontSize: 13, fontWeight: '600' },
          ]}
        >
          {formattedTicket}
        </Text>
      </View>

      {/* Right Column: Counter Number */}
      <View style={queueStyles.servingColRight}>
        <Text style={queueStyles.servingLabel}>Counter</Text>
        <Text
          style={[
            queueStyles.servingCounterVal,
            !hasActiveServing && { color: '#64748B' },
          ]}
        >
          {formattedCounter}
        </Text>
      </View>
    </View>
  );
};

export default QueueServingBanner;

