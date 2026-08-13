import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { COLORS } from '../../../constants/colors';

export interface ExchangeRateRow {
  code: string;
  name: string;
  flag: string;
  cashBuy: string;
  cashSell: string;
  ttBuy: string;
  ttSell: string;
  change24h: string;
  isPositive: boolean;
  isMajor: boolean;
}

const FULL_DIRECTORY_RATES: ExchangeRateRow[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', cashBuy: '125.40', cashSell: '127.90', ttBuy: '126.15', ttSell: '128.67', change24h: '+0.35%', isPositive: true, isMajor: true },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', cashBuy: '136.10', cashSell: '138.80', ttBuy: '137.05', ttSell: '139.75', change24h: '-0.12%', isPositive: false, isMajor: true },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', cashBuy: '160.25', cashSell: '163.45', ttBuy: '161.40', ttSell: '164.60', change24h: '+0.48%', isPositive: true, isMajor: true },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', cashBuy: '34.14', cashSell: '34.82', ttBuy: '34.35', ttSell: '35.03', change24h: '+0.05%', isPositive: true, isMajor: true },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', cashBuy: '33.42', cashSell: '34.08', ttBuy: '33.60', ttSell: '34.27', change24h: '-0.08%', isPositive: false, isMajor: true },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', cashBuy: '91.20', cashSell: '93.00', ttBuy: '91.80', ttSell: '93.60', change24h: '+0.18%', isPositive: true, isMajor: false },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', cashBuy: '17.30', cashSell: '17.65', ttBuy: '17.45', ttSell: '17.80', change24h: '-0.04%', isPositive: false, isMajor: false },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', cashBuy: '141.50', cashSell: '144.30', ttBuy: '142.30', ttSell: '145.10', change24h: '+0.22%', isPositive: true, isMajor: false },
];

interface ExchangeRatesTableProps {
  onSelectCurrencyToConvert?: (code: string) => void;
}

export const ExchangeRatesTable: React.FC<ExchangeRatesTableProps> = ({
  onSelectCurrencyToConvert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'MAJOR'>('ALL');

  const filteredRates = FULL_DIRECTORY_RATES.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || (activeTab === 'MAJOR' && item.isMajor);
    return matchesSearch && matchesTab;
  });

  return (
    <KeyboardAvoidingView
                  behavior={Platform.OS ==="ios" ? "padding" : "height"}
                  keyboardVerticalOffset={Platform.OS ==="ios" ? 64:0}
                  style={forexStyles.keyboardView}
                  >
      {/* Directory Section Header */}
      <View style={forexStyles.directoryHeaderRow}>
        <Text style={forexStyles.directoryTitle}>Exchange Rates </Text>
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
            All Currencies ({FULL_DIRECTORY_RATES.length})
          </Text>
        </Pressable>

        <Pressable
          style={[forexStyles.filterTab, activeTab === 'MAJOR' && forexStyles.filterTabActive]}
          onPress={() => setActiveTab('MAJOR')}
        >
          <Text style={[forexStyles.filterTabText, activeTab === 'MAJOR' && forexStyles.filterTabTextActive]}>
            Major Forex (5)
          </Text>
        </Pressable>
      </View>

      {/* Currency Directory Cards */}
      {filteredRates.map((item) => (
        <View key={item.code} style={forexStyles.rateCard}>
          {/* Card Top: Flag, Code, Name & 24h Change */}
          <View style={forexStyles.rateCardTop}>
            <View style={forexStyles.currencyInfoLeft}>
              <Text style={forexStyles.flagEmojiLarge}>{item.flag}</Text>
              <View>
                <Text style={forexStyles.currencyNameBold}>{item.code}</Text>
                <Text style={forexStyles.currencyFullName}>{item.name}</Text>
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
            onPress={() => onSelectCurrencyToConvert && onSelectCurrencyToConvert(item.code)}
          >
            <Text style={forexStyles.convertMiniText}>Convert {item.code}</Text>
            <Feather name="arrow-right" size={14} color={COLORS.primary} />
          </Pressable>
        </View>
      ))}
    </KeyboardAvoidingView>
  );
};
