import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Wallet, 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Settings,
  DollarSign
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { WithdrawService } from '@/services/withdraw';
import { PaymentService } from '@/services/payment';
import type { WithdrawInformation, PaymentMethod } from '@/types';

function WithdrawScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();

  // State management
  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInformation | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Error states
  const [amountError, setAmountError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch withdrawal information on component mount
  useEffect(() => {
    if (user?.token) {
      fetchWithdrawInfo();
    }
  }, [user?.token]);

  const fetchWithdrawInfo = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const info = await WithdrawService.getWithdrawInformation({
        token: user.token,
        wallet_type: '1', // Default to NGN wallet
      });
      setWithdrawInfo(info);
    } catch (error) {
      console.error('Failed to fetch withdraw info:', error);
      Alert.alert('Error', 'Failed to load withdrawal information');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!user?.token) return;

    try {
      const methods = await PaymentService.getPaymentMethods({
        token: user.token,
        type: '1', // NGN payment methods
      });
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setAmountError('');
    setPasswordError('');

    // Validate amount
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      setAmountError('Please enter a valid amount');
      isValid = false;
    } else if (withdrawInfo && numAmount < withdrawInfo.minimum_amount) {
      setAmountError(`Minimum withdrawal amount is ${withdrawInfo.currency_name} ${withdrawInfo.minimum_amount}`);
      isValid = false;
    } else if (withdrawInfo && numAmount > withdrawInfo.cashable_amount) {
      setAmountError('Amount exceeds available balance');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleWithdraw = async () => {
    if (!validateForm() || !user?.token || !withdrawInfo?.bank) return;

    setSubmitting(true);
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
        `Your withdrawal request for ${withdrawInfo.currency_name} ${amount} has been submitted successfully.\n\nWithdrawal No: ${result.withdraw_no}\n\nProcessing time: ${withdrawInfo.timeout_desc}`,
        [
          { text: 'View History', onPress: () => router.push('/wallet') },
          { text: 'OK', style: 'default' },
        ]
      );

      // Reset form
      setAmount('');
      setPassword('');
      
      // Refresh withdrawal info
      fetchWithdrawInfo();
    } catch (error) {
      Alert.alert('Withdrawal Failed', error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPaymentMethod = () => {
    router.push('/profile/bank-accounts');
  };

  const handleViewAllMethods = async () => {
    await fetchPaymentMethods();
    setShowPaymentMethods(true);
  };

  const formatBalance = (amount: number) => {
    if (!balanceVisible) return '****';
    return amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading withdrawal information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            <Text style={[styles.title, { color: colors.text }]}>Withdraw Funds</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Transfer money to your bank account
            </Text>
          </View>
        </View>

        {/* Balance Card */}
        {withdrawInfo && (
          <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <View style={styles.balanceAmountContainer}>
                  <Text style={styles.balanceAmount}>
                    {withdrawInfo.currency_name} {formatBalance(withdrawInfo.cashable_amount)}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setBalanceVisible(!balanceVisible)}
                    style={styles.eyeButton}
                  >
                    {balanceVisible ? (
                      <Eye size={20} color="rgba(255, 255, 255, 0.8)" />
                    ) : (
                      <EyeOff size={20} color="rgba(255, 255, 255, 0.8)" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.walletIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Wallet size={24} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={styles.minimumAmount}>
              Minimum withdrawal: {withdrawInfo.currency_name} {withdrawInfo.minimum_amount}
            </Text>
          </Card>
        )}

        {/* Default Payment Method */}
        {withdrawInfo?.bank ? (
          <Card style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Withdrawal Method
              </Text>
              <TouchableOpacity 
                onPress={handleViewAllMethods}
                style={styles.manageButton}
              >
                <Settings size={16} color={colors.primary} />
                <Text style={[styles.manageButtonText, { color: colors.primary }]}>
                  Manage
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.defaultPaymentMethod, { backgroundColor: `${colors.primary}10` }]}>
              <View style={styles.bankInfo}>
                <View style={[styles.bankIcon, { backgroundColor: colors.primary }]}>
                  <CreditCard size={20} color="#FFFFFF" />
                </View>
                <View style={styles.bankDetails}>
                  <Text style={[styles.bankName, { color: colors.text }]}>
                    {withdrawInfo.bank.bank_name}
                  </Text>
                  <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
                    ****{withdrawInfo.bank.bank_account.slice(-4)}
                  </Text>
                </View>
              </View>
              <View style={[styles.defaultBadge, { backgroundColor: colors.success }]}>
                <CheckCircle size={12} color="#FFFFFF" />
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.noPaymentMethodCard}>
            <View style={styles.noPaymentMethodContent}>
              <View style={[styles.noPaymentIcon, { backgroundColor: `${colors.warning}20` }]}>
                <AlertCircle size={32} color={colors.warning} />
              </View>
              <Text style={[styles.noPaymentTitle, { color: colors.text }]}>
                No Payment Method
              </Text>
              <Text style={[styles.noPaymentMessage, { color: colors.textSecondary }]}>
                You need to add a bank account before you can withdraw funds
              </Text>
              <Button
                title="Add Bank Account"
                onPress={handleAddPaymentMethod}
                style={styles.addPaymentButton}
                rightIcon={<Plus size={20} color="#FFFFFF" />}
              />
            </View>
          </Card>
        )}

        {/* Withdrawal Form */}
        {withdrawInfo?.bank && (
          <Card style={styles.formCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Withdrawal Details
            </Text>
            
            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount to withdraw"
              keyboardType="numeric"
              error={amountError}
              rightElement={
                <Text style={[styles.currencyText, { color: colors.textSecondary }]}>
                  {withdrawInfo.currency_name}
                </Text>
              }
            />
            
            <Input
              label="Transaction Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your transaction password"
              secureTextEntry={!showPassword}
              error={passwordError}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            {/* Processing Info */}
            <View style={[styles.processingInfo, { backgroundColor: `${colors.primary}10` }]}>
              <AlertCircle size={16} color={colors.primary} />
              <Text style={[styles.processingText, { color: colors.text }]}>
                Processing time: {withdrawInfo.timeout_desc}
              </Text>
            </View>

            <Button
              title={submitting ? "Processing..." : "Withdraw Funds"}
              onPress={handleWithdraw}
              disabled={!amount || !password || submitting}
              loading={submitting}
              style={styles.withdrawButton}
              rightIcon={!submitting ? <DollarSign size={20} color="#FFFFFF" /> : undefined}
              fullWidth
            />
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: `${colors.primary}15` }]}
            onPress={() => router.push('/wallet')}
          >
            <Wallet size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.primary }]}>
              Transaction History
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: `${colors.secondary}15` }]}
            onPress={handleViewAllMethods}
          >
            <CreditCard size={20} color={colors.secondary} />
            <Text style={[styles.quickActionText, { color: colors.secondary }]}>
              Payment Methods
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Payment Methods Modal */}
      {showPaymentMethods && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Payment Methods
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentMethods(false)}>
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {paymentMethods.map((method) => (
                <View key={method.payment_id} style={styles.paymentMethodGroup}>
                  <Text style={[styles.paymentMethodName, { color: colors.text }]}>
                    {method.name}
                  </Text>
                  {method.data_list.map((account) => (
                    <TouchableOpacity
                      key={account.bank_id}
                      style={[
                        styles.paymentMethodItem,
                        { 
                          backgroundColor: account.is_def === 1 ? `${colors.primary}10` : 'transparent',
                          borderColor: colors.border,
                        }
                      ]}
                    >
                      <View style={styles.bankInfo}>
                        <View style={[styles.bankIcon, { backgroundColor: colors.primary }]}>
                          <CreditCard size={16} color="#FFFFFF" />
                        </View>
                        <View style={styles.bankDetails}>
                          <Text style={[styles.bankName, { color: colors.text }]}>
                            {account.bank_name}
                          </Text>
                          <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
                            {account.account_no}
                          </Text>
                        </View>
                      </View>
                      {account.is_def === 1 && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.success }]}>
                          <CheckCircle size={10} color="#FFFFFF" />
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              
              <Button
                title="Add New Payment Method"
                variant="outline"
                onPress={handleAddPaymentMethod}
                style={styles.addNewButton}
                rightIcon={<Plus size={20} color={colors.primary} />}
                fullWidth
              />
            </ScrollView>
          </View>
        </View>
      )}
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Header
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
    marginTop: Spacing.xs,
  },

  // Balance Card
  balanceCard: {
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimumAmount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.sm,
  },

  // Payment Method Card
  paymentMethodCard: {
    marginBottom: Spacing.lg,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  manageButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  defaultPaymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  accountNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },

  // No Payment Method
  noPaymentMethodCard: {
    marginBottom: Spacing.lg,
  },
  noPaymentMethodContent: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  noPaymentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  noPaymentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  noPaymentMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  addPaymentButton: {
    minWidth: 200,
  },

  // Form Card
  formCard: {
    marginBottom: Spacing.lg,
  },
  currencyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  processingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  processingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  withdrawButton: {
    height: 56,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  modalBody: {
    padding: Spacing.lg,
  },
  paymentMethodGroup: {
    marginBottom: Spacing.lg,
  },
  paymentMethodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  addNewButton: {
    marginTop: Spacing.md,
  },
});