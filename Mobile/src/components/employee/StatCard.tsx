import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { employeeStyles } from '../../../assets/styles/employee.styles';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  trend,
  trendColor = '#10B981',
}) => {
  return (
    <View style={employeeStyles.statCardBox}>
      {/* Top Row: Icon + Label */}
      <View style={employeeStyles.statTopRow}>
        <View style={employeeStyles.statIconBox}>{icon}</View>
        <Text style={employeeStyles.statTitleText} numberOfLines={1}>
          {label}
        </Text>
      </View>

      {/* Main Value + Subtext / Trend Row */}
      <View style={employeeStyles.statValueRow}>
        <Text style={employeeStyles.statBigNumber}>{value}</Text>
        {trend ? (
          <Text style={[employeeStyles.statTrendBadge, { color: trendColor }]}>{trend}</Text>
        ) : null}
        {subtext ? (
          <Text style={employeeStyles.statSubLabel} numberOfLines={1}>
            {subtext}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default StatCard;
