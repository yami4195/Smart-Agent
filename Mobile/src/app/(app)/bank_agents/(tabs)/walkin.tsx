import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { employeeStyles } from '../../../../../assets/styles/employee.styles';
import { commonStyles } from '../../../../../assets/styles/common.styles';
import { COLORS } from '../../../../../constants/colors';
import { employeeApi, EmployeeTicket } from '../../../../api/employee.api';
import { branchApi } from '../../../../api/branch.api';
import { authStyles } from '../../../../../assets/styles/auth.styles';

const SERVICES = [
  { id: '1', name: 'Cash Deposit & Withdrawal', icon: 'cash' },
  { id: '2', name: 'Foreign Exchange (Forex)', icon: 'currency-usd' },
  { id: '3', name: 'Account Opening', icon: 'account-plus' },
  { id: '4', name: 'Remittance & Transfer', icon: 'bank-transfer' },
  { id: '5', name: 'Customer Support', icon: 'headset' },
];

export default function WalkInScreen() {
  const [branchId, setBranchId] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('Wegagen - Bole Branch');

  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>(SERVICES[0].name);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [issuedTicket, setIssuedTicket] = useState<any | null>(null);
  const [recentIssued, setRecentIssued] = useState<any[]>([]);

  // Initialize branch
  useEffect(() => {
    async function init() {
      try {
        const res = await branchApi.getBranches({ limit: 1 });
        if (res.branches && res.branches.length > 0) {
          setBranchId(res.branches[0].id);
          setBranchName(res.branches[0].name);
        }
      } catch {
        setBranchId('branch-bole');
      }
    }
    init();
  }, []);

  const handleGenerateTicket = async () => {
    if (!branchId) return;

    try {
      setSubmitting(true);
      const ticket = await employeeApi.createWalkInTicket({
        branchId,
        customerName: customerName.trim() || 'Walk-in Customer',
        phone: phone.trim(),
        serviceId: undefined,
      });

      const fullTicket = {
        ...ticket,
        serviceName: selectedService,
        branchName: branchName,
        customerName: customerName.trim() || 'Walk-in Customer',
        issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setIssuedTicket(fullTicket);
      setRecentIssued((prev) => [fullTicket, ...prev]);

      // Reset input fields
      setCustomerName('');
      setPhone('');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to issue ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintSlip = () => {
    Alert.alert(
      'Print Token Slip',
      `Sending token ${issuedTicket?.ticketNumber} to branch kiosk receipt printer.`
    );
  };

  return (
    <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          style={authStyles.keyboardView}
        >
    <View style={commonStyles.safeArea}>
      {/* Top Header */}
      <View style={employeeStyles.headerContainer}>
        <View style={employeeStyles.headerLeft}>
          <Text style={employeeStyles.headerBranchTitle}>{branchName}</Text>
          <Text style={employeeStyles.headerSubtitle}>Walk-in Token Dispenser</Text>
        </View>
      </View>

      <ScrollView
        style={employeeStyles.screenContainer}
        contentContainerStyle={employeeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* If a ticket was just issued -> Show Digital Receipt Slip */}
        {issuedTicket ? (
          <View>
            <View style={employeeStyles.receiptCard}>
              <Text style={employeeStyles.receiptBankName}>WEGAGEN BANK • ወጋገን ባንክ</Text>
              <Text style={employeeStyles.receiptBranch}>{branchName}</Text>

              <Text style={employeeStyles.receiptTokenNumber}>
                {issuedTicket.ticketNumber || 'A-012'}
              </Text>

              <Text style={employeeStyles.receiptServiceName}>
                {issuedTicket.serviceName || selectedService}
              </Text>

              <View style={employeeStyles.receiptDivider} />

              <View style={employeeStyles.receiptRow}>
                <Text style={employeeStyles.receiptRowLabel}>Customer</Text>
                <Text style={employeeStyles.receiptRowValue}>
                  {issuedTicket.customerName || 'Walk-in Customer'}
                </Text>
              </View>

              <View style={employeeStyles.receiptRow}>
                <Text style={employeeStyles.receiptRowLabel}>Time Issued</Text>
                <Text style={employeeStyles.receiptRowValue}>{issuedTicket.issuedAt}</Text>
              </View>

              <View style={employeeStyles.receiptRow}>
                <Text style={employeeStyles.receiptRowLabel}>Est. Wait Time</Text>
                <Text style={[employeeStyles.receiptRowValue, { color: COLORS.primary }]}>
                  ~{issuedTicket.estimatedWaitMins || 6} mins
                </Text>
              </View>

              <View style={employeeStyles.receiptRow}>
                <Text style={employeeStyles.receiptRowLabel}>People Ahead</Text>
                <Text style={employeeStyles.receiptRowValue}>
                  {issuedTicket.peopleAhead ?? 2}
                </Text>
              </View>
            </View>

            {/* Receipt Actions */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1, backgroundColor: COLORS.navy }]}
                onPress={handlePrintSlip}
                activeOpacity={0.85}
              >
                <Feather name="printer" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Print Ticket</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1, backgroundColor: COLORS.primary }]}
                onPress={() => setIssuedTicket(null)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>New Token</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Issue Form */
          <View style={styles.formContainer}>
            <Text style={styles.formSectionTitle}>Select Banking Service</Text>
            <View style={styles.serviceCardsGrid}>
              {SERVICES.map((srv) => {
                const isSelected = selectedService === srv.name;
                return (
                  <TouchableOpacity
                    key={srv.id}
                    style={[
                      styles.serviceOptionCard,
                      isSelected && styles.serviceOptionCardActive,
                    ]}
                    onPress={() => setSelectedService(srv.name)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={srv.icon as any}
                      size={24}
                      color={isSelected ? COLORS.primary : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.serviceOptionTitle,
                        isSelected && styles.serviceOptionTitleActive,
                      ]}
                    >
                      {srv.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Customer Details Form */}
            <Text style={[styles.formSectionTitle, { marginTop: 16 }]}>Customer Information</Text>

            <Text style={styles.inputLabel}>Customer Name (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Almaz Tadesse"
              placeholderTextColor="#94A3B8"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0911223344"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Generate Action */}
            <TouchableOpacity
              style={[styles.generateButton, submitting && { opacity: 0.7 }]}
              onPress={handleGenerateTicket}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Issue Ticket Token</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Recently Issued List */}
        {recentIssued.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <View style={employeeStyles.sectionHeader}>
              <Text style={employeeStyles.sectionTitle}>Tokens Issued This Session</Text>
              <Text style={employeeStyles.sectionCount}>{recentIssued.length} total</Text>
            </View>

            {recentIssued.map((item, idx) => (
              <View key={idx} style={employeeStyles.ticketItem}>
                <View style={employeeStyles.ticketItemLeft}>
                  <View style={employeeStyles.ticketItemTokenBadge}>
                    <Text style={employeeStyles.ticketItemTokenText}>{item.ticketNumber}</Text>
                  </View>
                  <View style={employeeStyles.ticketItemDetails}>
                    <Text style={employeeStyles.ticketItemCustomerName}>
                      {item.customerName || 'Walk-in Customer'}
                    </Text>
                    <Text style={employeeStyles.ticketItemServiceName}>{item.serviceName}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>
                  {item.issuedAt}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  serviceCardsGrid: {
    gap: 8,
  },
  serviceOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceOptionCardActive: {
    backgroundColor: '#FFF3E0',
    borderColor: COLORS.primary,
  },
  serviceOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 10,
    flex: 1,
  },
  serviceOptionTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
