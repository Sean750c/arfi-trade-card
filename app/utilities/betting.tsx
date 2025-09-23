import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  ChevronLeft,
  DollarSign,
  ChevronDown,
  History,
  Calculator,
  Trophy,
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import MerchantSelectionModal from '@/components/utilities/MerchantSelectionModal';
import PaymentConfirmationModal from '@/components/utilities/PaymentConfirmationModal';
import PaymentPasswordModal from '@/components/utilities/PaymentPasswordModal';
import RechargeLogsModal from '@/components/utilities/RechargeLogsModal';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUtilitiesStore } from '@/stores/useUtilitiesStore';
import { ServiceType } from '@/types/utilities';
import CustomerServiceButton from '@/components/UI/CustomerServiceButton';

interface PendingPaymentData {
  type: 'lottery';
  merchant: string;
  customerNo: string;
  service: string;
  amount: number;
  paymentAmount: number;
}

function LotteryScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    merchants,
    accountDetails,
    isLoadingMerchants,
    isLoadingAccountDetails,
    isProcessingPayment,
    selectedMerchant,
    fetchMerchants,
    fetchAccountDetails,
    merchantPayment,
    setSelectedMerchant,
  } = useUtilitiesStore();

  const [refreshing, setRefreshing] = useState(false);
  const [customerNumber, setCustomerNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Payment flow states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [paymentPassword, setPaymentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingPaymentData, setPendingPaymentData] = useState<PendingPaymentData | null>(null);

  const lotteryMerchants = merchants[ServiceType.LOTTERY] || [];
  const currentMerchant = selectedMerchant[ServiceType.LOTTERY];

  // 获取当前选择商户的折扣和费用
  const currentMerchantDiscount = currentMerchant?.discount ?? 100; // 默认100%支付
  const currentMerchantFee = currentMerchant?.fee ?? 0;
  // 计算实际折扣百分比
  const actualDiscountPercentage = 100 - currentMerchantDiscount;
  // 计算需要支付的金额
  const calculatePaymentAmount = (amount: number) => {
    const fee = Number(currentMerchantFee);
    const total = amount * (currentMerchantDiscount / 100) + fee;
    return Math.round(total * 100) / 100;
  };

  const calculateDiscountAmount = (amount: number) => {
    return Math.round(amount * (actualDiscountPercentage / 100) * 100) / 100;
  };

  useEffect(() => {
    if (user?.token) {
      fetchMerchants(user.token, ServiceType.LOTTERY);
      if (merchants) {
        setSelectedMerchant(ServiceType.LOTTERY, merchants[ServiceType.LOTTERY][0]);
      }
    }
  }, [user?.token]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;

    setRefreshing(true);
    try {
      await fetchMerchants(user.token, ServiceType.LOTTERY);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token]);

  const validateForm = () => {
    if (!currentMerchant) {
      Alert.alert('Error', 'Please select a betting provider');
      return false;
    }

    if (!customerNumber.trim()) {
      Alert.alert('Error', 'Please enter your account number');
      return false;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter the amount');
      return false;
    }

    const amountValue = parseFloat(amount);
    if (amountValue < currentMerchant.min || amountValue > currentMerchant.max) {
      Alert.alert('Error', `Amount must be between ₦${currentMerchant.min} and ₦${currentMerchant.max}`);
      return false;
    }

    return true;
  };

  const isFormReadyForSubmission = useMemo(() => {
    // Basic checks without alerts for button disabled state
    if (!currentMerchant) return false;
    if (!customerNumber.trim()) return false;
    if (!amount.trim()) return false;
    return true;
  }, [currentMerchant, customerNumber, amount]);

  const handleVerifyAccount = async () => {
    if (!validateForm() || !user?.token || !currentMerchant) return;

    const productCode = '';

    try {
      await fetchAccountDetails(
        user.token,
        currentMerchant.uuid,
        customerNumber.trim(),
        productCode
      );

      const key = `${currentMerchant.uuid}_${customerNumber.trim()}_${productCode}`;
      const details = accountDetails[key];

      if (details) {
        // Check verification result based on code
        if (details.code === 0) {
          // Verification successful
          Alert.alert(
            'Account Verified',
            `Account: ${details.name}\nDetails: ${details.details}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Proceed', onPress: handleProceedPayment },
            ]
          );
        } else {
          // Verification failed
          Alert.alert(
            'Verification Failed',
            details.message || 'Account verification failed. Please check your account number and try again.'
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error instanceof Error ? error.message : 'Failed to verify account'
      );
    }
  };

  const handleProceedPayment = () => {
    if (!currentMerchant || !user?.token) return;

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (currentMerchant && (amountValue < currentMerchant.min || amountValue > currentMerchant.max)) {
      Alert.alert('Error', `Amount must be between ₦${currentMerchant.min} and ₦${currentMerchant.max}`);
      return;
    }
    const paymentAmount = calculatePaymentAmount(amountValue);

    if (paymentAmount > Number(user?.money ?? 0)) {
      Alert.alert('Error', 'Insufficient balance for this payment');
      return;
    }

    setPendingPaymentData({
      type: 'lottery',
      merchant: currentMerchant.name,
      customerNo: customerNumber.trim(),
      service: `Wallet Funding - ₦${amountValue}`,
      amount: amountValue,
      paymentAmount: paymentAmount,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmModal(false);
    setTimeout(() => {
      setShowPasswordModal(true);
    }, 100);
  };

  const handleExecutePayment = async () => {
    if (!user?.token || !pendingPaymentData || !currentMerchant) return;

    if (!paymentPassword || paymentPassword.length !== 6) {
      setPasswordError('Please enter a valid 6-digit payment password');
      return;
    }

    try {
      const productCode = 'wallet_funding';

      await merchantPayment(
        user.token,
        currentMerchant.uuid,
        currentMerchant.name,
        customerNumber.trim(),
        productCode,
        pendingPaymentData.amount,
        ServiceType.LOTTERY,
        paymentPassword
      );

      Alert.alert(
        'Payment Successful! 🎲',
        `Wallet funding of ₦${pendingPaymentData.amount.toLocaleString()} was successful!\n\nAccount: ${pendingPaymentData.customerNo}\nProvider: ${pendingPaymentData.merchant}\nPaid: ₦${pendingPaymentData.paymentAmount.toLocaleString()}`,
        [{
          text: 'OK', onPress: () => {
            setCustomerNumber('');
            setAmount('');
            resetModals();
          }
        }]
      );
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'Failed to process payment. Please try again.'
      );
    }
  };

  const resetModals = () => {
    setShowConfirmModal(false);
    setShowPasswordModal(false);
    setPaymentPassword('');
    setPasswordError('');
    setPendingPaymentData(null);
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
            >
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: colors.text }]}>Lottery & Gaming</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sports betting & lottery wallet funding
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowLogsModal(true)}
                style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
              >
                <History size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Form */}
          <Card style={styles.paymentCard}>
            {/* Balance Display */}
            <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
              <Text style={styles.balanceText}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {user?.currency_symbol || '₦'}{Number(user?.money ?? 0).toLocaleString()}
              </Text>
            </View>

            {/* Provider Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Betting Provider
              </Text>
              <TouchableOpacity
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setShowMerchantModal(true)}
              >
                <View style={styles.selectorContent}>
                  <DollarSign size={20} color={colors.primary} />
                  <Text style={[
                    styles.selectorText,
                    { color: currentMerchant ? colors.text : colors.textSecondary }
                  ]}>
                    {currentMerchant ? currentMerchant.name : 'Select Provider'}
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Amount Selection */}
            <Input
              label="Custom Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter custom amount"
              keyboardType="numeric"
              returnKeyType="done"
            />

            {/* Payment Summary */}
            {amount && (
              <View style={styles.paymentSummary}>
                <View style={styles.calculationHeader}>
                  <Calculator size={16} color={colors.primary} />
                  <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                    Save {actualDiscountPercentage}% with CardKing
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Funding Amount:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ₦{parseFloat(amount || '0').toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.success }]}>
                    CardKing Discount ({actualDiscountPercentage}%):
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    -₦{(calculateDiscountAmount(parseFloat(amount || '0'))).toLocaleString()}
                  </Text>
                </View>
                {currentMerchantFee > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Service Fee:
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      +₦{currentMerchantFee.toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={[styles.summaryLabel, { color: colors.primary, fontFamily: 'Inter-Bold' }]}>
                    Total Payment:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primary, fontFamily: 'Inter-Bold', fontSize: 18 }]}>
                    ₦{calculatePaymentAmount(parseFloat(amount || '0')).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Account Number Input */}
            <Input
              label="Account Number"
              value={customerNumber}
              onChangeText={setCustomerNumber}
              placeholder="Enter your account number"
              keyboardType="default"
              returnKeyType="done"
            />

            <Button
              title={isLoadingAccountDetails ? 'Verifying Account...' : 'Fund Wallet'}
              onPress={handleVerifyAccount}
              disabled={isLoadingAccountDetails || !isFormReadyForSubmission}
              loading={isLoadingAccountDetails}
              style={styles.payButton}
              fullWidth
            />
          </Card>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <MerchantSelectionModal
        visible={showMerchantModal}
        onClose={() => setShowMerchantModal(false)}
        merchants={lotteryMerchants}
        isLoadingMerchants={isLoadingMerchants}
        selectedMerchant={currentMerchant}
        onSelectMerchant={(merchant) => setSelectedMerchant(ServiceType.LOTTERY, merchant)}
        title="Select Gaming Provider"
        serviceIcon={<DollarSign size={20} color="#FFFFFF" />}
      />

      <PaymentConfirmationModal
        chargeDiscount={actualDiscountPercentage}
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        pendingPaymentData={pendingPaymentData}
        onConfirm={handleConfirmPayment}
      />

      <PaymentPasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        paymentPassword={paymentPassword}
        onPaymentPasswordChange={(text) => {
          setPaymentPassword(text);
          setPasswordError('');
        }}
        passwordError={passwordError}
        onExecutePayment={handleExecutePayment}
        isProcessing={isProcessingPayment}
        pendingPaymentData={pendingPaymentData}
      />

      <RechargeLogsModal
        title='Gaming History'
        type='lottery'
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />

      <CustomerServiceButton
        style={styles.customerServiceButton}
      />
    </SafeAreaWrapper>
  );
}

export default function LotteryScreen() {
  return (
    <AuthGuard>
      <LotteryScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Payment Card
  paymentCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  paymentSummary: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  calculationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  totalRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: Spacing.sm,
  },
  payButton: {
    height: 48,
    marginTop: Spacing.md,
  },
  customerServiceButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
});