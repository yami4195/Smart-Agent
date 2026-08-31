import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { employeeStyles } from '../../../assets/styles/employee.styles';

export type CounterStatus = 'Available' | 'Serving' | 'On Break';

interface EmployeeHeaderProps {
  branchName?: string;
  counterNumber?: string;
  status: CounterStatus;
  unreadCount?: number;
  onStatusChange?: (newStatus: CounterStatus) => void;
  onNotificationPress?: () => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  branchName = 'Bole Medhanialem Branch',
  counterNumber = '01',
  status,
  unreadCount,
  onStatusChange,
  onNotificationPress,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const getStatusColor = (s: CounterStatus) => {
    switch (s) {
      case 'Available':
        return '#10B981';
      case 'Serving':
        return '#EE7D17';
      case 'On Break':
        return '#F59E0B';
    }
  };

  const getStatusBg = (s: CounterStatus) => {
    switch (s) {
      case 'Available':
        return '#ECFDF5';
      case 'Serving':
        return '#FFF3E0';
      case 'On Break':
        return '#FEF3C7';
    }
  };

  const statuses: CounterStatus[] = ['Available', 'Serving', 'On Break'];

  return (
    <View style={employeeStyles.headerContainer}>
      {/* Left: Bank Icon + Bank Title + Assigned Branch Subtitle */}
      <View style={employeeStyles.headerLeft}>
        <View style={employeeStyles.bankIconBox}>
          <FontAwesome5 name="university" size={17} color={COLORS.primary} />
        </View>
        <View style={employeeStyles.headerTitleCol}>
          <Text style={employeeStyles.headerBankTitle}>Wegagen Bank</Text>
          <Text style={employeeStyles.headerBranchSubtitle} numberOfLines={1}>
            {branchName || 'Assigned Branch'}
          </Text>
        </View>
      </View>

      {/* Right: Availability Dropdown + Notification Bell */}
      <View style={employeeStyles.headerRight}>
        <TouchableOpacity
          style={employeeStyles.statusBadge}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <View style={[employeeStyles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={employeeStyles.statusText}>{status}</Text>
          <Ionicons name="chevron-down" size={12} color="#64748B" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={employeeStyles.notificationBtn}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={18} color="#0F172A" />
          {unreadCount === undefined || unreadCount > 0 ? (
            <View style={employeeStyles.notificationDot} />
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Status Selection Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={employeeStyles.headerModalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={employeeStyles.headerModalContent}>
            <Text style={employeeStyles.headerModalTitle}>Update Counter Status</Text>
            {statuses.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  employeeStyles.headerStatusOption,
                  status === s && { backgroundColor: getStatusBg(s) },
                ]}
                onPress={() => {
                  onStatusChange?.(s);
                  setShowPicker(false);
                }}
              >
                <View style={[employeeStyles.statusDot, { backgroundColor: getStatusColor(s) }]} />
                <Text style={[employeeStyles.headerStatusOptionText, status === s && { fontWeight: '700' }]}>
                  {s}
                </Text>
                {status === s && (
                  <Ionicons name="checkmark" size={18} color={getStatusColor(s)} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default EmployeeHeader;
