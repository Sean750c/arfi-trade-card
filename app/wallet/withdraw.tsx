import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ChevronLeft, Plus, CreditCard, Smartphone, DollarSign, Clock, Gift, ArrowRight, AlertCircle, Wallet } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import PaymentMethodCard from '@/components/wallet/PaymentMethodCard';
import AddPaymentMethodModal from '@/components/wallet/AddPaymentMethodModal';
import WithdrawAmountModal from '@/components/wallet/WithdrawAmountModal';
import OverdueCompensationModal from '@/components/wallet/OverdueCompensationModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { WithdrawService } from '@/services/withdraw';
import { PaymentService } from '@/services/payment';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { PaymentMethod, PaymentAccount, AvailablePaymentMethod } from '@/types';
import type { WithdrawInformation } from '@/types/withdraw';

function WithdrawScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  const { activeWalletType } = useWalletStore();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([]);
  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInformation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);

  const [amount, setAmount] = useState('');

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
      const [methods, availableMethods, withdrawInfo] = await Promise.all([
        PaymentService.getPaymentMethods({
          token: user.token,
          type: activeWalletType,
        }),
        PaymentService.getAvailablePaymentMethods({
          token: user.token,
          type: activeWalletType,
          country_id: user.country_id,
        }),
        WithdrawService.getWithdrawInformation({
          token: user.token,
          wallet_type: activeWalletType,
        }),
      ]);

      setPaymentMethods(methods);
      setAvailablePaymentMethods(availableMethods);
      setWithdrawInfo(withdrawInfo);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setShowWithdrawModal(true);
  };

  const handleAddPaymentMethod = () => {
    setShowAddPaymentModal(true);
  };

  const handlePaymentMethodAdded = () => {
    setShowAddPaymentModal(false);
    fetchData(); // Refresh the data
  };

  const getWalletTypeLabel = () => {
    return activeWalletType === '1' ? 'NGN Wallet' : 'USDT Wallet';
  };

  const getAvailableBalance = () => {
    if (!withdrawInfo) return '0.00';

    if (activeWalletType === '1') {
      // NGN钱包
      return withdrawInfo.cashable_amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      // USDT钱包
      return withdrawInfo.cashable_usd_amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const getCurrencySymbol = () => {
    return activeWalletType === '1' ? '₦' : 'USDT';
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = Math.floor((parseFloat(getAvailableBalance()) * percentage) / 100);
    setAmount(quickAmount.toString());
    Keyboard.dismiss();
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }
    const minWithdrawal = parseFloat(getMinimumAmount());
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

    if (!selectedAccount) return;

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Withdrawal Submitted',
        `Your withdrawal of ${getCurrencySymbol()}${formatAmount(parseFloat(amount))} has been submitted successfully. You will receive the funds within ${selectedAccount.timeout_desc.toLowerCase()}.`,
        [{ text: 'OK' }]
      );

      setAmount('');
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string | number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMinimumAmount = () => {
    if (!withdrawInfo) return activeWalletType === '1' ? '1,000' : '50';
    return withdrawInfo.minimum_amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMinimumWithdrawalText = () => {
    if (!withdrawInfo) {
      return activeWalletType === '1'
        ? 'Minimum withdrawal: ₦1,000'
        : 'Minimum withdrawal: USDT 50';
    }

    if (activeWalletType === '1') {
      // NGN钱包
      const amount = withdrawInfo.minimum_amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `Minimum withdrawal: ${withdrawInfo.currency_name} ${amount}`;
    } else {
      // USDT钱包
      const amount = withdrawInfo.minimum_amount_usd.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `Minimum withdrawal: USDT ${amount}`;
    }
  };

  const getWithdrawalInfoText = () => {
    if (!withdrawInfo) {
      return activeWalletType === '1'
        ? 'Minimum withdrawal: ₦1,000\nProcessing time: 5-15 minutes'
        : 'Minimum withdrawal: USDT 50\nProcessing time: 30-60 minutes';
    }

    let infoText = '';

    // 1. 最低提现金额
    if (activeWalletType === '1') {
      const amount = withdrawInfo.minimum_amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      infoText += `Minimum withdrawal: ${withdrawInfo.currency_name} ${amount}\n`;
    } else {
      const amount = withdrawInfo.minimum_amount_usd.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      infoText += `Minimum withdrawal: USDT ${amount}\n`;
    }

    // 2. 处理时间介绍
    const processingTime = withdrawInfo.timeout_desc || 'Estimated arrival within 5-10 minutes.';
    infoText += `Processing time: ${processingTime}\n`;

    // 3. USDT链上转账手续费
    if (activeWalletType === '2' && withdrawInfo.usdt_fee) {
      infoText += `Network fee: ${withdrawInfo.usdt_fee}\n`;
    }

    // 4. 超时赔付最大比例介绍
    if (withdrawInfo.overdue_max_percent) {
      infoText += `Maximum compensation: ${withdrawInfo.overdue_max_percent}%\n`;
    }

    // 5. 通用提示
    infoText += '• Ensure your account details are correct to avoid delays\n';
    infoText += '• Contact support if you don\'t receive funds within the expected time';

    return infoText;
  };

  const getProcessingTime = () => {
    if (!withdrawInfo) return activeWalletType === '1' ? '5-15 minutes' : '30-60 minutes';
    return withdrawInfo.timeout_desc.toLowerCase();
  };

  const getOverdueDataForModal = () => {
    if (!withdrawInfo?.overdue_data || withdrawInfo.overdue_data.length === 0) {
      return [];
    }
    return withdrawInfo.overdue_data;
  };

  const amountError = validateAmount();
  const isValid = !amountError && amount.trim() !== '';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading withdrawal methods...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
      </View>

      {/* Selected Account Info */}
      {withdrawInfo?.bank ? (
        <View style={[styles.accountCard, { backgroundColor: colors.primary }]}>
          <View style={styles.accountHeader}>
            <Image
              source={{ uri: withdrawInfo.bank.bank_logo_image }}
              style={styles.accountLogo}
              resizeMode="contain"
            />
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{withdrawInfo.bank.bank_name}</Text>
              <Text style={styles.accountNumber}>
                {withdrawInfo.bank.bank_account}
              </Text>
            </View>
          </View>
          <View style={styles.timeoutInfo}>
            <Clock size={14} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.timeoutText}>
              {withdrawInfo.timeout_desc}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.accountCard, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
          <CreditCard size={32} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 16, marginTop: 8, fontFamily: 'Inter-SemiBold' }}>No withdrawal methods added</Text>
          <Button
            title="Add New"
            onPress={handleAddPaymentMethod}
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
            backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
            borderColor: amountError ? colors.error : colors.border,
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

        <View style={[styles.infoSection, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}>
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
          {withdrawInfo?.overdue_max_percent && (
            <TouchableOpacity
              style={[styles.compensationContainer,]}
              onPress={() => setShowOverdueModal(true)}
            >
              <Text style={[styles.compensationLabel, { color: colors.primary }]}>
                Delay compensation: up to {withdrawInfo.overdue_max_percent}% maximum payout.
              </Text>
              {/* <ArrowRight size={18} color={colors.textSecondary} /> */}
            </TouchableOpacity>
          )}
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Withdrawal Methods
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddPaymentMethod}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No withdrawal methods added
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                Add a withdrawal method to start withdrawing your funds
              </Text>
              <Button
                title="Add Withdrawal Method"
                onPress={handleAddPaymentMethod}
                style={styles.emptyActionButton}
              />
            </View>
          ) : (
            <View style={styles.paymentMethodsList}>
              {paymentMethods.map((method) => (
                <View key={method.payment_id} style={styles.methodGroup}>
                  <View style={styles.methodHeader}>
                    <View style={styles.methodIcon}>
                      {method.code === 'BANK' ? (
                        <CreditCard size={20} color={colors.primary} />
                      ) : (
                        <Smartphone size={20} color={colors.primary} />
                      )}
                    </View>
                    <Text style={[styles.methodName, { color: colors.text }]}>
                      {method.name}
                    </Text>
                  </View>

                  {method.data_list.map((account) => (
                    <PaymentMethodCard
                      key={account.bank_id}
                      account={account}
                      methodType={method.code}
                      onSelect={() => handleAccountSelect(account)}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        visible={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSuccess={handlePaymentMethodAdded}
        availablePaymentMethods={availablePaymentMethods}
        walletType={activeWalletType}
      />

      {/* Withdraw Amount Modal */}
      <WithdrawAmountModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        selectedAccount={selectedAccount}
        availableBalance={activeWalletType === '1'
          ? (withdrawInfo?.cashable_amount || 0)
          : (withdrawInfo?.cashable_usd_amount || 0)
        }
        currencySymbol={getCurrencySymbol()}
        walletType={activeWalletType}
      />

      {/* Overdue Compensation Modal */}
      <OverdueCompensationModal
        visible={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        overdueData={getOverdueDataForModal()}
        maxPercent={withdrawInfo?.overdue_max_percent}
      />
    </SafeAreaView>
  );
}

export default function WithdrawScreen() {
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  balanceContainer: {
    paddingHorizontal: Spacing.lg,
  },
  balanceCard: {
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Spacing.sm,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  balanceNoteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceNote: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emptyActionButton: {
    paddingHorizontal: Spacing.xl,
  },
  paymentMethodsList: {
    gap: Spacing.lg,
  },
  methodGroup: {
    gap: Spacing.sm,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 135, 81, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  withdrawalInfoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  withdrawalInfoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  infoList: {
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  compensationButton: {
    padding: Spacing.xs,
  },
  tipsContainer: {
    marginTop: Spacing.md,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  infoMethods: {
    gap: Spacing.xs,
  },


  // Account Card
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
    marginBottom: Spacing.sm,
  },
  usdtLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  compensationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'transparent',
  },
  compensationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
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