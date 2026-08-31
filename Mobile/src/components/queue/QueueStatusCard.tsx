import React from 'react';
import { View, Text } from 'react-native';
import { queueStyles } from '../../../assets/styles/queue.styles';
import { QueueCircularGauge } from './QueueCircularGauge';
import { QueueServingBanner } from './QueueServingBanner';
import { QueueStepper, QueueStepStatus } from './QueueStepper';

interface QueueStatusCardProps {
  position?: number;
  peopleAhead?: number;
  nowServingTicket?: string;
  counterNumber?: string;
  status?: QueueStepStatus;
}

export const QueueStatusCard: React.FC<QueueStatusCardProps> = ({
  position = 1,
  peopleAhead = 0,
  nowServingTicket,
  counterNumber,
  status = 'WAITING',
}) => {
  return (
    <View style={queueStyles.statusCard}>
      {/* Header Row: Title & Live Badge */}
      <View style={queueStyles.statusCardHeader}>
        <Text style={queueStyles.statusCardTitle}>Queue Status</Text>
        <View style={queueStyles.liveBadge}>
          <View style={queueStyles.liveDot} />
          <Text style={queueStyles.liveText}>Live</Text>
        </View>
      </View>

      {/* Circular Gauge: Position in Line */}
      <QueueCircularGauge position={position} peopleAhead={peopleAhead} />

      {/* Now Serving & Counter Banner */}
      <QueueServingBanner
        nowServingTicket={nowServingTicket}
        counterNumber={counterNumber}
      />

      {/* 3-Step Timeline (Joined, Waiting, At Teller) */}
      <QueueStepper currentStatus={status} />
    </View>
  );
};

export default QueueStatusCard;
