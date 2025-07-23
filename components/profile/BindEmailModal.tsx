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
import { X, Mail, Send } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import { AuthService } from '@/services/auth';

interface BindEmailModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BindEmailModal({
  visible,
  onClose,
  onSuccess,
}: BindEmailModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
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
    if (!email.trim() || !validateEmail(email.trim())) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsSendingCode(true);
    try {
      await AuthService.sendEmailVerifyCode(email.trim());
      setCodeSent(true);
      startCountdown();
      Alert.alert('Success', 'Verification code sent to your email');
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
      await UserService.bindEmail(user.token, email.trim(), verificationCode.trim());
      
      Alert.alert(
        'Success',
        'Email address bound successfully',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      // Reset form
      setEmail('');
      setVerificationCode('');
      setCodeSent(false);
      setCountdown(0);
      setErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to bind email address'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
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
              <Mail size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {user?.email ? 'Update Email Address' : 'Bind Email Address'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {user?.email && (
              <View style={[styles.currentInfo, { backgroundColor: colors.background }]}>
                <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
                  Current Email:
                </Text>
                <Text style={[styles.currentValue, { color: colors.text }]}>
                  {user.email}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: user.is_email_bind ? colors.success : colors.warning }
                ]}>
                  <Text style={styles.statusText}>
                    {user.is_email_bind ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.emailInputContainer}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                editable={!codeSent}
              />
              {!codeSent && (
                <Button
                  title={isSendingCode ? 'Sending...' : 'Send Code'}
                  onPress={handleSendCode}
                  disabled={isSendingCode || !email.trim()}
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
                  placeholder="Enter 6-digit code"
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

            <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.infoTitle, { color: colors.primary }]}>
                📧 Email Binding
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • Your email will be used for account security and recovery{'\n'}
                • You'll receive important notifications about your account{'\n'}
                • Make sure to use an email you have access to
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
                title={isLoading ? 'Binding...' : (user?.email ? 'Update' : 'Bind Email')}
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
  emailInputContainer: {
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