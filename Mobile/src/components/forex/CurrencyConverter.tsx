import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { COLORS } from '../../../constants/colors';

export interface CurrencyItem {
  code: string;
  name: string;
  flag: string;
  rateToEtb: number; // Cash Buy
  ttRateToEtb: number; // TT Buy
}

export const CURRENCIES: CurrencyItem[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rateToEtb: 125.40, ttRateToEtb: 126.15 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rateToEtb: 136.10, ttRateToEtb: 137.05 },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rateToEtb: 160.25, ttRateToEtb: 161.40 },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rateToEtb: 34.14, ttRateToEtb: 34.35 },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rateToEtb: 33.42, ttRateToEtb: 33.60 },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rateToEtb: 91.20, ttRateToEtb: 91.80 },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rateToEtb: 17.30, ttRateToEtb: 17.45 },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rateToEtb: 141.50, ttRateToEtb: 142.30 },
  { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', rateToEtb: 1.00, ttRateToEtb: 1.00 },
];

interface CurrencyConverterProps {
  onBookTicketPress: () => void;
  onSetAlertPress: () => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  onBookTicketPress,
  onSetAlertPress,
}) => {
  const [rateType, setRateType] = useState<'CASH' | 'TT'>('CASH');
  const [fromCurrency, setFromCurrency] = useState<CurrencyItem>(CURRENCIES[0]); // USD
  const [toCurrency, setToCurrency] = useState<CurrencyItem>(CURRENCIES[8]);     // ETB
  const [amount, setAmount] = useState<string>('100');

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Cycle currency selector
  const handleCycleFrom = () => {
    const currentIndex = CURRENCIES.findIndex((c) => c.code === fromCurrency.code);
    const nextIndex = (currentIndex + 1) % CURRENCIES.length;
    if (CURRENCIES[nextIndex].code === toCurrency.code) {
      setFromCurrency(CURRENCIES[(nextIndex + 1) % CURRENCIES.length]);
    } else {
      setFromCurrency(CURRENCIES[nextIndex]);
    }
  };

  const handleCycleTo = () => {
    const currentIndex = CURRENCIES.findIndex((c) => c.code === toCurrency.code);
    const nextIndex = (currentIndex + 1) % CURRENCIES.length;
    if (CURRENCIES[nextIndex].code === fromCurrency.code) {
      setToCurrency(CURRENCIES[(nextIndex + 1) % CURRENCIES.length]);
    } else {
      setToCurrency(CURRENCIES[nextIndex]);
    }
  };

  // Calculate conversion
  const numAmount = parseFloat(amount) || 0;
  const fromRate = rateType === 'CASH' ? fromCurrency.rateToEtb : fromCurrency.ttRateToEtb;
  const toRate = rateType === 'CASH' ? toCurrency.rateToEtb : toCurrency.ttRateToEtb;
  const convertedValue = ((numAmount * fromRate) / toRate).toFixed(2);
  const effectiveRate = (fromRate / toRate).toFixed(4);

  return (
    <View style={forexStyles.converterCard}>
      {/* Title */}
      <View style={forexStyles.cardTitleRow}>
        <Text style={forexStyles.converterTitle}>Currency Calculator</Text>
        <MaterialCommunityIcons name="calculator" size={20} color={COLORS.primary} />
      </View>

      {/* Rate Type Segmented Toggle */}
      <View style={forexStyles.toggleContainer}>
        <Pressable
          style={[forexStyles.toggleButton, rateType === 'CASH' && forexStyles.toggleActive]}
          onPress={() => setRateType('CASH')}
        >
          <Text style={[forexStyles.toggleText, rateType === 'CASH' && forexStyles.toggleTextActive]}>
            Cash Notes Rate
          </Text>
        </Pressable>
        <Pressable
          style={[forexStyles.toggleButton, rateType === 'TT' && forexStyles.toggleActive]}
          onPress={() => setRateType('TT')}
        >
          <Text style={[forexStyles.toggleText, rateType === 'TT' && forexStyles.toggleTextActive]}>
            Bank Wire (TT Transfer)
          </Text>
        </Pressable>
      </View>

      {/* Input 1: You Pay / Send */}
      <View style={forexStyles.inputGroup}>
        <Text style={forexStyles.inputGroupLabel}>You Convert / Pay</Text>
        <View style={forexStyles.inputGroupRow}>
          <TextInput
            style={forexStyles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
          />
          <Pressable style={forexStyles.currencyPickerButton} onPress={handleCycleFrom}>
            <Text style={forexStyles.currencyFlagText}>{fromCurrency.flag}</Text>
            <Text style={forexStyles.currencyCodeText}>{fromCurrency.code}</Text>
            <Feather name="chevron-down" size={16} color={COLORS.navy} />
          </Pressable>
        </View>
      </View>

      {/* Swap Button */}
      <View style={forexStyles.swapContainer}>
        <Pressable style={forexStyles.swapButton} onPress={handleSwap}>
          <Ionicons name="swap-vertical" size={20} color={COLORS.white} />
        </Pressable>
      </View>

      {/* Input 2: You Receive */}
      <View style={forexStyles.inputGroup}>
        <Text style={forexStyles.inputGroupLabel}>You Receive (Estimated)</Text>
        <View style={forexStyles.inputGroupRow}>
          <Text style={forexStyles.amountInput}>{convertedValue}</Text>
          <Pressable style={forexStyles.currencyPickerButton} onPress={handleCycleTo}>
            <Text style={forexStyles.currencyFlagText}>{toCurrency.flag}</Text>
            <Text style={forexStyles.currencyCodeText}>{toCurrency.code}</Text>
            <Feather name="chevron-down" size={16} color={COLORS.navy} />
          </Pressable>
        </View>
      </View>

      {/* Quick Amount Shortcuts Pills */}
      <View style={forexStyles.shortcutContainer}>
        {['100', '500', '1000', '5000', '10000'].map((val) => (
          <Pressable
            key={val}
            style={[
              forexStyles.shortcutPill,
              amount === val && forexStyles.shortcutPillActive,
            ]}
            onPress={() => setAmount(val)}
          >
            <Text
              style={[
                forexStyles.shortcutText,
                amount === val && forexStyles.shortcutTextActive,
              ]}
            >
              ${parseInt(val).toLocaleString()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Detailed Breakdown Banner */}
      <View style={forexStyles.breakdownBanner}>
        <View style={forexStyles.breakdownRow}>
          <Text style={forexStyles.breakdownLabel}>Applied Exchange Rate:</Text>
          <Text style={forexStyles.breakdownValue}>
            1 {fromCurrency.code} = {effectiveRate} {toCurrency.code}
          </Text>
        </View>
        <View style={forexStyles.breakdownRow}>
          <Text style={forexStyles.breakdownLabel}>Transaction Fee:</Text>
          <Text style={forexStyles.breakdownValueOrange}>$0.00 (Free NBE Promo)</Text>
        </View>
        <View style={forexStyles.breakdownRow}>
          <Text style={forexStyles.breakdownLabel}>Rate Type Applied:</Text>
          <Text style={forexStyles.breakdownValue}>
            {rateType === 'CASH' ? 'Cash Counter Rate' : 'Telegraphic Transfer (TT)'}
          </Text>
        </View>
      </View>

      {/* Action Buttons Stack */}
      <View style={forexStyles.actionButtonsStack}>
        <Pressable style={forexStyles.bookTicketButton} onPress={onBookTicketPress}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color={COLORS.white} />
          <Text style={forexStyles.bookTicketText}>Book Forex Counter Ticket</Text>
        </Pressable>

        <Pressable style={forexStyles.alertButton} onPress={onSetAlertPress}>
          <Ionicons name="notifications-outline" size={18} color={COLORS.navy} />
          <Text style={forexStyles.alertButtonText}>Set Rate Alert Notification</Text>
        </Pressable>
      </View>
    </View>
  );
};
