import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/common/Header';
import { placeholderStyles } from '../../../../assets/styles/placeholder.styles';
import { commonStyles } from '../../../../assets/styles/common.styles';
import { COLORS } from '../../../../constants/colors';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Header title="Tera Mobile Banking" />
      <View style={placeholderStyles.container}>
        <View style={placeholderStyles.iconCircle}>
          <Ionicons name="person-outline" size={36} color={COLORS.primary} />
        </View>
        <Text style={placeholderStyles.title}>Profile</Text>
        <Text style={placeholderStyles.subtitle}>
          Account details, language preferences 🇪🇹, and settings will be implemented here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
