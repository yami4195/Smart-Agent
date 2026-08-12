import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { homeStyles } from '../../../assets/styles/home.styles';
import { COLORS } from '../../../constants/colors';

interface ForexRateCardProps {
  usdBuyRate?: string;
  usdSellRate?: string;
  eurBuyRate?: string;
  eurSellRate?: string;
  onPress?: () => void;
}

export const ForexRateCard: React.FC<ForexRateCardProps> = ({
  usdBuyRate = "125.40",
  usdSellRate = "127.90",
  eurBuyRate = "136.10",
  eurSellRate = "138.80",
  onPress,
}) => {
  return (
    <Pressable style={homeStyles.forexCardContainer} onPress={onPress}>
      {/* Top Header Row */}
      <View style={homeStyles.forexCardHeader}>
        <View style={homeStyles.forexLeftContent}>
          <View style={homeStyles.forexIconCircle}>
            <MaterialCommunityIcons name="currency-usd" size={24} color={COLORS.primary} />
          </View>
          <View style={homeStyles.forexTextContainer}>
            <View style={homeStyles.forexTitleRow}>
              <Text style={homeStyles.forexTitle}>Forex Rates</Text>
            </View>
            <Text style={homeStyles.forexSubtitle}>Check today's exchange rates</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
      </View>

      {/* Today's Exchange Rate Preview Bar */}
      <View style={homeStyles.forexRatesRow}>
        <View style={homeStyles.ratePill}>
          <Text style={homeStyles.rateCurrency}>🇺🇸 USD/ETB</Text>
          <Text style={homeStyles.rateValue}>{usdBuyRate} / {usdSellRate}</Text>
        </View>

        <View style={homeStyles.ratePill}>
          <Text style={homeStyles.rateCurrency}>🇪🇺 EUR/ETB</Text>
          <Text style={homeStyles.rateValue}>{eurBuyRate} / {eurSellRate}</Text>
        </View>
      </View>
    </Pressable>
  );
};
