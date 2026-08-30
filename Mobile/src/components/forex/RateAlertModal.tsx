import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { COLORS } from '../../../constants/colors';
import { forexApi, ForexRate } from '../../api/forexApi';

interface RateAlertModalProps {
  visible: boolean;
  onClose: () => void;
  rates?: ForexRate[];
  initialCurrencyCode?: string;
}

export const RateAlertModal: React.FC<RateAlertModalProps> = ({
  visible,
  onClose,
  rates = [],
  initialCurrencyCode = 'USD',
}) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>(initialCurrencyCode);
  const [targetRate, setTargetRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Set default currency & suggested rate when opened or initialCurrencyCode changes
  useEffect(() => {
    if (visible) {
      const code = initialCurrencyCode || (rates[0]?.currencyCode ?? 'USD');
      setSelectedCurrencyCode(code);
      const found = rates.find((r) => r.currencyCode === code);
      if (found) {
        setTargetRate(found.cashSell || found.cashBuy || '');
      } else {
        setTargetRate('');
      }
    }
  }, [visible, initialCurrencyCode, rates]);

  const handleSelectCurrency = (code: string) => {
    setSelectedCurrencyCode(code);
    const found = rates.find((r) => r.currencyCode === code);
    if (found) {
      setTargetRate(found.cashSell || found.cashBuy || '');
    }
  };

  const handleSetAlert = async () => {
    const rateNum = parseFloat(targetRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      Alert.alert('Invalid Target Rate', 'Please enter a valid positive exchange rate in ETB.');
      return;
    }

    try {
      setSubmitting(true);
      await forexApi.createAlert(selectedCurrencyCode, rateNum);
      Alert.alert(
        'Rate Alert Set! 🔔',
        `You will be notified when ${selectedCurrencyCode} reaches ${rateNum.toFixed(2)} ETB at Wegagen Bank.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save rate alert to database.';
      Alert.alert('Rate Alert Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRateObj = rates.find((r) => r.currencyCode === selectedCurrencyCode);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={forexStyles.modalOverlay}>
        <View style={forexStyles.modalContent}>
          {/* Header */}
          <View style={forexStyles.modalHeaderRow}>
            <Text style={forexStyles.modalTitle}>Set Exchange Rate Alert</Text>
            <Pressable style={forexStyles.modalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.navy} />
            </Pressable>
          </View>

          <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 }}>
            Get an instant push notification when your desired exchange rate is reached in our database.
          </Text>

          {/* Currency Selector Horizontal Chips */}
          {rates.length > 0 && (
            <View style={{ marginBottom: 14 }}>
              <Text style={forexStyles.inputGroupLabel}>Select Currency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 4 }}>
                {rates.map((r) => {
                  const isSelected = r.currencyCode === selectedCurrencyCode;
                  return (
                    <Pressable
                      key={r.currencyCode}
                      onPress={() => handleSelectCurrency(r.currencyCode)}
                      style={[
                        forexStyles.filterTab,
                        { marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
                        isSelected && forexStyles.filterTabActive,
                      ]}
                    >
                      <Text style={{ fontSize: 14 }}>{r.flagEmoji}</Text>
                      <Text style={[forexStyles.filterTabText, isSelected && forexStyles.filterTabTextActive]}>
                        {r.currencyCode}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Target Currency Pair */}
          <View style={forexStyles.inputGroup}>
            <Text style={forexStyles.inputGroupLabel}>Currency Pair</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.navy }}>
              {selectedRateObj?.flagEmoji || '🌐'} {selectedCurrencyCode} / 🇪🇹 ETB
            </Text>
          </View>

          {/* Target Rate Input */}
          <View style={forexStyles.inputGroup}>
            <Text style={forexStyles.inputGroupLabel}>Notify Me When Rate Reaches (ETB)</Text>
            <TextInput
              style={forexStyles.amountInput}
              value={targetRate}
              onChangeText={setTargetRate}
              keyboardType="numeric"
              placeholder="e.g. 130.00"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Submit Action */}
          <Pressable
            style={[forexStyles.bookTicketButton, { marginTop: 12, opacity: submitting ? 0.7 : 1 }]}
            onPress={handleSetAlert}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="notifications" size={18} color={COLORS.white} />
                <Text style={forexStyles.bookTicketText}>Create Live Rate Alert</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

