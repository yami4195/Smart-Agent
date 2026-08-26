import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';

interface WalkInModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { customerName: string; phone: string; serviceName: string }) => Promise<void>;
}

const SERVICES = [
  'Cash Deposit & Withdrawal',
  'Foreign Exchange (Forex)',
  'Account Opening',
  'Remittance & Transfer',
  'Customer Support',
];

export const WalkInModal: React.FC<WalkInModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit({
        customerName: customerName.trim(),
        phone: phone.trim(),
        serviceName: selectedService,
      });
      // reset form
      setCustomerName('');
      setPhone('');
      setSelectedService(SERVICES[0]);
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to issue walk-in ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Issue Walk-in Ticket</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Customer Name */}
            <Text style={styles.label}>Customer Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Abebe Kebede"
              placeholderTextColor="#94A3B8"
              value={customerName}
              onChangeText={setCustomerName}
            />

            {/* Phone Number */}
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="0911223344"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Select Service */}
            <Text style={styles.label}>Banking Service</Text>
            <View style={styles.servicesGrid}>
              {SERVICES.map((srv) => (
                <TouchableOpacity
                  key={srv}
                  style={[
                    styles.serviceChip,
                    selectedService === srv && styles.serviceChipActive,
                  ]}
                  onPress={() => setSelectedService(srv)}
                >
                  <Text
                    style={[
                      styles.serviceChipText,
                      selectedService === srv && styles.serviceChipTextActive,
                    ]}
                  >
                    {srv}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Generate Ticket Token</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  servicesGrid: {
    gap: 8,
    marginBottom: 20,
  },
  serviceChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceChipActive: {
    backgroundColor: '#FFF3E0',
    borderColor: COLORS.primary,
  },
  serviceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  serviceChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default WalkInModal;
