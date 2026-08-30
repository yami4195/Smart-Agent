import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { COLORS } from '../../../constants/colors';
import { Button } from '../common/Button';
import { ForexRate } from '../../api/forexApi';

export interface CurrencyItem {
  code: string;
  name: string;
  flag: string;
  cashBuy: number;
  cashSell: number;
  ttBuy: number;
  ttSell: number;
}

const ETB_CURRENCY: CurrencyItem = {
  code: 'ETB',
  name: 'Ethiopian Birr',
  flag: '🇪🇹',
  cashBuy: 1.0,
  cashSell: 1.0,
  ttBuy: 1.0,
  ttSell: 1.0,
};

interface CurrencyConverterProps {
  rates?: ForexRate[];
  loading?: boolean;
  selectedCurrencyCode?: string;
  onBookTicketPress: () => void;
  onSetAlertPress: () => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  rates = [],
  loading = false,
  selectedCurrencyCode,
  onBookTicketPress,
  onSetAlertPress,
}) => {
  const [rateType, setRateType] = useState<'CASH' | 'TT'>('CASH');
  const [amount, setAmount] = useState<string>('100');

  // Dynamically build currencies list from live database rates + ETB base
  const availableCurrencies: CurrencyItem[] = useMemo(() => {
    const list: CurrencyItem[] = rates.map((r) => ({
      code: r.currencyCode,
      name: r.currencyName,
      flag: r.flagEmoji,
      cashBuy: parseFloat(r.cashBuy) || 1,
      cashSell: parseFloat(r.cashSell) || 1,
      ttBuy: parseFloat(r.ttBuy) || 1,
      ttSell: parseFloat(r.ttSell) || 1,
    }));

    list.push(ETB_CURRENCY);
    return list;
  }, [rates]);

  const [fromCode, setFromCode] = useState<string>('USD');
  const [toCode, setToCode] = useState<string>('ETB');

  // Sync when selectedCurrencyCode prop changes from outside (e.g. table click)
  useEffect(() => {
    if (selectedCurrencyCode) {
      setFromCode(selectedCurrencyCode.toUpperCase());
      setToCode('ETB');
    }
  }, [selectedCurrencyCode]);

  // Ensure selected codes exist in available list or fallback gracefully
  const fromCurrency = useMemo(() => {
    return availableCurrencies.find((c) => c.code === fromCode) || availableCurrencies[0] || ETB_CURRENCY;
  }, [availableCurrencies, fromCode]);

  const toCurrency = useMemo(() => {
    return (
      availableCurrencies.find((c) => c.code === toCode) ||
      availableCurrencies.find((c) => c.code === 'ETB') ||
      availableCurrencies[availableCurrencies.length - 1] ||
      ETB_CURRENCY
    );
  }, [availableCurrencies, toCode]);

  // Swap currencies
  const handleSwap = () => {
    setFromCode(toCurrency.code);
    setToCode(fromCurrency.code);
  };

  // Cycle currency selector
  const handleCycleFrom = () => {
    if (availableCurrencies.length <= 1) return;
    const currentIndex = availableCurrencies.findIndex((c) => c.code === fromCurrency.code);
    let nextIndex = (currentIndex + 1) % availableCurrencies.length;
    if (availableCurrencies[nextIndex].code === toCurrency.code) {
      nextIndex = (nextIndex + 1) % availableCurrencies.length;
    }
    setFromCode(availableCurrencies[nextIndex].code);
  };

  const handleCycleTo = () => {
    if (availableCurrencies.length <= 1) return;
    const currentIndex = availableCurrencies.findIndex((c) => c.code === toCurrency.code);
    let nextIndex = (currentIndex + 1) % availableCurrencies.length;
    if (availableCurrencies[nextIndex].code === fromCurrency.code) {
      nextIndex = (nextIndex + 1) % availableCurrencies.length;
    }
    setToCode(availableCurrencies[nextIndex].code);
  };

  // Live conversion formula matching backend logic
  const numAmount = parseFloat(amount) || 0;
  let effectiveRate = 1;

  if (fromCurrency.code !== toCurrency.code) {
    const fromRateToEtb =
      fromCurrency.code === 'ETB'
        ? 1
        : rateType === 'TT'
        ? fromCurrency.ttBuy
        : fromCurrency.cashBuy;

    const toRateToEtb =
      toCurrency.code === 'ETB'
        ? 1
        : rateType === 'TT'
        ? toCurrency.ttSell
        : toCurrency.cashSell;

    effectiveRate = toRateToEtb > 0 ? fromRateToEtb / toRateToEtb : 0;
  }

  const convertedValue = (numAmount * effectiveRate).toFixed(2);
  const formattedRate = effectiveRate.toFixed(4);

  return (
    <View style={forexStyles.converterCard}>
      {/* Title */}
      <View style={forexStyles.cardTitleRow}>
        <Text style={forexStyles.converterTitle}>Convert your currencies</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <MaterialCommunityIcons name="calculator" size={20} color={COLORS.primary} />
        )}
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
              {fromCurrency.code === 'ETB' ? 'ETB ' : '$'}
              {parseInt(val, 10).toLocaleString()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Detailed Breakdown Banner */}
      <View style={forexStyles.breakdownBanner}>
        <View style={forexStyles.breakdownRow}>
          <Text style={forexStyles.breakdownLabel}>Applied Exchange Rate:</Text>
          <Text style={forexStyles.breakdownValue}>
            1 {fromCurrency.code} = {formattedRate} {toCurrency.code}
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
        <Button
          title="Book Forex Counter Ticket"
          onPress={onBookTicketPress}
          variant="primary"
          icon={<MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color={COLORS.white} />}
          style={forexStyles.bookTicketButton}
          textStyle={forexStyles.bookTicketText}
        />

        <Button
          title="Set Rate Alert Notification"
          onPress={onSetAlertPress}
          variant="secondary"
          icon={<Ionicons name="notifications-outline" size={18} color={COLORS.navy} />}
          style={forexStyles.alertButton}
          textStyle={forexStyles.alertButtonText}
        />
      </View>
    </View>
  );
};

