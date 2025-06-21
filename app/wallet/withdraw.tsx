import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
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
import colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { PaymentMethod, PaymentAccount, AvailablePaymentMethod } from '@/types';
import type { WithdrawInformation } from '@/types/withdraw';

function WithdrawScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
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
      const [methods, availableMethods, withdrawData] = await Promise.all([
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
      setWithdrawInfo(withdrawData);
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors[colorScheme].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors[colorScheme].primary} />
          <Text style={[styles.loadingText, { color: colors[colorScheme].textSecondary }]}>
            Loading withdrawal methods...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors[colorScheme].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors[colorScheme].error }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors[colorScheme].background }]}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: `${colors[colorScheme].primary}15` }]}
        >
          <ChevronLeft size={24} color={colors[colorScheme].primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors[colorScheme].text }]}>Withdraw Funds</Text>
        </View>
      </View>

      {/* Balance Info */}
      <View style={styles.balanceContainer}>
        <Card style={[styles.balanceCard, { backgroundColor: colors[colorScheme].primary }]}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color="#FFFFFF" />
            <Text style={styles.balanceTitle}>Available for Withdrawal</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {getCurrencySymbol()}{getAvailableBalance()}
          </Text>
          <View style={styles.balanceNoteContainer}>
            <Text style={styles.balanceNote}>
              {getMinimumWithdrawalText()}
            </Text>
          </View>
        </Card>
      </View>

      {/* Withdrawal Information */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors[colorScheme].text }]}>
          Withdrawal Information
        </Text>
        
        <View style={styles.infoMethods}>
          {/* 最低提现金额 */}
          <View style={[styles.infoMethod, { backgroundColor: colorScheme === 'dark' ? colors[colorScheme].card : '#F9FAFB' }]}>
            <View style={[styles.infoMethodIcon, { backgroundColor: `${colors[colorScheme].primary}15` }]}>
              <DollarSign size={20} color={colors[colorScheme].primary} />
            </View>
            <View style={styles.infoMethodContent}>
              <Text style={[styles.infoMethodTitle, { color: colors[colorScheme].text }]}>
                Minimum Withdrawal
              </Text>
              <Text style={[styles.infoMethodDescription, { color: colors[colorScheme].textSecondary }]}>
                {activeWalletType === '1' 
                  ? `${withdrawInfo?.currency_name || 'NGN'} ${withdrawInfo?.minimum_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '1,000.00'}`
                  : `USDT ${withdrawInfo?.minimum_amount_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '50.00'}`
                }
              </Text>
            </View>
          </View>

          {/* 处理时间 */}
          <View style={[styles.infoMethod, { backgroundColor: colorScheme === 'dark' ? colors[colorScheme].card : '#F9FAFB' }]}>
            <View style={[styles.infoMethodIcon, { backgroundColor: `${colors[colorScheme].success}15` }]}>
              <Clock size={20} color={colors[colorScheme].success} />
            </View>
            <View style={styles.infoMethodContent}>
              <Text style={[styles.infoMethodTitle, { color: colors[colorScheme].text }]}>
                Processing Time
              </Text>
              <Text style={[styles.infoMethodDescription, { color: colors[colorScheme].textSecondary }]}>
                {withdrawInfo?.timeout_desc || 'Estimated arrival within 5-10 minutes.'}
              </Text>
            </View>
          </View>

          {/* USDT链上转账手续费 */}
          {activeWalletType === '2' && withdrawInfo?.usdt_fee && (
            <View style={[styles.infoMethod, { backgroundColor: colorScheme === 'dark' ? colors[colorScheme].card : '#F9FAFB' }]}>
              <View style={[styles.infoMethodIcon, { backgroundColor: `${colors[colorScheme].warning}15` }]}>
                <CreditCard size={20} color={colors[colorScheme].warning} />
              </View>
              <View style={styles.infoMethodContent}>
                <Text style={[styles.infoMethodTitle, { color: colors[colorScheme].text }]}>
                  Network Fee
                </Text>
                <Text style={[styles.infoMethodDescription, { color: colors[colorScheme].textSecondary }]}>
                  {withdrawInfo.usdt_fee}
                </Text>
              </View>
            </View>
          )}

          {/* 超时赔付最大比例 */}
          {withdrawInfo?.overdue_max_percent && (
            <TouchableOpacity 
              style={[styles.infoMethod, { backgroundColor: colorScheme === 'dark' ? colors[colorScheme].card : '#F9FAFB' }]}
              onPress={() => setShowOverdueModal(true)}
            >
              <View style={[styles.infoMethodIcon, { backgroundColor: `${colors[colorScheme].error}15` }]}>
                <Gift size={20} color={colors[colorScheme].error} />
              </View>
              <View style={styles.infoMethodContent}>
                <Text style={[styles.infoMethodTitle, { color: colors[colorScheme].text }]}>
                  Maximum Compensation
                </Text>
                <Text style={[styles.infoMethodDescription, { color: colors[colorScheme].primary }]}>
                  {withdrawInfo.overdue_max_percent}% (Tap to view details)
                </Text>
              </View>
              <ArrowRight size={18} color={colors[colorScheme].textSecondary} />
            </TouchableOpacity>
          )}

        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors[colorScheme].text }]}>
              Withdrawal Methods
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors[colorScheme].primary }]}
              onPress={handleAddPaymentMethod}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={48} color={colors[colorScheme].textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors[colorScheme].text }]}>
                No withdrawal methods added
              </Text>
              <Text style={[styles.emptyMessage, { color: colors[colorScheme].textSecondary }]}>
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
                        <CreditCard size={20} color={colors[colorScheme].primary} />
                      ) : (
                        <Smartphone size={20} color={colors[colorScheme].primary} />
                      )}
                    </View>
                    <Text style={[styles.methodName, { color: colors[colorScheme].text }]}>
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
  infoMethod: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  infoMethodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoMethodContent: {
    flex: 1,
  },
  infoMethodTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  infoMethodDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});