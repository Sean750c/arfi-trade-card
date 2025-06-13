import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { X, DollarSign, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { PaymentAccount } from '@/types/api';

interface WithdrawAmountModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAccount: PaymentAccount | null;
  availableBalance: number;
  currencySymbol: string;
  walletType: '1' | '2';
}

export default function WithdrawAmountModal({
  visible,
  onClose,
  selectedAccount,
  availableBalance,
  currencySymbol,
  walletType,
}: WithdrawAmountModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const minWithdrawal = 1000;
  const maxWithdrawal = availableBalance;

  const formatAmount = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }
    if (numAmount < minWithdrawal) {
      return `Minimum withdrawal is ${currencySymbol}${formatAmount(minWithdrawal)}`;
    }
    if (numAmount > maxWithdrawal) {
      return `Insufficient balance. Maximum: ${currencySymbol}${formatAmount(maxWithdrawal)}`;
    }
    return null;
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = Math.floor((availableBalance * percentage) / 100);
    setAmount(quickAmount.toString());
  };

  const handleSubmit = async () => {
    const error = validateAmount();
    if (error) {
      Alert.alert('Invalid Amount', error);
      return;
    }

    if (!selectedAccount) return;

    setIsLoading(true);
    try {
      // Here you would call the withdrawal API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Withdrawal Submitted',
        `Your withdrawal of ${currencySymbol}${formatAmount(parseFloat(amount))} has been submitted successfully. You will receive the funds within ${selectedAccount.timeout_desc.toLowerCase()}.`,
        [{ text: 'OK', onPress: onClose }]
      );
      
      setAmount('');
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const error = validateAmount();
  const isValid = !error && amount.trim() !== '';

  if (!selectedAccount) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Withdraw Funds
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Selected Account Info */}
          <View style={[styles.accountCard, { backgroundColor: colors.primary }]}>
            <View style={styles.accountHeader}>
              <Image
                source={{ uri: selectedAccount.bank_logo_image }}
                style={styles.accountLogo}
                resizeMode="contain"
              />
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{selectedAccount.bank_name}</Text>
                <Text style={styles.accountNumber}>
                  {selectedAccount.account_no}
                </Text>
              </View>
            </View>
            <View style={styles.timeoutInfo}>
              <Clock size={14} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.timeoutText}>
                {selectedAccount.timeout_desc}
              </Text>
            </View>
          </View>

          {/* Available Balance */}
          <View style={styles.balanceInfo}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
              Available Balance
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.text }]}>
              {currencySymbol}{formatAmount(availableBalance)}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>
              Withdrawal Amount
            </Text>
            <View style={[
              styles.amountInputContainer,
              {
                backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                borderColor: error ? colors.error : colors.border,
              },
            ]}>
              <DollarSign size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
                {currencySymbol}
              </Text>
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            <Text style={[styles.quickAmountsLabel, { color: colors.textSecondary }]}>
              Quick amounts:
            </Text>
            <View style={styles.quickAmountButtons}>
              {[25, 50, 75, 100].map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  style={[
                    styles.quickAmountButton,
                    { 
                      backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleQuickAmount(percentage)}
                >
                  <Text style={[styles.quickAmountText, { color: colors.text }]}>
                    {percentage}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Withdrawal Info */}
          <View style={[styles.infoCard, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              Withdrawal Information
            </Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              • Minimum withdrawal: {currencySymbol}{formatAmount(minWithdrawal)}{'\n'}
              • Processing time: {selectedAccount.timeout_desc.toLowerCase()}{'\n'}
              • No withdrawal fees for {walletType === '1' ? 'NGN' : 'USDT'} withdrawals{'\n'}
              • Ensure your account details are correct
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={`Withdraw ${currencySymbol}${amount ? formatAmount(parseFloat(amount) || 0) : '0.00'}`}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!isValid}
            style={styles.submitButton}
            fullWidth
          />
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
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  accountCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  accountLogo: {
    width: 32,
    height: 32,
    marginRight: Spacing.sm,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  accountNumber: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  timeoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeoutText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  balanceInfo: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  amountSection: {
    marginBottom: Spacing.lg,
  },
  amountLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  currencyLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  quickAmounts: {
    marginBottom: Spacing.lg,
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  infoCard: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  submitButton: {
    height: 56,
  },
});