import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from '../../../assets/styles/profile.styles';
import { commonStyles } from '../../../assets/styles/common.styles';
import { Button } from '../common/Button';
import { COLORS } from '../../../constants/colors';

export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
  onSave: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  initialFirstName,
  initialLastName,
  initialPhone,
  onSave,
}) => {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setFirstName(initialFirstName);
      setLastName(initialLastName);
      setPhone(initialPhone);
    }
  }, [visible, initialFirstName, initialLastName, initialPhone]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'First name and last name are required.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={profileStyles.modalOverlay}
      >
        <View style={profileStyles.modalContent}>
          {/* Modal Header */}
          <View style={profileStyles.modalHeader}>
            <Text style={profileStyles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={COLORS.navy} />
            </TouchableOpacity>
          </View>

          {/* First Name Input */}
          <View style={commonStyles.inputWrapper}>
            <Text style={commonStyles.inputLabel}>First Name</Text>
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={commonStyles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Last Name Input */}
          <View style={commonStyles.inputWrapper}>
            <Text style={commonStyles.inputLabel}>Last Name</Text>
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={commonStyles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Phone Number Input */}
          <View style={commonStyles.inputWrapper}>
            <Text style={commonStyles.inputLabel}>Phone Number</Text>
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={commonStyles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+251 911 234 567"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Actions */}
          <View style={profileStyles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={profileStyles.modalCancelButton}
              disabled={loading}
            />
            <Button
              title="Save"
              variant="navy"
              onPress={handleSave}
              loading={loading}
              style={profileStyles.modalSaveButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
