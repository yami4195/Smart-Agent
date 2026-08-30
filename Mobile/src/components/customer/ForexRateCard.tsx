import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { homeStyles } from '../../../assets/styles/home.styles';
import { COLORS } from '../../../constants/colors';

interface ForexRateCardProps {
  usdBuyRate?: string;
  usdSellRate?: string;
  eurBuyRate?: string;
  eurSellRate?: string;
  loading?: boolean;
  onPress?: () => void;
}

export const ForexRateCard: React.FC<ForexRateCardProps> = ({
  usdBuyRate = '--',
  usdSellRate = '--',
  eurBuyRate = '--',
  eurSellRate = '--',
  loading = false,
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
            <Text style={homeStyles.forexSubtitle}>Live exchange rates from database</Text>
          </View>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
        )}
      </View>

      {/* Exchange Rates with explicit Buy & Sell Labels */}
      <View style={homeStyles.forexRatesList}>
        {/* USD/ETB */}
        <View style={homeStyles.forexRateItem}>
          <Text style={homeStyles.forexCurrencyName}>🇺🇸 USD/ETB</Text>
          <View style={homeStyles.forexBuySellRow}>
            <View style={homeStyles.forexRateBadge}>
              <Text style={homeStyles.forexRateLabel}>Buy</Text>
              <Text style={homeStyles.forexRateNumber}>{loading && usdBuyRate === '--' ? '...' : usdBuyRate}</Text>
            </View>
            <View style={homeStyles.forexRateBadge}>
              <Text style={homeStyles.forexRateLabel}>Sell</Text>
              <Text style={homeStyles.forexRateNumber}>{loading && usdSellRate === '--' ? '...' : usdSellRate}</Text>
            </View>
          </View>
        </View>

        <View style={homeStyles.forexDivider} />

        {/* EUR/ETB */}
        <View style={homeStyles.forexRateItem}>
          <Text style={homeStyles.forexCurrencyName}>🇪🇺 EUR/ETB</Text>
          <View style={homeStyles.forexBuySellRow}>
            <View style={homeStyles.forexRateBadge}>
              <Text style={homeStyles.forexRateLabel}>Buy</Text>
              <Text style={homeStyles.forexRateNumber}>{loading && eurBuyRate === '--' ? '...' : eurBuyRate}</Text>
            </View>
            <View style={homeStyles.forexRateBadge}>
              <Text style={homeStyles.forexRateLabel}>Sell</Text>
              <Text style={homeStyles.forexRateNumber}>{loading && eurSellRate === '--' ? '...' : eurSellRate}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

