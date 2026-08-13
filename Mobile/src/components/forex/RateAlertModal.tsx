import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { COLORS } from '../../../constants/colors';

interface RateAlertModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RateAlertModal: React.FC<RateAlertModalProps> = ({ visible, onClose }) => {
  const [targetRate, setTargetRate] = useState('127.00');

  const handleSetAlert = () => {
    Alert.alert(
      'Rate Alert Set! 🔔',
      `You will receive a push notification when USD/ETB hits ${targetRate} ETB.`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

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
            Get an instant push notification when your desired exchange rate is reached at Wegagen Bank counters.
          </Text>

          {/* Target Currency Pair */}
          <View style={forexStyles.inputGroup}>
            <Text style={forexStyles.inputGroupLabel}>Currency Pair</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.navy }}>🇺🇸 USD / 🇪🇹 ETB</Text>
          </View>

          {/* Target Rate Input */}
          <View style={forexStyles.inputGroup}>
            <Text style={forexStyles.inputGroupLabel}>Notify Me When Rate Reaches (ETB)</Text>
            <TextInput
              style={forexStyles.amountInput}
              value={targetRate}
              onChangeText={setTargetRate}
              keyboardType="numeric"
              placeholder="e.g. 127.00"
            />
          </View>

          {/* Submit Action */}
          <Pressable style={[forexStyles.bookTicketButton, { marginTop: 12 }]} onPress={handleSetAlert}>
            <Ionicons name="notifications" size={18} color={COLORS.white} />
            <Text style={forexStyles.bookTicketText}>Create Rate Alert</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
