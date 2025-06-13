import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Plus, CreditCard, Smartphone } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Button from '@/components/UI/Button';
import PaymentMethodCard from '@/components/wallet/PaymentMethodCard';
import AddPaymentMethodModal from '@/components/wallet/AddPaymentMethodModal';
import WithdrawAmountModal from '@/components/wallet/WithdrawAmountModal';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { PaymentService } from '@/services/payment';
import type { PaymentMethod, PaymentAccount, AvailablePaymentMethod } from '@/types/api';

function WithdrawScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  const { activeWalletType, getCurrentBalanceData } = useWalletStore();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);

  const balanceData = getCurrentBalanceData();

  useEffect(() => {
    if (user?.token) {
      fetchPaymentData();
    }
  }, [user?.token, activeWalletType]);

  const fetchPaymentData = async () => {
    if (!user?.token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [methods, availableMethods] = await Promise.all([
        PaymentService.getPaymentMethods({
          token: user.token,
          type: activeWalletType,
        }),
        PaymentService.getAvailablePaymentMethods({
          token: user.token,
          type: activeWalletType,
        }),
      ]);

      setPaymentMethods(methods);
      setAvailablePaymentMethods(availableMethods);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load payment methods');
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
    fetchPaymentData(); // Refresh the list
  };

  const getWalletTypeLabel = () => {
    return activeWalletType === '1' ? 'NGN Wallet' : 'USDT Wallet';
  };

  const getAvailableBalance = () => {
    if (!balanceData) return '0.00';
    return balanceData.withdraw_amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getCurrencySymbol = () => {
    return activeWalletType === '1' ? '₦' : 'USDT';
  };

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
            onPress={fetchPaymentData}
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
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Withdraw Funds</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            From {getWalletTypeLabel()}
          </Text>
        </View>
      </View>

      {/* Balance Info */}
      <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
        <Text style={styles.balanceAmount}>
          {getCurrencySymbol()}{getAvailableBalance()}
        </Text>
        <Text style={styles.balanceNote}>
          Withdrawals are processed within {activeWalletType === '1' ? '5-15 minutes' : '30-60 minutes'}
        </Text>
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

        {/* Information */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Important Information
          </Text>
          <View style={styles.infoList}>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              • Minimum withdrawal amount: {getCurrencySymbol()}1,000
            </Text>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              • Processing time: {activeWalletType === '1' ? '5-15 minutes' : '30-60 minutes'}
            </Text>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              • Ensure your account details are correct to avoid delays
            </Text>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              • Contact support if you don't receive funds within the expected time
            </Text>
          </View>
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
        availableBalance={balanceData?.withdraw_amount || 0}
        currencySymbol={getCurrencySymbol()}
        walletType={activeWalletType}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  balanceNote: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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
  infoSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  infoList: {
    gap: Spacing.sm,
  },
  infoItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});