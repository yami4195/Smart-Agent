import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { queueStyles } from '../../../assets/styles/queue.styles';

interface QueueReadyNoticeCardProps {
  title?: string;
  description?: string;
}

export const QueueReadyNoticeCard: React.FC<QueueReadyNoticeCardProps> = ({
  title = 'Getting Ready',
  description = 'Please have your ID and relevant documents ready to expedite your service when called.',
}) => {
  return (
    <View style={queueStyles.readyNoticeCard}>
      <View style={queueStyles.readyIconWrap}>
        <Ionicons name="information-circle" size={24} color="#F59E0B" />
      </View>
      <View style={queueStyles.readyTextCol}>
        <Text style={queueStyles.readyTitle}>{title}</Text>
        <Text style={queueStyles.readyDescription}>{description}</Text>
      </View>
    </View>
  );
};

export default QueueReadyNoticeCard;
