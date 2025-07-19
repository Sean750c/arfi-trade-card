import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Lock,
  Zap
} from 'lucide-react-native';
import Header from '@/components/UI/Header';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import AuthGuard from '@/components/UI/AuthGuard';
import WithdrawCompensationModal from '@/components/wallet/WithdrawCompensationModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { WithdrawService } from '@/services/withdraw';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import type { WithdrawInformation } from '@/types/withdraw';

function WithdrawScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [walletType, setWalletType] = useState<'1' | '2'>('1');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInformation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompensationModal, setShowCompensationModal] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchWithdrawInfo();
    }
  }, [user?.token, walletType]);

  const fetchWithdrawInfo = async () => {
    if (!user?.token) return;
    
    setIsLoading(true);
    try {
      const info = await WithdrawService.getWithdrawInformation({
        token: user.token,
        wallet_type: walletType,
      });
      setWithdrawInfo(info);
    } catch (error) {
      Alert.alert('Error', 'Failed to load withdrawal information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user?.token || !withdrawInfo) return;

    const withdrawAmount = parseFloat(amount);
    const minAmount = walletType === '1' ? withdrawInfo.minimum_amount : withdrawInfo.minimum_amount_usd;

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount');
      return;
    }

    if (withdrawAmount < minAmount) {
      Alert.alert(
        'Minimum Amount Required',
        `Minimum withdrawal amount is ${walletType === '1' ? user.currency_symbol : 'USDT'}${minAmount}`
      );
      return;
    }

    if (withdrawAmount > withdrawInfo.cashable_amount) {
      Alert.alert(
        'Insufficient Balance',
        `Available balance: ${user.currency_symbol}${withdrawInfo.cashable_amount}`
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your trading password');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await WithdrawService.applyWithdraw({
        token: user.token,
        bank_id: withdrawInfo.bank.bank_id,
        amount: amount,
        password: password,
        channel_type: '1',
      });

      Alert.alert(
        'Withdrawal Submitted! 🎉',
        `Withdrawal request #${result.withdraw_no}\n\n` +
        `Amount: ${result.withdraw_amount}\n` +
        `Payment Method: ${result.bank_name}\n\n` +
        'Your withdrawal is being processed and will be completed within 24 hours.',
        [
          { text: 'View History', onPress: () => router.push('/wallet') },
          { text: 'OK', onPress: () => router.back() },
        ]
      );

      setAmount('');
      setPassword('');
    } catch (error) {
      Alert.alert(
        'Withdrawal Failed',
        error instanceof Error ? error.message : 'Failed to process withdrawal'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = walletType === '1' ? user?.currency_symbol || '₦' : 'USDT';
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <Header title="Withdraw Funds" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading withdrawal information...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Professional Header */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Secure Withdrawal</Text>
              <Text style={styles.headerSubtitle}>Fast • Secure • Reliable</Text>
            </View>

            <View style={styles.securityIcon}>
              <Shield size={24} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>

        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <Wallet size={24} color="#FFFFFF" />
              <Text style={styles.balanceTitle}>Available Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>
              {formatCurrency(withdrawInfo?.cashable_amount || 0)}
            </Text>
            <Text style={styles.balanceUSD}>
              ≈ ${withdrawInfo?.cashable_usd_amount || '0.00'} USD
            </Text>
          </LinearGradient>
        </View>

        {/* Wallet Type Selector */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Withdrawal Method</Text>
          </View>
          
          <View style={styles.walletTypeSelector}>
            <TouchableOpacity
              style={[
                styles.walletTypeButton,
                {
                  backgroundColor: walletType === '1' ? colors.primary : colors.background,
                  borderColor: walletType === '1' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setWalletType('1')}
            >
              <Text
                style={[
                  styles.walletTypeText,
                  { color: walletType === '1' ? '#FFFFFF' : colors.text },
                ]}
              >
                {user?.currency_name || 'Local Currency'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.walletTypeButton,
                {
                  backgroundColor: walletType === '2' ? colors.primary : colors.background,
                  borderColor: walletType === '2' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setWalletType('2')}
            >
              <Text
                style={[
                  styles.walletTypeText,
                  { color: walletType === '2' ? '#FFFFFF' : colors.text },
                ]}
              >
                USDT
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Method Info */}
          {withdrawInfo?.bank && (
            <View style={[styles.paymentMethodCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.paymentMethodHeader}>
                <Text style={[styles.paymentMethodTitle, { color: colors.text }]}>
                  Payment Method
                </Text>
                <TouchableOpacity
                  style={[styles.changeButton, { backgroundColor: `${colors.primary}15` }]}
                  onPress={() => router.push('/wallet/payment-list')}
                >
                  <Text style={[styles.changeButtonText, { color: colors.primary }]}>Change</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.paymentMethodDetails}>
                <Text style={[styles.bankName, { color: colors.text }]}>
                  {withdrawInfo.bank.bank_name}
                </Text>
                <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
                  ****{withdrawInfo.bank.bank_account.slice(-4)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Withdrawal Form */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Withdrawal Amount</Text>
          </View>

          <View style={styles.amountInputContainer}>
            <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
              {walletType === '1' ? user?.currency_symbol : 'USDT'}
            </Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.quickAmounts}>
            {['25%', '50%', '75%', '100%'].map((percentage) => (
              <TouchableOpacity
                key={percentage}
                style={[styles.quickAmountButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => {
                  const percent = parseInt(percentage) / 100;
                  const quickAmount = (withdrawInfo?.cashable_amount || 0) * percent;
                  setAmount(quickAmount.toFixed(2));
                }}
              >
                <Text style={[styles.quickAmountText, { color: colors.primary }]}>
                  {percentage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.limitInfo, { backgroundColor: colors.background }]}>
            <Text style={[styles.limitText, { color: colors.textSecondary }]}>
              Minimum: {formatCurrency(walletType === '1' ? withdrawInfo?.minimum_amount || 0 : withdrawInfo?.minimum_amount_usd || 0)}
            </Text>
            <Text style={[styles.limitText, { color: colors.textSecondary }]}>
              Available: {formatCurrency(withdrawInfo?.cashable_amount || 0)}
            </Text>
          </View>
        </View>

        {/* Security Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Security Verification</Text>
          </View>

          <Input
            label="Trading Password"
            placeholder="Enter your trading password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={styles.passwordInput}
          />

          <View style={[styles.securityInfo, { backgroundColor: `${colors.success}10` }]}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={[styles.securityText, { color: colors.success }]}>
              Your withdrawal is protected by bank-level security
            </Text>
          </View>
        </View>

        {/* Processing Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Processing Information</Text>
          </View>

          <View style={styles.processingDetails}>
            <View style={styles.processingItem}>
              <Zap size={16} color={colors.warning} />
              <Text style={[styles.processingText, { color: colors.text }]}>
                Processing Time: {withdrawInfo?.timeout_desc || '5-15 minutes'}
              </Text>
            </View>
            
            {withdrawInfo?.overdue_data && withdrawInfo.overdue_data.length > 0 && (
              <TouchableOpacity
                style={styles.compensationButton}
                onPress={() => setShowCompensationModal(true)}
              >
                <AlertTriangle size={16} color={colors.accent} />
                <Text style={[styles.compensationText, { color: colors.accent }]}>
                  View Compensation Rates
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <LinearGradient
            colors={amount && password && !isSubmitting ? [colors.primary, colors.accent] : [colors.border, colors.border]}
            style={styles.submitGradient}
          >
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleWithdraw}
              disabled={!amount || !password || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size={24} color="#FFFFFF" />
              ) : (
                <ArrowLeft size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
              )}
              <Text style={styles.submitText}>
                {isSubmitting ? 'Processing Withdrawal...' : 'Withdraw Funds'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Compensation Modal */}
      {withdrawInfo && (
        <WithdrawCompensationModal
          visible={showCompensationModal}
          onClose={() => setShowCompensationModal(false)}
          overdueData={withdrawInfo.overdue_data}
          maxPercent={withdrawInfo.overdue_max_percent}
        />
      )}
    </SafeAreaWrapper>
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
  scrollContent: {
    paddingBottom: Spacing.xxl,
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

  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  securityIcon: {
    marginLeft: Spacing.md,
  },

  // Balance Section
  balanceSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
    marginBottom: Spacing.lg,
  },
  balanceCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  balanceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceUSD: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Section Styles
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: Spacing.sm,
  },

  // Wallet Type Selector
  walletTypeSelector: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  walletTypeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  walletTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Payment Method
  paymentMethodCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  changeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  paymentMethodDetails: {
    gap: 2,
  },
  bankName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  accountNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // Amount Input
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  currencyLabel: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    borderBottomWidth: 2,
    paddingVertical: Spacing.sm,
    textAlign: 'right',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  limitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 8,
  },
  limitText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  // Security
  passwordInput: {
    marginBottom: Spacing.md,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Processing Info
  processingDetails: {
    gap: Spacing.md,
  },
  processingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  processingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  compensationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compensationText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textDecorationLine: 'underline',
  },

  // Submit Button
  submitSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  submitGradient: {
    borderRadius: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
});