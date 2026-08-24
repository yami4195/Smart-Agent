import React from 'react';
import { View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { profileStyles } from '../../../assets/styles/profile.styles';
import { COLORS } from '../../../constants/colors';
import { ProfileInfoRow } from './ProfileInfoRow';

export interface ProfileInfoCardProps {
  fullName: string;
  phoneNumber: string;
  email: string;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  fullName,
  phoneNumber,
  email,
}) => {
  return (
    <View style={profileStyles.infoCard}>
      {/* Full Name */}
      <ProfileInfoRow
        icon={<Ionicons name="person-outline" size={22} color={COLORS.textSecondary} />}
        label="FULL NAME"
        value={fullName || '—'}
      />

      {/* Phone Number */}
      <ProfileInfoRow
        icon={<Ionicons name="phone-portrait-outline" size={22} color={COLORS.textSecondary} />}
        label="PHONE NUMBER"
        value={phoneNumber || '—'}
      />

      {/* Email Address */}
      <ProfileInfoRow
        icon={<Feather name="mail" size={20} color={COLORS.textSecondary} />}
        label="EMAIL ADDRESS"
        value={email || '—'}
        isLast
      />
    </View>
  );
};
