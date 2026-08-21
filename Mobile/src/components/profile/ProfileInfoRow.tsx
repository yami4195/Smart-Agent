import React from 'react';
import { View, Text } from 'react-native';
import { profileStyles } from '../../../assets/styles/profile.styles';

export interface ProfileInfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}

export const ProfileInfoRow: React.FC<ProfileInfoRowProps> = ({
  icon,
  label,
  value,
  isLast = false,
}) => {
  return (
    <>
      <View style={profileStyles.infoRow}>
        <View style={profileStyles.infoIconContainer}>{icon}</View>
        <View style={profileStyles.infoContent}>
          <Text style={profileStyles.infoLabel}>{label}</Text>
          <Text style={profileStyles.infoValue} numberOfLines={1}>
            {value}
          </Text>
        </View>
      </View>
      {!isLast && <View style={profileStyles.divider} />}
    </>
  );
};
