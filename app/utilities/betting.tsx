import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import {
  ChevronLeft,
  DollarSign,
  ChevronDown,
  History,
  Calculator,
  User,
  CreditCard,
  Dice6,
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
import { ServiceType, MerchantEntry } from '@/types/utilities';

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

  // Predefined amounts for lottery/betting
  const lotteryAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

  let chargeDiscount = user?.charge_discount || 98;

  const calculatePaymentAmount = (amount: number) => {
    return Math.round(amount * chargeDiscount) / 100;
  };

  useEffect(() => {
    if (user?.token) {
      fetchMerchants(user.token, ServiceType.LOTTERY);
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
      Alert.alert('Error', 'Please select a lottery/betting provider');
      return false;
    }

    if (!customerNumber.trim()) {
      Alert.alert('Error', 'Please enter your account number/username');
      return false;
    }

    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter the amount');
      return false;
    }

    const amountValue = parseFloat(amount);
    if (amountValue < 100 || amountValue > 1000000) {
      Alert.alert('Error', 'Amount must be between ₦100 and ₦1,000,000');
      return false;
    }

    return true;
  };

  const handleVerifyAccount = async () => {
    if (!validateForm() || !user?.token || !currentMerchant) return;

    const productCode = 'wallet_funding'; // Default product code for lottery/betting
    
    try {
      await fetchAccountDetails(
        user.token,
        currentMerchant.id.toString(),
        customerNumber.trim(),
        productCode
      );

      const key = `${currentMerchant.id}_${customerNumber.trim()}_${productCode}`;
      const details = accountDetails[key];
      
      if (details) {
        Alert.alert(
          'Account Verified',
          `Account: ${details.name}\nDetails: ${details.details}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Proceed', onPress: handleProceedPayment },
          ]
        );
      }
    } catch (error) {
      // For lottery, account verification might not be required
      // Proceed directly to payment
      handleProceedPayment();
    }
  };

  const handleProceedPayment = () => {
    if (!currentMerchant || !user?.token) return;

    const amountValue = parseFloat(amount);
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
        currentMerchant.id.toString(),
        currentMerchant.name,
        customerNumber.trim(),
        productCode,
        pendingPaymentData.amount,
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
              Betting/Lottery Provider
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

          {/* Account Number Input */}
          <Input
            label="Account Number / Username"
            value={customerNumber}
            onChangeText={setCustomerNumber}
            placeholder="Enter your account number or username"
            keyboardType="default"
            returnKeyType="done"
          />

          {/* Amount Selection */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Select Amount
            </Text>
            <View style={styles.amountGrid}>
              {lotteryAmounts.map((presetAmount) => (
                <TouchableOpacity
                  key={presetAmount}
                  style={[
                    styles.amountOption,
                    {
                      backgroundColor: amount === presetAmount.toString()
                        ? colors.primary
                        : colors.background,
                      borderColor: amount === presetAmount.toString()
                        ? colors.primary
                        : colors.border,
                    }
                  ]}
                  onPress={() => setAmount(presetAmount.toString())}
                >
                  <Text style={[
                    styles.amountText,
                    {
                      color: amount === presetAmount.toString()
                        ? '#FFFFFF'
                        : colors.text
                    }
                  ]}>
                    ₦{presetAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Custom Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter custom amount"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* Payment Summary */}
          {amount && (
            <View style={styles.paymentSummary}>
              <View style={styles.calculationHeader}>
                <Calculator size={16} color={colors.primary} />
                <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                  Save {100 - chargeDiscount}% with CardKing
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
                  CardKing Discount ({100 - chargeDiscount}%):
                </Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -₦{(parseFloat(amount || '0') - calculatePaymentAmount(parseFloat(amount || '0'))).toLocaleString()}
                </Text>
              </View>
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

          <Button
            title={isLoadingAccountDetails ? 'Verifying Account...' : 'Fund Wallet'}
            onPress={handleVerifyAccount}
            disabled={isLoadingAccountDetails || !validateForm()}
            loading={isLoadingAccountDetails}
            style={styles.payButton}
            fullWidth
          />
        </Card>

        {/* Info Section */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Trophy size={24} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Lottery & Gaming Services
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Fund your betting and lottery accounts{'\n'}
            • Support for sports betting platforms{'\n'}
            • Instant wallet funding{'\n'}
            • Support for major Nigerian gaming platforms{'\n'}
            • Secure payment from your wallet balance
          </Text>
        </Card>

        {/* Warning Section */}
        <Card style={[styles.warningCard, { backgroundColor: `${colors.warning}10` }]}>
          <View style={styles.warningHeader}>
            <Dice6 size={20} color={colors.warning} />
            <Text style={[styles.warningTitle, { color: colors.warning }]}>
              Responsible Gaming
            </Text>
          </View>
          <Text style={[styles.warningText, { color: colors.text }]}>
            • Only bet what you can afford to lose{'\n'}
            • Set limits for yourself and stick to them{'\n'}
            • Gambling should be for entertainment only{'\n'}
            • Seek help if gambling becomes a problem
          </Text>
        </Card>
      </ScrollView>

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
        chargeDiscount={100 - chargeDiscount}
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
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  amountOption: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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

  // Info Card
  infoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },

  // Warning Card
  warningCard: {
    padding: Spacing.lg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});