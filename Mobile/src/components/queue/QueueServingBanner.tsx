import React from 'react';
import { View, Text } from 'react-native';
import { queueStyles } from '../../../assets/styles/queue.styles';

interface QueueServingBannerProps {
  nowServingTicket?: string;
  counterNumber?: string;
}

export const QueueServingBanner: React.FC<QueueServingBannerProps> = ({
  nowServingTicket = 'Ticket T-101',
  counterNumber = '02',
}) => {
  const formattedTicket = nowServingTicket.startsWith('Ticket')
    ? nowServingTicket
    : `Ticket ${nowServingTicket}`;

  return (
    <View style={queueStyles.servingBox}>
      {/* Left Column: Currently Serving Ticket */}
      <View style={queueStyles.servingCol}>
        <Text style={queueStyles.servingLabel}>Now Serving</Text>
        <Text style={queueStyles.servingTicketVal}>{formattedTicket}</Text>
      </View>

      {/* Right Column: Counter Number */}
      <View style={queueStyles.servingColRight}>
        <Text style={queueStyles.servingLabel}>Counter</Text>
        <Text style={queueStyles.servingCounterVal}>{counterNumber}</Text>
      </View>
    </View>
  );
};

export default QueueServingBanner;
