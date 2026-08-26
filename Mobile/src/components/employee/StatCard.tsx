import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { employeeStyles } from '../../../assets/styles/employee.styles';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  valueColor,
}) => {
  return (
    <View style={employeeStyles.statCard}>
      <Text style={employeeStyles.statLabel}>{label}</Text>
      <Text style={[employeeStyles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      {hint ? <Text style={employeeStyles.statHint}>{hint}</Text> : null}
    </View>
  );
};

export default StatCard;
