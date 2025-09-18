import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Shield } from 'lucide-react-native';
import Button from '@/components/UI/Button';
import SixDigitPasswordInput from '@/components/UI/SixDigitPasswordInput';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

interface PendingRechargeData {
  type: 'airtime' | 'data';
  supplier: string;
  phone: string;
  amount: number;
  paymentAmount: number;
  dataBundle?: {
    serviceName: string;
    servicePrice: number;
  };
}

interface PendingPaymentData {
  type: string;
  merchant: string;
  customerNo: string;
  service: string;
  amount: number;
  paymentAmount: number;
}

interface PaymentPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  paymentPassword: string;
  onPaymentPasswordChange: (password: string) => void;
  passwordError: string;
  onExecutePayment?: () => void;
  onExecuteRecharge?: () => void;
  isRecharging?: boolean;
  isProcessing?: boolean;
  pendingRechargeData?: PendingRechargeData | null;
  pendingPaymentData?: PendingPaymentData | null;
}

export default function PaymentPasswordModal({
  visible,
  onClose,
  paymentPassword,
  onPaymentPasswordChange,
  passwordError,
  onExecutePayment,
  onExecuteRecharge,
  isRecharging,
  isProcessing,
  pendingRechargeData,
  pendingPaymentData,
}: PaymentPasswordModalProps) {
  const { colors } = useTheme();

  const handlePasswordChange = (text: string) => {
    onPaymentPasswordChange(text);
  };

  const handleExecute = () => {
    if (onExecutePayment) {
      onExecutePayment();
    } else if (onExecuteRecharge) {
      onExecuteRecharge();
    }
  };

  const getPaymentInfo = () => {
    if (pendingRechargeData) {
      return `You are about to pay ₦${pendingRechargeData.paymentAmount.toLocaleString()} for ${pendingRechargeData.type === 'airtime' ? 'airtime' : 'data'} recharge`;
    }
    if (pendingPaymentData) {
      return `You are about to pay ₦${pendingPaymentData.paymentAmount.toLocaleString()} for ${pendingPaymentData.service}`;
    }
    return '';
  };

  const isLoading = isRecharging || isProcessing;
  const buttonTitle = isLoading ? 'Processing...' : 'Pay Now';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // 根据你的Header高度调整
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Shield size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Enter Payment Password
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContent}>
            {(pendingRechargeData || pendingPaymentData) && (
              <View style={[styles.paymentInfo, { backgroundColor: colors.background }]}>
                <Text style={[styles.paymentInfoText, { color: colors.textSecondary }]}>
                  {getPaymentInfo()}
                </Text>
              </View>
            )}

            <SixDigitPasswordInput
              label="Payment Password"
              value={paymentPassword}
              onChangeText={handlePasswordChange}
              error={passwordError}
              autoFocus={true}
            />

            <View style={styles.passwordActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={onClose}
                style={styles.cancelButton}
              />
              <Button
                title={buttonTitle}
                onPress={handleExecute}
                disabled={isLoading || paymentPassword.length !== 6}
                loading={isLoading}
                style={styles.payButton}
              />
            </View>
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
    padding: Spacing.lg,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderRadius: 12,
    padding: Spacing.lg,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
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
  passwordContent: {
    gap: Spacing.lg,
  },
  paymentInfo: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  passwordActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 1,
  },
});
