import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  TextInput,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { ChevronLeft, Plus, CreditCard, Clock, ArrowRight, AlertCircle } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Button from '@/components/UI/Button';
import WithdrawCompensationModal from '@/components/wallet/WithdrawCompensationModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { WithdrawService } from '@/services/withdraw';
import Spacing from '@/constants/Spacing';
import type { WithdrawInformation } from '@/types/withdraw';
import Input from '@/components/UI/Input';

function WithdrawScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { activeWalletType, selectedWithdrawAccount, setSelectedWithdrawAccount } = useWalletStore();

  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInformation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOverdueModal, setShowOverdueModal] = useState(false);

  const [amount, setAmount] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [user?.token, activeWalletType]);

  const fetchData = async () => {
    if (!user?.token) return;

    setIsLoading(true);
    setError(null);

    try {
      const withdrawInfo = await WithdrawService.getWithdrawInformation({
        token: user.token,
        wallet_type: activeWalletType,
      });

      setWithdrawInfo(withdrawInfo);
      if (withdrawInfo.bank) {
        setSelectedWithdrawAccount({
          bank_id: withdrawInfo.bank.bank_id,
          is_def: 1,
          bank_logo: withdrawInfo.bank.bank_logo,
          bank_logo_image: withdrawInfo.bank.bank_logo_image,
          bank_name: withdrawInfo.bank.bank_name,
          account_no: withdrawInfo.bank.bank_account,
          account_name: '',
          timeout_desc: withdrawInfo.timeout_desc || '',
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableBalance = () => {
    if (!withdrawInfo) return 0.00;

    if (activeWalletType === '1') {
      // NGN钱包
      return withdrawInfo.cashable_amount;
    } else {
      // USDT钱包
      return withdrawInfo.cashable_usd_amount;
    }
  };

  const getCurrencySymbol = () => {
    const currencyName = withdrawInfo?.currency_name || 'NGN';
    return activeWalletType === '1' ? currencyName : 'USDT';
  };

  const handleQuickAmount = (percentage: number) => {
    const availableBalance = getAvailableBalance();
    const quickAmount = Math.floor((availableBalance * percentage) / 100);
    setAmount(quickAmount.toString());
    Keyboard.dismiss();
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }
    const minWithdrawal = getMinimumAmount();
    if (numAmount < minWithdrawal) {
      return `Minimum withdrawal is ${getCurrencySymbol()}${formatAmount(minWithdrawal)}`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const amountError = validateAmount();
    if (amountError) {
      Alert.alert('Invalid Amount', amountError);
      return;
    }
    if (!selectedWithdrawAccount) {
      Alert.alert('No Withdrawal Method', 'Please select a withdrawal method before submitting.');
      return;
    }
    if (!user?.token) return;
    setPasswordModalVisible(true);
  };

  const handlePasswordConfirm = async () => {
    if (!withdrawPassword.trim()) {
      setPasswordError('Please enter your withdrawal password');
      return;
    }
    setPasswordError('');
    setPasswordModalVisible(false);
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await WithdrawService.applyWithdraw({
        token: user!.token,
        bank_id: selectedWithdrawAccount!.bank_id,
        amount: amount,
        password: withdrawPassword,
        channel_type: String(user!.channel_type ?? '')
      });
      await fetchData();
      Alert.alert(
        'Withdrawal Submitted',
        `Your withdrawal of ${getCurrencySymbol()}${formatAmount(parseFloat(amount))} has been submitted successfully. You will receive the funds within ${(selectedWithdrawAccount && selectedWithdrawAccount.timeout_desc ? selectedWithdrawAccount.timeout_desc.toLowerCase() : '')}.`,
        [{ text: 'OK' }]
      );
      setAmount('');
      setWithdrawPassword('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMinimumAmount = () => {
    if (activeWalletType === '1') {
      return withdrawInfo?.minimum_amount || 1500;
    } else {
      return withdrawInfo?.minimum_amount_usd || 50;
    }
  };

  const getOverdueDataForModal = () => {
    if (!withdrawInfo?.overdue_data || withdrawInfo.overdue_data.length === 0) {
      return [];
    }
    return withdrawInfo.overdue_data;
  };

  const amountError = validateAmount();
  const isValid = selectedWithdrawAccount && !amountError && amount.trim() !== '';

  const openPaymentList = () => {
    router.push({ pathname: '/wallet/payment-list' });
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading withdrawal methods...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <Button
            title="Try Again"
            onPress={fetchData}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Withdraw Funds</Text>
        </View>
        {/* Add Button */}
        <TouchableOpacity
          onPress={() => openPaymentList()}
          style={[styles.addButton, { backgroundColor: colors.primary, }]}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Selected Account Info */}
      {selectedWithdrawAccount ? (
        <View style={[styles.accountCard, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.accountHeader}>
              <Image
                source={{ uri: selectedWithdrawAccount.bank_logo_image }}
                style={styles.accountLogo}
                resizeMode="contain"
              />
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{selectedWithdrawAccount.bank_name}</Text>
                <Text style={styles.accountNumber}>
                  {selectedWithdrawAccount.account_no}
                </Text>
              </View>
            </View>
            {!!selectedWithdrawAccount.timeout_desc && (
              <View style={styles.timeoutInfo}>
                <Clock size={14} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.timeoutText}>
                  {selectedWithdrawAccount.timeout_desc}
                </Text>
              </View>
            )}
          </View>
          {/* Switch Button */}
          <TouchableOpacity
            onPress={() => openPaymentList()}
            style={{ marginLeft: 12, padding: 8, backgroundColor: '#fff2', borderRadius: 8 }}
          >
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.accountCard, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
          <CreditCard size={32} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 16, marginTop: 8, fontFamily: 'Inter-SemiBold' }}>No withdrawal methods added</Text>
          <Button
            title="Add New"
            onPress={() => openPaymentList()}
            style={{ marginTop: 12, width: 160 }}
          />
        </View>
      )}

      {/* Available Balance */}
      <View style={styles.balanceInfo}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          Available Balance
        </Text>
        <Text style={[styles.balanceAmount2, { color: colors.text }]}>
          {getCurrencySymbol()}{formatAmount(getAvailableBalance())}
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
            backgroundColor: colors.card,
            borderColor: amountError ? colors.error : colors.border,
          },
        ]}>
          <TextInput
            style={[styles.amountInput, { color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={true}
          />
          <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
            {getCurrencySymbol()}
          </Text>
        </View>

        {amountError && (
          <View style={styles.amountErrorContainer}>
            <AlertCircle size={16} color={colors.error} />
            <Text style={[styles.amountErrorText, { color: colors.error }]}>
              {amountError}
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
                  backgroundColor: colors.card,
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

        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          {/* 最低提现金额 */}
          <Text style={[styles.minAmountsLabel, { color: colors.textSecondary }]}>
            Minimum withdrawal amount({getCurrencySymbol()}{formatAmount(getMinimumAmount())}).
          </Text>

          {/* USDT链上转账手续费 */}
          {activeWalletType === '2' && withdrawInfo?.usdt_fee && (
            <Text style={[styles.usdtLabel, { color: colors.textSecondary }]}>
              USDT transfers require a transaction fee({withdrawInfo.usdt_fee}USDT).
            </Text>
          )}

          {/* 超时赔付最大比例 */}
          {!!withdrawInfo?.overdue_max_percent && (
            <TouchableOpacity
              style={[styles.compensationContainer,]}
              onPress={() => setShowOverdueModal(true)}
            >
              <Text style={[styles.compensationLabel, { color: colors.primary }]}>
                Delay compensation: up to {withdrawInfo?.overdue_max_percent}% maximum payout.
              </Text>
              {/* <ArrowRight size={18} color={colors.textSecondary} /> */}
            </TouchableOpacity>
          )}

          <Text style={[styles.otherInfoLabel, { color: colors.textSecondary }]}>
            Ensure your account details are correct to avoid delays.
          </Text>
          <Text style={[styles.otherInfoLabel, { color: colors.textSecondary }]}>
            Contact support for delayed funds.
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={`Withdraw ${getCurrencySymbol()}${amount ? formatAmount(parseFloat(amount) || 0) : '0.00'}`}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!isValid}
          style={styles.submitButton}
          fullWidth
        />
      </View>

      {/* Overdue Compensation Modal */}
      <WithdrawCompensationModal
        visible={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        overdueData={getOverdueDataForModal()}
        maxPercent={withdrawInfo?.overdue_max_percent}
      />

      {/* 密码输入弹窗 */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: colors.card, borderRadius: 16, padding: 24 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 16 }}>Enter Withdrawal Password</Text>
              <Input
                placeholder="Enter your withdrawal password"
                secureTextEntry
                value={withdrawPassword}
                onChangeText={setWithdrawPassword}
                error={passwordError}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button title="Cancel" onPress={() => { setPasswordModalVisible(false); setWithdrawPassword(''); setPasswordError(''); }} style={{ marginRight: 12, minWidth: 80 }} />
                <Button title="Confirm" onPress={handlePasswordConfirm} style={{ minWidth: 80 }} />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaWrapper>
  );
}

export default function WithdrawScreen() {
  const { colors } = useTheme();
  return (
    <AuthGuard>
      <WithdrawScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  accountCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    marginHorizontal: Spacing.lg,
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
  balanceAmount2: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  amountSection: {
    paddingHorizontal: Spacing.lg,
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
  amountErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  amountErrorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  quickAmounts: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
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
  infoSection: {
    padding: Spacing.sm,
    borderRadius: 12,
  },
  minAmountsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  usdtLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  compensationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'transparent',
    marginBottom: Spacing.xs,
  },
  compensationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  otherInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    height: 56,
    width: '100%',
  },
});