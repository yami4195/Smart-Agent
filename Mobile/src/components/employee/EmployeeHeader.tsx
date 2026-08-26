import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { employeeStyles } from '../../../assets/styles/employee.styles';

export type CounterStatus = 'Available' | 'Serving' | 'On Break';

interface EmployeeHeaderProps {
  branchName: string;
  counterNumber: string;
  status: CounterStatus;
  onStatusChange?: (newStatus: CounterStatus) => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  branchName,
  counterNumber,
  status,
  onStatusChange,
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
      <View style={employeeStyles.headerLeft}>
        <Text style={employeeStyles.headerBranchTitle}>{branchName}</Text>
        <Text style={employeeStyles.headerSubtitle}>Counter {counterNumber} • Teller Workstation</Text>
      </View>

      <TouchableOpacity
        style={[employeeStyles.statusBadge, { backgroundColor: getStatusBg(status) }]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <View style={[employeeStyles.statusDot, { backgroundColor: getStatusColor(status) }]} />
        <Text style={[employeeStyles.statusText, { color: getStatusColor(status) }]}>{status}</Text>
        <Ionicons name="chevron-down" size={14} color={getStatusColor(status)} style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Status Selection Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Counter Status</Text>
            {statuses.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  status === s && { backgroundColor: getStatusBg(s) },
                ]}
                onPress={() => {
                  onStatusChange?.(s);
                  setShowPicker(false);
                }}
              >
                <View style={[employeeStyles.statusDot, { backgroundColor: getStatusColor(s) }]} />
                <Text style={[styles.statusOptionText, status === s && { fontWeight: '700' }]}>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
    marginLeft: 8,
  },
});

export default EmployeeHeader;
