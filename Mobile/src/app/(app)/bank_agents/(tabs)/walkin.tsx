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
import { agentsStyles } from '../../../../../assets/styles/agents.styles';
import { useNotification } from '../../../../contexts/NotificationContext';

const SERVICES = [
  { id: '1', name: 'Cash Deposit & Withdrawal', icon: 'cash' },
  { id: '2', name: 'Foreign Exchange (Forex)', icon: 'currency-usd' },
  { id: '3', name: 'Account Opening', icon: 'account-plus' },
  { id: '4', name: 'Remittance & Transfer', icon: 'bank-transfer' },
  { id: '5', name: 'Customer Support', icon: 'headset' },
];

export default function WalkInScreen() {
  const { unreadCount, openNotificationModal } = useNotification();
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

        <TouchableOpacity
          style={employeeStyles.notificationBtn}
          onPress={openNotificationModal}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={18} color="#0F172A" />
          {unreadCount > 0 && <View style={employeeStyles.notificationDot} />}
        </TouchableOpacity>
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
                style={[agentsStyles.primaryBtn, { flex: 1, backgroundColor: COLORS.navy }]}
                onPress={handlePrintSlip}
                activeOpacity={0.85}
              >
                <Feather name="printer" size={18} color="#FFFFFF" />
                <Text style={agentsStyles.primaryBtnText}>Print Ticket</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[agentsStyles.primaryBtn, { flex: 1, backgroundColor: COLORS.primary }]}
                onPress={() => setIssuedTicket(null)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={agentsStyles.primaryBtnText}>New Token</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Issue Form */
          <View style={agentsStyles.formContainer}>
            <Text style={agentsStyles.formSectionTitle}>Select Banking Service</Text>
            <View style={agentsStyles.serviceCardsGrid}>
              {SERVICES.map((srv) => {
                const isSelected = selectedService === srv.name;
                return (
                  <TouchableOpacity
                    key={srv.id}
                    style={[
                      agentsStyles.serviceOptionCard,
                      isSelected && agentsStyles.serviceOptionCardActive,
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
                        agentsStyles.serviceOptionTitle,
                        isSelected && agentsStyles.serviceOptionTitleActive,
                      ]}
                    >
                      {srv.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Customer Details Form */}
            <Text style={[agentsStyles.formSectionTitle, { marginTop: 16 }]}>Customer Information</Text>

            <Text style={agentsStyles.inputLabel}>Customer Name (Optional)</Text>
            <TextInput
              style={agentsStyles.textInput}
              placeholder="e.g. Almaz Tadesse"
              placeholderTextColor="#94A3B8"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Text style={agentsStyles.inputLabel}>Phone Number (Optional)</Text>
            <TextInput
              style={agentsStyles.textInput}
              placeholder="0911223344"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Generate Action */}
            <TouchableOpacity
              style={[agentsStyles.generateButton, submitting && { opacity: 0.7 }]}
              onPress={handleGenerateTicket}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#FFFFFF" />
                  <Text style={agentsStyles.generateButtonText}>Issue Ticket Token</Text>
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
};