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
  Tv,
  ChevronDown,
  History,
  Calculator,
  User,
  CreditCard,
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
import { ServiceType, MerchantEntry, MerchantServiceEntry } from '@/types/utilities';

interface PendingPaymentData {
  type: 'cable-tv';
  merchant: string;
  customerNo: string;
  service: string;
  amount: number;
  paymentAmount: number;
}

function CableTVScreenContent() {
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
  const [customAmount, setCustomAmount] = useState('');
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Payment flow states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [paymentPassword, setPaymentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingPaymentData, setPendingPaymentData] = useState<PendingPaymentData | null>(null);

  const cableTVMerchants = merchants[ServiceType.CABLE_TV] || [];
  const currentMerchant = selectedMerchant[ServiceType.CABLE_TV];
  const currentServices = currentMerchant ? merchantServices[currentMerchant.id.toString()] || [] : [];
  const currentSelectedService = currentMerchant ? selectedService[currentMerchant.id.toString()] : null;

  let chargeDiscount = user?.charge_discount || 98;

  const calculatePaymentAmount = (amount: number) => {
    return Math.round(amount * chargeDiscount) / 100;
  };

  useEffect(() => {
    if (user?.token) {
      fetchMerchants(user.token, ServiceType.CABLE_TV);
    }
  }, [user?.token]);

  // Fetch services when merchant is selected
  useEffect(() => {
    if (user?.token && currentMerchant) {
      fetchMerchantServices(user.token, currentMerchant.id.toString());
    }
  }, [user?.token, currentMerchant]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;

    setRefreshing(true);
    try {
      await fetchMerchants(user.token, ServiceType.CABLE_TV);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token]);

  const validateForm = () => {
    if (!currentMerchant) {
      Alert.alert('Error', 'Please select a cable TV provider');
      return false;
    }

    if (!customerNumber.trim()) {
      Alert.alert('Error', 'Please enter your customer number/smartcard number');
      return false;
    }

    if (!currentSelectedService && !customAmount) {
      Alert.alert('Error', 'Please select a package or enter custom amount');
      return false;
    }

    if (customAmount && (parseFloat(customAmount) <= 0 || parseFloat(customAmount) > 100000)) {
      Alert.alert('Error', 'Amount must be between ₦1 and ₦100,000');
      return false;
    }

    return true;
  };

  const handleVerifyAccount = async () => {
    if (!validateForm() || !user?.token || !currentMerchant) return;

    const productCode = currentSelectedService?.code || 'custom';
    
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
          `Customer: ${details.name}\nDetails: ${details.details}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Proceed', onPress: handleProceedPayment },
          ]
        );
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

    const amount = currentSelectedService ? currentSelectedService.price : parseFloat(customAmount);
    const paymentAmount = calculatePaymentAmount(amount);

    if (paymentAmount > Number(user?.money ?? 0)) {
      Alert.alert('Error', 'Insufficient balance for this payment');
      return;
    }

    setPendingPaymentData({
      type: 'cable-tv',
      merchant: currentMerchant.name,
      customerNo: customerNumber.trim(),
      service: currentSelectedService ? currentSelectedService.name : `Custom Payment - ₦${amount}`,
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
        currentMerchant.id.toString(),
        currentMerchant.name,
        customerNumber.trim(),
        productCode,
        pendingPaymentData.amount,
        paymentPassword
      );

      Alert.alert(
        'Payment Successful! 🎉',
        `Cable TV payment of ₦${pendingPaymentData.amount.toLocaleString()} was successful!\n\nCustomer: ${pendingPaymentData.customerNo}\nService: ${pendingPaymentData.service}\nPaid: ₦${pendingPaymentData.paymentAmount.toLocaleString()}`,
        [{
          text: 'OK', onPress: () => {
            setCustomerNumber('');
            setCustomAmount('');
            setSelectedService(currentMerchant.id.toString(), null);
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
            <Text style={[styles.title, { color: colors.text }]}>Cable TV</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              DSTV, GOtv & other subscriptions
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
              Cable TV Provider
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
                <Tv size={20} color={colors.primary} />
                <Text style={[
                  styles.selectorText,
                  { color: currentMerchant ? colors.text : colors.textSecondary }
                ]}>
                  {currentMerchant ? currentMerchant.name : 'Select Cable TV Provider'}
                </Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Customer Number Input */}
          <Input
            label="Customer Number / Smartcard Number"
            value={customerNumber}
            onChangeText={setCustomerNumber}
            placeholder="Enter your customer/smartcard number"
            keyboardType="default"
            returnKeyType="done"
          />

          {/* Service Package Selection */}
          {currentMerchant && (
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Select Package
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
                  <CreditCard size={20} color={colors.primary} />
                  <Text style={[
                    styles.selectorText,
                    { color: currentSelectedService ? colors.text : colors.textSecondary }
                  ]}>
                    {currentSelectedService 
                      ? `${currentSelectedService.name} - ₦${currentSelectedService.price.toLocaleString()}`
                      : 'Select Package'
                    }
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Custom Amount Input */}
          <Input
            label="Custom Amount (Optional)"
            value={customAmount}
            onChangeText={setCustomAmount}
            placeholder="Enter custom amount"
            keyboardType="numeric"
            returnKeyType="done"
          />

          {/* Payment Summary */}
          {(currentSelectedService || customAmount) && (
            <View style={styles.paymentSummary}>
              <View style={styles.calculationHeader}>
                <Calculator size={16} color={colors.primary} />
                <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                  Save {100 - chargeDiscount}% with CardKing
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Service Amount:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ₦{(currentSelectedService ? currentSelectedService.price : parseFloat(customAmount || '0')).toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.success }]}>
                  CardKing Discount ({100 - chargeDiscount}%):
                </Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -₦{((currentSelectedService ? currentSelectedService.price : parseFloat(customAmount || '0')) - calculatePaymentAmount(currentSelectedService ? currentSelectedService.price : parseFloat(customAmount || '0'))).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.summaryLabel, { color: colors.primary, fontFamily: 'Inter-Bold' }]}>
                  Total Payment:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary, fontFamily: 'Inter-Bold', fontSize: 18 }]}>
                  ₦{calculatePaymentAmount(currentSelectedService ? currentSelectedService.price : parseFloat(customAmount || '0')).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          <Button
            title={isLoadingAccountDetails ? 'Verifying Account...' : 'Verify & Pay'}
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
            <Tv size={24} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Cable TV Subscriptions
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Pay for DSTV, GOtv, and other cable TV services{'\n'}
            • Instant activation after successful payment{'\n'}
            • Support for all major Nigerian cable providers{'\n'}
            • Secure payment from your wallet balance{'\n'}
            • 24/7 customer support available
          </Text>
        </Card>
      </ScrollView>

      {/* Modals */}
      <MerchantSelectionModal
        visible={showMerchantModal}
        onClose={() => setShowMerchantModal(false)}
        merchants={cableTVMerchants}
        isLoadingMerchants={isLoadingMerchants}
        selectedMerchant={currentMerchant}
        onSelectMerchant={(merchant) => setSelectedMerchant(ServiceType.CABLE_TV, merchant)}
        title="Select Cable TV Provider"
        serviceIcon={<Tv size={20} color="#FFFFFF" />}
      />

      <ServiceSelectionModal
        visible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        services={currentServices}
        isLoadingServices={isLoadingServices}
        selectedService={currentSelectedService}
        onSelectService={(service) => currentMerchant && setSelectedService(currentMerchant.id.toString(), service)}
        title="Select Package"
        merchantName={currentMerchant?.name}
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
        title='Cable TV History'
        type='cable'
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />
    </SafeAreaWrapper>
  );
}

export default function CableTVScreen() {
  return (
    <AuthGuard>
      <CableTVScreenContent />
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

  // Info Card
  infoCard: {
    padding: Spacing.lg,
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
});