import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { queueStyles } from '../../../assets/styles/queue.styles';

export type QueueStepStatus = 'WAITING' | 'SERVING' | 'COMPLETED';

interface QueueStepperProps {
  currentStatus?: QueueStepStatus;
}

export const QueueStepper: React.FC<QueueStepperProps> = ({
  currentStatus = 'WAITING',
}) => {
  const isJoinedDone = true; // Always checked once ticket is created
  const isWaitingActive = currentStatus === 'WAITING';
  const isAtTeller = currentStatus === 'SERVING' || currentStatus === 'COMPLETED';

  return (
    <View>
      <View style={queueStyles.stepperDivider} />

      <View style={queueStyles.stepperRow}>
        {/* Step 1: Joined */}
        <View style={queueStyles.stepItem}>
          <View style={[queueStyles.stepIconCircle, queueStyles.stepIconCircleActive]}>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </View>
          <Text style={[queueStyles.stepLabel, queueStyles.stepLabelActive]}>Joined</Text>
        </View>

        {/* Step 2: Waiting */}
        <View style={queueStyles.stepItem}>
          <View
            style={[
              queueStyles.stepIconCircle,
              isWaitingActive || isAtTeller
                ? queueStyles.stepIconCircleActive
                : queueStyles.stepIconCircleInactive,
            ]}
          >
            <MaterialCommunityIcons
              name="radiobox-marked"
              size={20}
              color={isWaitingActive || isAtTeller ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              queueStyles.stepLabel,
              isWaitingActive ? queueStyles.stepLabelActive : queueStyles.stepLabelInactive,
            ]}
          >
            Waiting
          </Text>
        </View>

        {/* Step 3: At Teller */}
        <View style={queueStyles.stepItem}>
          <View
            style={[
              queueStyles.stepIconCircle,
              isAtTeller
                ? queueStyles.stepIconCircleActive
                : queueStyles.stepIconCircleInactive,
            ]}
          >
            <Ionicons
              name="person"
              size={16}
              color={isAtTeller ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              queueStyles.stepLabel,
              isAtTeller ? queueStyles.stepLabelActive : queueStyles.stepLabelInactive,
            ]}
          >
            At Teller
          </Text>
        </View>
      </View>
    </View>
  );
};

export default QueueStepper;
