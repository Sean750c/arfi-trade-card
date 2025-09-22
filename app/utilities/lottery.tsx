import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Calculator } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { MerchantSelector } from '../../components/ui/MerchantSelector';
import { PaymentConfirmationModal } from '../../components/ui/PaymentConfirmationModal';
import { AccountDetailsModal } from '../../components/ui/AccountDetailsModal';
import { useAuth } from '../../contexts/AuthContext';
import { useMerchants } from '../../contexts/MerchantContext';
import { merchantPayment } from '../../services/api';
import { ServiceType } from '../../types/merchant';
import { styles } from './styles';

interface PendingPaymentData {
  type: string;
  merchant: string;
  customerNo: string;
  service: string;
  amount: number;
  paymentAmount: number;
  productCode?: string;
}

export const BettingUtility: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { merchants, selectedMerchant } = useMerchants();

  const [amount, setAmount] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [isLoadingAccountDetails, setIsLoadingAccountDetails] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<PendingPaymentData | null>(null);
  const [accountDetails, setAccountDetails] = useState<any>(null);

  // Get lottery merchants and current selected merchant
  const lotteryMerchants = merchants[ServiceType.LOTTERY] || [];
  const currentMerchant = selectedMerchant[ServiceType.LOTTERY];

  // 获取当前选择商户的折扣和费用
  const currentMerchantDiscount = currentMerchant?.discount ?? 100; // 默认100%支付
  const currentMerchantFee = currentMerchant?.fee ?? 0;
  // 计算实际折扣百分比
  const actualDiscountPercentage = 100 - currentMerchantDiscount;
  // 计算需要支付的金额
  const calculatePaymentAmount = (amount: number) => {
    return Math.round(amount * (currentMerchantDiscount / 100)) + currentMerchantFee;
  };

  useEffect(() => {
    // Reset form when merchant changes
    setAmount('');
    setCustomerNumber('');
    setAccountDetails(null);
  }, [currentMerchant]);

  const validateForm = () => {
    if (!currentMerchant) {
      Alert.alert('Error', 'Please select a betting platform');
      return false;
    }

    if (!customerNumber.trim() || customerNumber.trim().length < 5) { // 假设账号/用户名至少5位
      Alert.alert('Error', 'Please enter your account number/username');
      return false;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter the amount');
      return false;
    }

    const amountValue = parseFloat(amount);
    if (amountValue < 100 || amountValue > 1000000) {
      Alert.alert('Error', 'Amount must be between ₦100 and ₦1,000,000');
      return false; // 这里的验证逻辑应该使用 merchant.min 和 merchant.max
    }

    return true;
  };

  const isFormReadyForSubmission = useMemo(() => {
    if (!currentMerchant) return false;
    if (!customerNumber.trim()) return false;
    if (!amount.trim()) return false;
    return true;
  }, [currentMerchant, customerNumber, amount]);

  const isAmountValid = useMemo(() => {
    if (!currentMerchant || !amount.trim()) return false;
    return true;
  }, [currentMerchant, customerNumber, amount]);

  const handleVerifyAccount = async () => {
    if (!validateForm()) return;

    setIsLoadingAccountDetails(true);
    
    try {
      // For betting/lottery, we'll simulate account verification
      // In a real app, you might call an API to verify the account
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAccountDetails = {
        accountName: `User ${customerNumber}`,
        accountNumber: customerNumber,
        platform: currentMerchant?.name,
      };
      
      setAccountDetails(mockAccountDetails);
      setShowAccountModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify account. Please try again.');
    } finally {
      setIsLoadingAccountDetails(false);
    }
  };

  const handleProceedToPayment = () => {
    setShowAccountModal(false);
    
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
      Alert.alert('Insufficient Balance', 'You do not have enough balance to complete this transaction.');
      return;
    }

    setPendingPaymentData({
      type: 'lottery',
      merchant: currentMerchant.name,
      customerNo: customerNumber.trim(), // 确保传递的是trim后的值
      service: `Wallet Funding - ₦${amountValue}`,
      amount: amountValue,
      paymentAmount: paymentAmount,
      productCode: currentMerchant.product_code,
    });
    
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!pendingPaymentData || !user?.token || !currentMerchant) return;

    try {
      setShowConfirmModal(false);
      
      const productCode = pendingPaymentData.productCode || currentMerchant.product_code;
      
      if (!productCode) {
        Alert.alert('Error', 'Product code not found for this merchant');
        return;
      }

      await merchantPayment(
        user.token,
        currentMerchant.uuid,
        currentMerchant.name, // 确保传递的是trim后的值
        customerNumber.trim(),
        productCode,
        pendingPaymentData.amount,
        pendingPaymentData.paymentAmount
      );

      Alert.alert(
        'Success',
        'Your wallet funding request has been processed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setCustomerNumber('');
              setAccountDetails(null);
              setPendingPaymentData(null);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed. Please try again.');
    }
  };

  if (lotteryMerchants.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            No betting platforms available at the moment.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Fund Betting Wallet
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Add money to your betting platform account
            </Text>
          </View>

          {/* Merchant Selector */}
          <MerchantSelector
            merchants={lotteryMerchants}
            selectedMerchant={currentMerchant}
            serviceType={ServiceType.LOTTERY}
            placeholder="Select betting platform"
          />

          {/* Amount Input */}
          <Input
            label="Amount (₦)"
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Payment Summary */}
          {amount && (
            <View style={styles.paymentSummary}>
              {currentMerchant && <View style={styles.calculationHeader}>
                <Calculator size={16} color={colors.primary} />
                <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                  Save {actualDiscountPercentage}% with CardKing
                </Text>
              </View>}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Funding Amount:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ₦{parseFloat(amount || '0').toLocaleString()}
                </Text>
              </View>
              {currentMerchant && <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.success }]}>
                  CardKing Discount ({actualDiscountPercentage}%):
                </Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -₦{(parseFloat(amount || '0') - calculatePaymentAmount(parseFloat(amount || '0'))).toLocaleString()}
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
                  ₦{calculatePaymentAmount(parseFloat(amount || '0')).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
          {/* Account Number Input */}
          <Input
            label="Account Number / Username"
            value={customerNumber}
            onChangeText={setCustomerNumber}
            placeholder="Enter your account number or username"
            style={styles.input}
          />

          {/* Submit Button */}
          <Button
            title={isLoadingAccountDetails ? 'Verifying Account...' : 'Fund Wallet'}
            onPress={handleVerifyAccount}
            disabled={isLoadingAccountDetails || !isFormReadyForSubmission || !isAmountValid}
            loading={isLoadingAccountDetails}
            style={styles.payButton}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Account Details Modal */}
      <AccountDetailsModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onProceed={handleProceedToPayment}
        accountDetails={accountDetails}
        isLoading={false}
      />

      <PaymentConfirmationModal
        chargeDiscount={actualDiscountPercentage}
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        pendingPaymentData={pendingPaymentData}
        onConfirm={handleConfirmPayment}
      />
    </KeyboardAvoidingView>
  );
};