import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../../components/common/Header';
import { placeholderStyles } from '../../../../assets/styles/placeholder.styles';
import { commonStyles } from '../../../../assets/styles/common.styles';
import { COLORS } from '../../../../constants/colors';

export default function MyQueueScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Header title="Tera Mobile Banking" />
      <View style={placeholderStyles.container}>
        <View style={placeholderStyles.iconCircle}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={36} color={COLORS.primary} />
        </View>
        <Text style={placeholderStyles.title}>My Queue</Text>
        <Text style={placeholderStyles.subtitle}>
          Your live tokens (e.g. A024), estimated waiting time, and queue history will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
