import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { COLORS } from '../../../constants/colors';

export const ForexAiBanner: React.FC = () => {
  const handleSmartAgent = () =>{
    console.log("Coming soon!!")
  }
  return (
    <Pressable onPress={handleSmartAgent}>
    <View style={forexStyles.aiBannerContainer}>
      <View style={forexStyles.aiIconContainer}>
        <MaterialCommunityIcons name="robot-outline" size={24} color={COLORS.aiPurple} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={forexStyles.aiBannerTitle}>Smart Agent FX Assistant 💡</Text>
        <Text style={forexStyles.aiBannerBody}>
          Need help with National Bank of Ethiopia (NBE) travel limits, customs declaration thresholds, or diaspora FX accounts? Ask Smart Agent AI anytime!
        </Text>
      </View>
    </View>
    </Pressable>
  );
};
