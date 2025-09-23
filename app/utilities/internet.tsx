import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Globe,
  ChevronDown,
  History,
  Calculator,
  User,
  CreditCard,
  Wifi,
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import MerchantSelectionModal from '@/components/utilities/MerchantSelectionModal';
import ServiceSelectionModal from '@/components/utilities/ServiceSelectionModal';
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
  type: 'internet';
  merchant: string;
  customerNo: string;
  service: string;
  amount: number;
  paymentAmount: number;
}

function InternetScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    merchants,
    merchantServices,
    accountDetails,
    isLoadingMerchants,
    isLoadingServices,
    isLoadingAccountDetails,
    isProcessingPayment,
    selectedMerchant,
    selectedService,
    fetchMerchants,
    fetchMerchantServices,
    fetchAccountDetails,
    merchantPayment,
    setSelectedMerchant,
    setSelectedService,
  } = useUtilitiesStore();

  const [refreshing, setRefreshing] = useState(false);
  const [customerNumber, setCustomerNumber] = useState('');
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Payment flow states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [paymentPassword, setPaymentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingPaymentData, setPendingPaymentData] = useState<PendingPaymentData | null>(null);

  const internetMerchants = merchants[ServiceType.INTERNET] || [];
  const currentMerchant = selectedMerchant[ServiceType.INTERNET];
  const currentServices = currentMerchant ? merchantServices[currentMerchant.uuid] || [] : [];
  const currentSelectedService = currentMerchant ? selectedService[currentMerchant.uuid] : null;

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
      fetchMerchants(user.token, ServiceType.INTERNET);
      if (merchants) {
        setSelectedMerchant(ServiceType.INTERNET, merchants[ServiceType.INTERNET][0]);
      }
    }
  }, [user?.token]);

  // Fetch services when merchant is selected
  useEffect(() => {
    if (user?.token && currentMerchant) {
      fetchMerchantServices(user.token, currentMerchant.uuid);
    }
  }, [user?.token, currentMerchant]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;

    setRefreshing(true);
    try {
      await fetchMerchants(user.token, ServiceType.INTERNET);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token]);

  const validateForm = () => {
    if (!currentMerchant) {
      Alert.alert('Error', 'Please select an internet service provider');
      return false;
    }

    if (!customerNumber.trim() || customerNumber.trim().length < 5) { // 假设客户号码至少5位
      Alert.alert('Error', 'Please enter your customer number');
      return false;
    }

    if (!currentSelectedService || currentSelectedService.price <= 0) {
      Alert.alert('Error', 'Please select a plan');
      return false;
    }

    return true;
  };

  const isFormReadyForSubmission = useMemo(() => {
    // Basic checks without alerts for button disabled state
    if (!currentMerchant) return false;
    if (!customerNumber.trim()) return false;
    if (!currentSelectedService) return false;
    return true;
  }, [currentMerchant, customerNumber, currentSelectedService]);

  const handleVerifyAccount = async () => {
    if (!validateForm() || !user?.token || !currentMerchant) return;

    const productCode = currentSelectedService?.code || 'custom';

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
            `Customer: ${details.name}\nAccount Details: ${details.details}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Proceed', onPress: handleProceedPayment },
            ]
          );
        } else {
          // Verification failed
          Alert.alert(
            'Verification Failed',
            details.message || 'Account verification failed. Please check your customer number and try again.'
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
    if (!currentMerchant || !user?.token || !currentSelectedService) return;

    const amount = currentSelectedService.price;

    const paymentAmount = calculatePaymentAmount(amount);

    if (paymentAmount > Number(user?.money ?? 0)) {
      Alert.alert('Error', 'Insufficient balance for this payment');
      return;
    }

    setPendingPaymentData({
      type: 'internet',
      merchant: currentMerchant.name,
      customerNo: customerNumber.trim(), // 确保传递的是trim后的值
      service: currentSelectedService ? currentSelectedService.name : `Internet Service - ₦${amount}`,
      amount: amount,
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
      const productCode = currentSelectedService?.code || 'custom';

      await merchantPayment(
        user.token,
        currentMerchant.uuid,
        currentMerchant.name, // 确保传递的是trim后的值
        customerNumber.trim(),
        productCode,
        pendingPaymentData.amount,
        ServiceType.INTERNET,
        paymentPassword
      );

      Alert.alert(
        'Payment Successful! 🌐',
        `Internet service payment of ₦${pendingPaymentData.amount.toLocaleString()} was successful!\n\nAccount: ${pendingPaymentData.customerNo}\nService: ${pendingPaymentData.service}\nPaid: ₦${pendingPaymentData.paymentAmount.toLocaleString()}`,
        [{
          text: 'OK', onPress: () => {
            setCustomerNumber('');
            currentMerchant && setSelectedService(currentMerchant.uuid, null);
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
            <Text style={[styles.title, { color: colors.text }]}>Internet Bills</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Pay your broadband & internet bills
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
              Internet Service Provider
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
                <Globe size={20} color={colors.primary} />
                <Text style={[
                  styles.selectorText,
                  { color: currentMerchant ? colors.text : colors.textSecondary }
                ]}>
                  {currentMerchant ? currentMerchant.name : 'Select Internet Provider'}
                </Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Service Plan Selection */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Select Plan
            </Text>
            <TouchableOpacity
              style={[
                styles.selector,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setShowServiceModal(true)}
            >
              <View style={styles.selectorContent}>
                <Wifi size={20} color={colors.primary} />
                <Text style={[
                  styles.selectorText,
                  { color: currentSelectedService ? colors.text : colors.textSecondary }
                ]}>
                  {currentSelectedService
                    ? `${currentSelectedService.name} - ₦${currentSelectedService.price.toLocaleString()}`
                    : 'Select Internet Plan'
                  }
                </Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Payment Summary */}
          {(currentSelectedService) && (
            <View style={styles.paymentSummary}>
              {currentMerchant && <View style={styles.calculationHeader}>
                <Calculator size={16} color={colors.primary} />
                <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                  Save {actualDiscountPercentage}% with CardKing
                </Text>
              </View>}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Service Amount:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ₦{currentSelectedService.price.toLocaleString()}
                </Text>
              </View>
              {currentMerchant && <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.success }]}>
                  CardKing Discount ({actualDiscountPercentage}%):
                </Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -₦{(calculateDiscountAmount(currentSelectedService.price)).toLocaleString()}
                </Text>
              </View>
              }
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
                  ₦{calculatePaymentAmount(currentSelectedService.price).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
          {/* Customer Number Input */}
          <Input
            label="Customer Number"
            value={customerNumber}
            onChangeText={setCustomerNumber}
            placeholder="Enter your customer number"
            keyboardType="default"
            returnKeyType="done"
          />

          <Button
            title={isLoadingAccountDetails ? 'Verifying Account...' : 'Verify & Pay'}
            onPress={handleVerifyAccount}
            disabled={isLoadingAccountDetails || !isFormReadyForSubmission}
            loading={isLoadingAccountDetails}
            style={styles.payButton}
            fullWidth
          />
        </Card>
      </ScrollView>

      {/* Modals */}
      <MerchantSelectionModal
        visible={showMerchantModal}
        onClose={() => setShowMerchantModal(false)}
        merchants={internetMerchants}
        isLoadingMerchants={isLoadingMerchants}
        selectedMerchant={currentMerchant}
        onSelectMerchant={(merchant) => setSelectedMerchant(ServiceType.INTERNET, merchant)}
        title="Select Internet Provider"
        serviceIcon={<Globe size={20} color="#FFFFFF" />}
      />

      <ServiceSelectionModal
        visible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        services={currentServices}
        isLoadingServices={isLoadingServices}
        selectedService={currentSelectedService}
        onSelectService={(service) => currentMerchant && setSelectedService(currentMerchant.uuid, service)}
        title="Select Internet Plan"
        merchantName={currentMerchant?.name}
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
        title='Internet History'
        type='internet'
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />

      <CustomerServiceButton
        style={styles.customerServiceButton}
      />
    </SafeAreaWrapper>
  );
}

export default function InternetScreen() {
  return (
    <AuthGuard>
      <InternetScreenContent />
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