import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { employeeStyles } from '../../../assets/styles/employee.styles';
import { COLORS } from '../../../constants/colors';

interface CallNextCardProps {
  waitingCount: number;
  calling: boolean;
  onCallNext: () => void;
  disabled?: boolean;
}

export const CallNextCard: React.FC<CallNextCardProps> = ({
  waitingCount,
  calling,
  onCallNext,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        employeeStyles.callNextButton,
        disabled && { opacity: 0.6, backgroundColor: '#94A3B8' },
      ]}
      onPress={onCallNext}
      disabled={disabled || calling}
      activeOpacity={0.85}
    >
      <View style={employeeStyles.callNextLeft}>
        <View style={employeeStyles.callNextIconCircle}>
          {calling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="account-arrow-right" size={24} color="#FFFFFF" />
          )}
        </View>
        <View>
          <Text style={employeeStyles.callNextTitle}>
            {calling ? 'Calling Customer...' : 'Call Next Customer'}
          </Text>
          <Text style={employeeStyles.callNextSubtitle}>
            {waitingCount > 0
              ? `${waitingCount} waiting in queue`
              : 'No waiting tickets'}
          </Text>
        </View>
      </View>

      <View style={employeeStyles.callNextBadge}>
        <Text style={employeeStyles.callNextBadgeText}>{waitingCount} in line</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CallNextCard;
