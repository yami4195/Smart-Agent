import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/common/Header';
import { placeholderStyles } from '../../../../assets/styles/placeholder.styles';
import { commonStyles } from '../../../../assets/styles/common.styles';
import { COLORS } from '../../../../constants/colors';

export default function BranchesScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Header title="Tera Mobile Banking" />
      <View style={placeholderStyles.container}>
        <View style={placeholderStyles.iconCircle}>
          <Ionicons name="location-outline" size={36} color={COLORS.primary} />
        </View>
        <Text style={placeholderStyles.title}>Branches</Text>
        <Text style={placeholderStyles.subtitle}>
          Interactive Wegagen Bank branch map & services lookup will be implemented here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
