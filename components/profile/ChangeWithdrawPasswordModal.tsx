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
  Pressable,
} from 'react-native';
import { X, Eye, EyeOff, Shield } from 'lucide-react-native';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import SixDigitPasswordInput from '@/components/UI/SixDigitPasswordInput';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserService } from '@/services/user';
import ForgotWithdrawalPasswordModal from './ForgotWithdrawalPasswordModal';

interface ChangeWithdrawPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeWithdrawPasswordModal({
  visible,
  onClose,
  onSuccess,
}: ChangeWithdrawPasswordModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const isFirstTimeSetup = user?.t_password_null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isFirstTimeSetup && !currentPassword.trim()) {
      newErrors.currentPassword = 'Current withdraw password is required';
    } else if (!isFirstTimeSetup && currentPassword.length !== 6) {
      newErrors.currentPassword = 'Password must be exactly 6 digits';
    } else if (!isFirstTimeSetup && !/^\d{6}$/.test(currentPassword)) {
      newErrors.currentPassword = 'Password must contain only numbers';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New withdraw password is required';
    } else if (newPassword.length !== 6) {
      newErrors.newPassword = 'Password must be exactly 6 digits';
    } else if (!/^\d{6}$/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain only numbers';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    } else if (confirmPassword.length !== 6) {
      newErrors.confirmPassword = 'Password must be exactly 6 digits';
    } else if (!/^\d{6}$/.test(confirmPassword)) {
      newErrors.confirmPassword = 'Password must contain only numbers';
    }

    if (!isFirstTimeSetup && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.token) return;

    setIsLoading(true);
    try {
      if (isFirstTimeSetup) {
        // First time setup - use addWithdrawPassword
        await UserService.addWithdrawPassword(user.token, newPassword);
      } else {
        // Change existing password
        await UserService.changeWithdrawPassword(user.token, currentPassword, newPassword);
      }

      Alert.alert(
        'Success',
        isFirstTimeSetup
          ? 'Withdraw password set successfully'
          : 'Withdraw password changed successfully',
        [{ text: 'OK', onPress: onSuccess }]
      );

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to change withdraw password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  return (
    <>
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
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {isFirstTimeSetup ? 'Set Withdraw Password' : 'Change Withdraw Password'}
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
                {!isFirstTimeSetup && (
                  <SixDigitPasswordInput
                    label="Current Withdraw Password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    error={errors.currentPassword}
                  />
                )}

                <SixDigitPasswordInput
                  label="New Withdraw Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  error={errors.newPassword}
                />

                <SixDigitPasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                />

                {/* <View style={styles.passwordTips}>
                <Text style={[styles.tipsTitle, { color: colors.text }]}>Password Requirements:</Text>
                <Text style={[styles.tipsText, { color: colors.textSecondary }]}>• Must be exactly 6 digits{`\n`}• Only numbers are allowed{`\n`}• Easy to remember but secure</Text>
              </View> */}

                {/* Forgot Password Link - Only show if not first time setup */}
                {!isFirstTimeSetup && (
                  <View style={styles.forgotPasswordContainer}>
                    <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>
                      Forgot your withdrawal password?
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        setShowForgotPasswordModal(true);
                      }}
                    >
                      <Text style={[styles.forgotPasswordLink, { color: colors.primary }]}>
                        Reset via Email
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleClose}
                    style={styles.cancelButton}
                  />
                  <Button
                    title={isLoading ? (isFirstTimeSetup ? 'Setting...' : 'Changing...') : (isFirstTimeSetup ? 'Set Password' : 'Change Password')}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    loading={isLoading}
                    style={styles.submitButton}
                  />
                </View>

                {/* <View style={[styles.securityNote, { backgroundColor: `${colors.primary}10` }]}>
                <Text style={[styles.securityNoteText, { color: colors.text }]}>
                  🔒 Your withdraw password is used to authorize all withdrawal requests and ensure account security.
                </Text>
              </View> */}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

      </Modal>

      {/* Forgot Withdrawal Password Modal */}
      <ForgotWithdrawalPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={() => {
          setShowForgotPasswordModal(false);
          onSuccess();
        }}
      />
    </>
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
    maxHeight: '85%',
    minHeight: 560,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scrollView: {
    flex: 1,
    maxHeight: 500,
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
    gap: Spacing.sm,
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
  passwordTips: {
    padding: Spacing.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  tipsText: {
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
  securityNote: {
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  securityNoteText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  forgotPasswordLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});