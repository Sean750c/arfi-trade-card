import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Phone } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';

interface BindPhoneModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BindPhoneModal({
  visible,
  onClose,
  onSuccess,
}: BindPhoneModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    } else if (phoneNumber.trim().length < 10) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.token) return;

    setIsLoading(true);
    try {
      await UserService.bindPhone(user.token, phoneNumber.trim());
      
      Alert.alert(
        'Success',
        'Phone number bound successfully',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      // Reset form
      setPhoneNumber('');
      setErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to bind phone number'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleClose}
        >
          <TouchableOpacity 
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.titleContainer}>
                <Phone size={24} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {user?.phone ? 'Update Phone Number' : 'Bind Phone Number'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.form}>
                {user?.phone && (
                  <View style={[styles.currentInfo, { backgroundColor: colors.background }]}>
                    <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
                      Current Phone:
                    </Text>
                    <Text style={[styles.currentValue, { color: colors.text }]}>
                      {user.phone}
                    </Text>
                  </View>
                )}

                <Input
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                />

                <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
                  <Text style={[styles.infoTitle, { color: colors.primary }]}>
                    📱 Phone Number Binding
                  </Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    • Your phone number will be used for account security{'\n'}
                    • Include country code for international numbers{'\n'}
                    • This helps with account recovery and security notifications
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleClose}
                    style={styles.cancelButton}
                  />
                  <Button
                    title={isLoading ? 'Binding...' : (user?.phone ? 'Update' : 'Bind Phone')}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    loading={isLoading}
                    style={styles.submitButton}
                  />
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '75%',
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scrollView: {
    flex: 1,
    maxHeight: 400,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  form: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  currentInfo: {
    padding: Spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currentLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  currentValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  infoBox: {
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});