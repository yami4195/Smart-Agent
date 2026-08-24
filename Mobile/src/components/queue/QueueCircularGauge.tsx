import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { queueStyles } from '../../../assets/styles/queue.styles';

interface QueueCircularGaugeProps {
  position?: number; // e.g. 3
  peopleAhead?: number; // e.g. 2
  totalInQueue?: number; // e.g. 10
}

/**
 * Format position number to ordinal string (e.g. 1 -> 1st, 2 -> 2nd, 3 -> 3rd)
 */
const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const QueueCircularGauge: React.FC<QueueCircularGaugeProps> = ({
  position = 3,
  peopleAhead = 2,
  totalInQueue = 8,
}) => {
  const displayPosition = position || (peopleAhead ? peopleAhead + 1 : 3);
  const ordinalText = getOrdinal(displayPosition);

  // SVG Geometry
  const size = 176;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Arc length matching design (approx 65% arc)
  const progressRatio = 0.65;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <View style={queueStyles.gaugeContainer}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background track circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E0EDFD"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Navy active progress arc */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#0A2540"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>

      {/* Centered Position Typography */}
      <View style={queueStyles.gaugeCenterContent}>
        <Text style={queueStyles.gaugeSubtext}>Your Position</Text>
        <Text style={queueStyles.gaugePositionValue}>{ordinalText}</Text>
        <Text style={queueStyles.gaugeSubtext}>in line</Text>
      </View>
    </View>
  );
};

export default QueueCircularGauge;
