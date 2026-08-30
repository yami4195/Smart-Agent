import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { COLORS } from '../../../constants/colors';
import { ForexRate } from '../../api/forexApi';

interface ExchangeRatesTableProps {
  rates?: ForexRate[];
  loading?: boolean;
  onSelectCurrencyToConvert?: (code: string) => void;
}

export const ExchangeRatesTable: React.FC<ExchangeRatesTableProps> = ({
  rates = [],
  loading = false,
  onSelectCurrencyToConvert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'MAJOR'>('ALL');

  const filteredRates = rates.filter((item) => {
    const matchesSearch =
      item.currencyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.currencyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || (activeTab === 'MAJOR' && item.isMajor);
    return matchesSearch && matchesTab;
  });

  const majorCount = rates.filter((r) => r.isMajor).length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={forexStyles.keyboardView}
    >
      {/* Directory Section Header */}
      <View style={forexStyles.directoryHeaderRow}>
        <Text style={forexStyles.directoryTitle}>Exchange Rates</Text>
        <MaterialCommunityIcons name="table-large" size={20} color={COLORS.navy} />
      </View>

      {/* Search Input Bar */}
      <View style={forexStyles.searchBarContainer}>
        <Feather name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={forexStyles.searchInput}
          placeholder="Search currency (e.g. USD, EURO)..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Category Tabs */}
      <View style={forexStyles.filterTabsContainer}>
        <Pressable
          style={[forexStyles.filterTab, activeTab === 'ALL' && forexStyles.filterTabActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[forexStyles.filterTabText, activeTab === 'ALL' && forexStyles.filterTabTextActive]}>
            All Currencies ({rates.length})
          </Text>
        </Pressable>

        <Pressable
          style={[forexStyles.filterTab, activeTab === 'MAJOR' && forexStyles.filterTabActive]}
          onPress={() => setActiveTab('MAJOR')}
        >
          <Text style={[forexStyles.filterTabText, activeTab === 'MAJOR' && forexStyles.filterTabTextActive]}>
            Major Forex ({majorCount})
          </Text>
        </Pressable>
      </View>

      {/* Loading State */}
      {loading && rates.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 13, color: COLORS.textSecondary }}>
            Fetching live rates from database...
          </Text>
        </View>
      ) : filteredRates.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="search-outline" size={32} color={COLORS.textMuted} />
          <Text style={{ marginTop: 8, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>
            {rates.length === 0
              ? 'No exchange rates available from server.'
              : `No currencies matching "${searchQuery}"`}
          </Text>
        </View>
      ) : (
        /* Currency Directory Cards */
        filteredRates.map((item) => (
          <View key={item.id || item.currencyCode} style={forexStyles.rateCard}>
            {/* Card Top: Flag, Code, Name & 24h Change */}
            <View style={forexStyles.rateCardTop}>
              <View style={forexStyles.currencyInfoLeft}>
                <Text style={forexStyles.flagEmojiLarge}>{item.flagEmoji}</Text>
                <View>
                  <Text style={forexStyles.currencyNameBold}>{item.currencyCode}</Text>
                  <Text style={forexStyles.currencyFullName}>{item.currencyName}</Text>
                </View>
              </View>

              <Text
                style={[
                  forexStyles.changeTag,
                  item.isPositive ? forexStyles.changeTagPositive : forexStyles.changeTagNegative,
                ]}
              >
                24h: {item.change24h}
              </Text>
            </View>

            {/* 4-Grid Rates: Cash Buy, Cash Sell, TT Buy, TT Sell */}
            <View style={forexStyles.rateCardValuesGrid}>
              <View style={forexStyles.rateValBox}>
                <Text style={forexStyles.rateValLabel}>Cash Buy</Text>
                <Text style={forexStyles.rateValNum}>{item.cashBuy}</Text>
              </View>
              <View style={forexStyles.rateValBox}>
                <Text style={forexStyles.rateValLabel}>Cash Sell</Text>
                <Text style={forexStyles.rateValNum}>{item.cashSell}</Text>
              </View>
              <View style={forexStyles.rateValBox}>
                <Text style={forexStyles.rateValLabel}>TT Buy</Text>
                <Text style={forexStyles.rateValNum}>{item.ttBuy}</Text>
              </View>
              <View style={forexStyles.rateValBox}>
                <Text style={forexStyles.rateValLabel}>TT Sell</Text>
                <Text style={forexStyles.rateValNum}>{item.ttSell}</Text>
              </View>
            </View>

            {/* Instant Convert Button */}
            <Pressable
              style={forexStyles.convertMiniButton}
              onPress={() => onSelectCurrencyToConvert && onSelectCurrencyToConvert(item.currencyCode)}
            >
              <Text style={forexStyles.convertMiniText}>Convert {item.currencyCode}</Text>
              <Feather name="arrow-right" size={14} color={COLORS.primary} />
            </Pressable>
          </View>
        ))
      )}
    </KeyboardAvoidingView>
  );
};

