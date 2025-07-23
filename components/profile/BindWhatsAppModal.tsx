import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, MessageCircle, Send } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import { AuthService } from '@/services/auth';

interface BindWhatsAppModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BindWhatsAppModal({
  visible,
  onClose,
  onSuccess,
}: BindWhatsAppModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateWhatsApp = (number: string) => {
    // Basic validation for WhatsApp number (should include country code)
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!validateWhatsApp(whatsappNumber.trim())) {
      newErrors.whatsappNumber = 'Please enter a valid WhatsApp number with country code';
    }

    if (codeSent && !verificationCode.trim()) {
      newErrors.verificationCode = 'Verification code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!whatsappNumber.trim() || !validateWhatsApp(whatsappNumber.trim())) {
      setErrors({ whatsappNumber: 'Please enter a valid WhatsApp number with country code' });
      return;
    }

    setIsSendingCode(true);
    try {
      await AuthService.sendWhatsAppCode(whatsappNumber.trim());
      setCodeSent(true);
      startCountdown();
      Alert.alert('Success', 'Verification code sent to your WhatsApp');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send verification code'
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.token) return;

    setIsLoading(true);
    try {
      await UserService.bindWhatsapp(user.token, whatsappNumber.trim(), verificationCode.trim());
      
      Alert.alert(
        'Success',
        'WhatsApp number bound successfully',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      // Reset form
      setWhatsappNumber('');
      setVerificationCode('');
      setCodeSent(false);
      setCountdown(0);
      setErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to bind WhatsApp number'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setWhatsappNumber('');
    setVerificationCode('');
    setCodeSent(false);
    setCountdown(0);
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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <MessageCircle size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {user?.whatsapp ? 'Update WhatsApp' : 'Bind WhatsApp'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {user?.whatsapp && (
              <View style={[styles.currentInfo, { backgroundColor: colors.background }]}>
                <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
                  Current WhatsApp:
                </Text>
                <Text style={[styles.currentValue, { color: colors.text }]}>
                  {user.whatsapp}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: user.whatsapp_bind ? colors.success : colors.warning }
                ]}>
                  <Text style={styles.statusText}>
                    {user.whatsapp_bind ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.whatsappInputContainer}>
              <Input
                label="WhatsApp Number"
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                placeholder="e.g., +1234567890"
                keyboardType="phone-pad"
                error={errors.whatsappNumber}
                editable={!codeSent}
              />
              {!codeSent && (
                <Button
                  title={isSendingCode ? 'Sending...' : 'Send Code'}
                  onPress={handleSendCode}
                  disabled={isSendingCode || !whatsappNumber.trim()}
                  loading={isSendingCode}
                  style={styles.sendCodeButton}
                  rightIcon={<Send size={16} color="#FFFFFF" />}
                />
              )}
            </View>

            {codeSent && (
              <>
                <Input
                  label="Verification Code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Enter code from WhatsApp"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.verificationCode}
                />

                <View style={styles.resendContainer}>
                  <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                    Didn't receive the code?
                  </Text>
                  <TouchableOpacity
                    onPress={handleSendCode}
                    disabled={countdown > 0 || isSendingCode}
                  >
                    <Text style={[
                      styles.resendButton,
                      { 
                        color: countdown > 0 ? colors.textSecondary : colors.primary,
                        opacity: countdown > 0 ? 0.5 : 1,
                      }
                    ]}>
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={[styles.infoBox, { backgroundColor: `${colors.success}10` }]}>
              <Text style={[styles.infoTitle, { color: colors.success }]}>
                💬 WhatsApp Binding
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • Include your country code (e.g., +234 for Nigeria){'\n'}
                • You'll receive security notifications via WhatsApp{'\n'}
                • Make sure the number is active and can receive messages{'\n'}
                • This helps with account recovery and important updates
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
                title={isLoading ? 'Binding...' : (user?.whatsapp ? 'Update' : 'Bind WhatsApp')}
                onPress={handleSubmit}
                disabled={isLoading || !codeSent}
                loading={isLoading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </View>
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  whatsappInputContainer: {
    gap: Spacing.sm,
  },
  sendCodeButton: {
    height: 44,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resendButton: {
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