import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Mail, Send, Shield, CircleCheck as CheckCircle } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import SixDigitPasswordInput from '@/components/UI/SixDigitPasswordInput';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';

interface ForgotWithdrawalPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ForgotWithdrawalPasswordModal({
  visible,
  onClose,
  onSuccess,
}: ForgotWithdrawalPasswordModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<'email' | 'verify' | 'password'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'email':
        if (!email.trim()) {
          newErrors.email = 'Email address is required';
        } else if (!validateEmail(email.trim())) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      
      case 'verify':
        if (!verificationCode.trim()) {
          newErrors.verificationCode = 'Verification code is required';
        } else if (verificationCode.length !== 6) {
          newErrors.verificationCode = 'Verification code must be 6 digits';
        }
        break;
      
      case 'password':
        if (!newPassword.trim()) {
          newErrors.newPassword = 'New password is required';
        } else if (newPassword.length !== 6) {
          newErrors.newPassword = 'Password must be exactly 6 digits';
        } else if (!/^\d{6}$/.test(newPassword)) {
          newErrors.newPassword = 'Password must contain only numbers';
        }

        if (!confirmPassword.trim()) {
          newErrors.confirmPassword = 'Please confirm your new password';
        } else if (newPassword !== confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
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
    if (!validateCurrentStep() || !user?.token) return;

    setIsSendingCode(true);
    try {
      await UserService.sendWithdrawalPasswordResetEmail({
        email: email.trim(),
        token: user.token,
      });
      
      setCurrentStep('verify');
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

  const handleVerifyCode = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep('password');
  };

  const handleResetPassword = async () => {
    if (!validateCurrentStep() || !user?.token) return;

    setIsLoading(true);
    try {
      await UserService.resetWithdrawalPasswordByEmail({
        email: email.trim(),
        verify_code: verificationCode.trim(),
        new_password: newPassword,
        token: user.token,
      });
      
      Alert.alert(
        'Success',
        'Withdrawal password reset successfully',
        [{ text: 'OK', onPress: onSuccess }]
      );
      
      // Reset form
      handleClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to reset withdrawal password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentStep('email');
    setCountdown(0);
    setErrors({});
    onClose();
  };

  const handleBackStep = () => {
    switch (currentStep) {
      case 'verify':
        setCurrentStep('email');
        break;
      case 'password':
        setCurrentStep('verify');
        break;
    }
    setErrors({});
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Enter your registered email address to receive a verification code for resetting your withdrawal password.
            </Text>
            
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your registered email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Button
              title={isSendingCode ? 'Sending Code...' : 'Send Verification Code'}
              onPress={handleSendCode}
              disabled={isSendingCode || !email.trim()}
              loading={isSendingCode}
              style={styles.actionButton}
              rightIcon={<Send size={16} color="#FFFFFF" />}
              fullWidth
            />
          </>
        );

      case 'verify':
        return (
          <>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              We've sent a 6-digit verification code to {email}. Please enter the code below.
            </Text>
            
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

            <Button
              title="Verify Code"
              onPress={handleVerifyCode}
              disabled={!verificationCode.trim() || verificationCode.length !== 6}
              style={styles.actionButton}
              fullWidth
            />
          </>
        );

      case 'password':
        return (
          <>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Create a new 6-digit withdrawal password. This password will be required for all withdrawal requests.
            </Text>
            
            <SixDigitPasswordInput
              label="New Withdrawal Password"
              value={newPassword}
              onChangeText={setNewPassword}
              error={errors.newPassword}
              autoFocus={true}
            />
            
            <SixDigitPasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            <Button
              title={isLoading ? 'Resetting Password...' : 'Reset Password'}
              onPress={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              loading={isLoading}
              style={styles.actionButton}
              fullWidth
            />
          </>
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Reset Withdrawal Password';
      case 'verify':
        return 'Verify Email';
      case 'password':
        return 'Set New Password';
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'email':
        return '1';
      case 'verify':
        return '2';
      case 'password':
        return '3';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose} />
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Shield size={24} color={colors.primary} />
              <View style={styles.titleTextContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {getStepTitle()}
                </Text>
                <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>
                  Step {getStepNumber()} of 3
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: currentStep === 'email' ? '33%' : currentStep === 'verify' ? '66%' : '100%'
                  }
                ]} 
              />
            </View>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              {renderStepContent()}
              
              {/* Back Button for steps 2 and 3 */}
              {currentStep !== 'email' && (
                <Button
                  title="Back"
                  variant="outline"
                  onPress={handleBackStep}
                  style={styles.backButton}
                  fullWidth
                />
              )}
            </View>
          </ScrollView>

          {/* Security Note */}
          <View style={[styles.securityNote, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={[styles.securityNoteText, { color: colors.text }]}>
              🔒 For your security, withdrawal password reset requires email verification. 
              Make sure to use the email address associated with your account.
            </Text>
          </View>
        </View>
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
    maxHeight: '90%',
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  titleTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  stepIndicator: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  scrollView: {
    flex: 1,
    maxHeight: 400,
  },
  form: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resendButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actionButton: {
    height: 48,
    marginTop: Spacing.md,
  },
  backButton: {
    height: 44,
    marginTop: Spacing.sm,
  },
  securityNote: {
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  securityNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    textAlign: 'center',
  },
});