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
  Phone,
  Wifi,
  Smartphone,
  Globe,
  Zap,
  ChevronDown,
  History,
  RotateCw,
  Calculator,
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import SupplierSelectionModal from '@/components/utilities/SupplierSelectionModal';
import DataBundleSelectionModal from '@/components/utilities/DataBundleSelectionModal';
import RechargeConfirmationModal from '@/components/utilities/RechargeConfirmationModal';
import PaymentPasswordModal from '@/components/utilities/PaymentPasswordModal';
import RechargeLogsModal from '@/components/utilities/RechargeLogsModal';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUtilitiesStore } from '@/stores/useUtilitiesStore';
import type { Supplier, DataBundle } from '@/types/utilities';

interface PendingRechargeData {
  type: 'airtime' | 'data';
  supplier: string;
  phone: string;
  amount: number;
  paymentAmount: number;
  dataBundle?: {
    serviceName: string;
    servicePrice: number;
  };
}

function MobileRechargeScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    suppliers,
    dataBundles,
    isLoadingSuppliers,
    isLoadingDataBundles,
    isRecharging,
    selectedSupplier,
    fetchSuppliers,
    fetchDataBundles,
    airtimeRecharge,
    dataRecharge,
    setSelectedSupplier,
  } = useUtilitiesStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'airtime' | 'data'>('airtime');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [selectedDataBundle, setSelectedDataBundle] = useState<DataBundle | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showDataBundleModal, setShowDataBundleModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // 新增状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [paymentPassword, setPaymentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingRechargeData, setPendingRechargeData] = useState<PendingRechargeData | null>(null);

  // Predefined airtime amounts
  const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];

  // 计算需要支付的金额
  const calculatePaymentAmount = (amount: number) => {
    return Math.round(amount * 97) / 100;
  };

  useEffect(() => {
    if (user?.token) {
      fetchSuppliers(user.token);
    }
  }, [user?.token]);

  // Fetch data bundles when supplier is selected
  useEffect(() => {
    if (user?.token && selectedSupplier && activeTab === 'data') {
      fetchDataBundles(user.token, selectedSupplier.mobileOperatorCode);
    }
  }, [user?.token, selectedSupplier, activeTab]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;

    setRefreshing(true);
    try {
      await fetchSuppliers(user.token);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token]);

  const isNigerianNumber = (phone: string) => {
    const regex = /^(?:\+234|234|0)\d{10}$/;
    return regex.test(phone);
  };

  const validatePhoneNumber = (phone: string) => {
    let cleanPhone = phone.replace(/[^\d+]/g, '');
    if (/^\d{10}$/.test(cleanPhone)) {
      cleanPhone = '0' + cleanPhone;
    }
    return cleanPhone.length >= 10 && cleanPhone.length <= 11 && isNigerianNumber(cleanPhone);
  };

  const handleAirtimeRecharge = () => {
    if (!user?.token || !selectedSupplier) {
      Alert.alert('Error', 'Please select a network provider');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Nigerian phone number');
      return;
    }

    const amount = parseFloat(airtimeAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount < 100 || amount > 50000) {
      Alert.alert('Error', 'Amount must be between ₦100 and ₦50000');
      return;
    }

    const paymentAmount = calculatePaymentAmount(amount);
    if (paymentAmount > Number(user?.money ?? 0)) {
      Alert.alert('Error', 'Insufficient balance for this recharge');
      return;
    }

    setPendingRechargeData({
      type: 'airtime',
      supplier: selectedSupplier.name,
      phone: phoneNumber,
      amount: amount,
      paymentAmount: paymentAmount,
    });
    setShowConfirmModal(true);
  };

  const handleDataRecharge = () => {
    if (!user?.token || !selectedSupplier || !selectedDataBundle) {
      Alert.alert('Error', 'Please select a network provider and data bundle');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Nigerian phone number');
      return;
    }

    const amount = selectedDataBundle.servicePrice;
    const paymentAmount = calculatePaymentAmount(amount);
    if (paymentAmount > Number(user?.money ?? 0)) {
      Alert.alert('Error', 'Insufficient balance for this recharge');
      return;
    }

    setPendingRechargeData({
      type: 'data',
      supplier: selectedSupplier.name,
      phone: phoneNumber,
      amount: amount,
      paymentAmount: paymentAmount,
      dataBundle: selectedDataBundle,
    });
    setShowConfirmModal(true);
  };

  // 确认充值
  const handleConfirmRecharge = () => {
    setShowConfirmModal(false);
    // 添加小延迟确保第一个模态框完全关闭
    setTimeout(() => {
      setShowPasswordModal(true);
    }, 100);
  };

  // 执行充值
  const handleExecuteRecharge = async () => {
    if (!user?.token || !pendingRechargeData) return;

    if (!paymentPassword || paymentPassword.length !== 6) {
      setPasswordError('Please enter a valid 6-digit payment password');
      return;
    }

    try {
      if (pendingRechargeData.type === 'airtime') {
        await airtimeRecharge(
          user.token,
          pendingRechargeData.supplier,
          pendingRechargeData.phone,
          pendingRechargeData.amount
        );
        Alert.alert(
          'Recharge Successful! 🎉',
          `Airtime recharge of ₦${pendingRechargeData.amount.toLocaleString()} to ${pendingRechargeData.phone} was successful!\n\nPaid: ₦${pendingRechargeData.paymentAmount.toLocaleString()}`,
          [{
            text: 'OK', onPress: () => {
              setPhoneNumber('');
              setAirtimeAmount('');
              resetModals();
            }
          }]
        );
      } else {
        await dataRecharge(
          user.token,
          pendingRechargeData.supplier,
          pendingRechargeData.phone,
          pendingRechargeData.amount,
          pendingRechargeData.dataBundle!.serviceId
        );
        Alert.alert(
          'Recharge Successful! 🎉',
          `Data recharge of ${pendingRechargeData.dataBundle!.serviceName} to ${pendingRechargeData.phone} was successful!\n\nPaid: ₦${pendingRechargeData.paymentAmount.toLocaleString()}`,
          [{
            text: 'OK', onPress: () => {
              setPhoneNumber('');
              setSelectedDataBundle(null);
              resetModals();
            }
          }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Recharge Failed',
        error instanceof Error ? error.message : 'Failed to process recharge. Please try again.'
      );
    }
  };

  // 重置模态框状态
  const resetModals = () => {
    setShowConfirmModal(false);
    setShowPasswordModal(false);
    setPaymentPassword('');
    setPasswordError('');
    setPendingRechargeData(null);
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
            <Text style={[styles.title, { color: colors.text }]}>Mobile Recharge</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Airtime & data top-up services
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

        {/* Recharge Form */}
        <Card style={styles.rechargeCard}>
          {/* Balance Display */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.balanceText}>
              Available Balance
            </Text>
            <Text style={styles.balanceText}>
              {user?.currency_symbol || '₦'}{Number(user?.money ?? 0).toLocaleString()}
            </Text>
          </View>

          {/* Service Tabs */}
          <View style={styles.serviceTabs}>
            <TouchableOpacity
              style={[
                styles.serviceTab,
                {
                  backgroundColor: activeTab === 'airtime' ? colors.primary : 'transparent',
                  borderColor: colors.primary,
                }
              ]}
              onPress={() => setActiveTab('airtime')}
            >
              <Phone size={20} color={activeTab === 'airtime' ? '#FFFFFF' : colors.primary} />
              <Text style={[
                styles.serviceTabText,
                { color: activeTab === 'airtime' ? '#FFFFFF' : colors.primary }
              ]}>
                Airtime
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceTab,
                {
                  backgroundColor: activeTab === 'data' ? colors.primary : 'transparent',
                  borderColor: colors.primary,
                }
              ]}
              onPress={() => setActiveTab('data')}
            >
              <Wifi size={20} color={activeTab === 'data' ? '#FFFFFF' : colors.primary} />
              <Text style={[
                styles.serviceTabText,
                { color: activeTab === 'data' ? '#FFFFFF' : colors.primary }
              ]}>
                Data
              </Text>
            </TouchableOpacity>
          </View>

          {/* Network Provider Selection */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Network Provider
            </Text>
            <TouchableOpacity
              style={[
                styles.selector,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setShowSupplierModal(true)}
            >
              <View style={styles.selectorContent}>
                <Smartphone size={20} color={colors.primary} />
                <Text style={[
                  styles.selectorText,
                  { color: selectedSupplier ? colors.text : colors.textSecondary }
                ]}>
                  {selectedSupplier ? selectedSupplier.name : 'Select Network Provider'}
                </Text>
              </View>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Phone Number Input */}
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={text => setPhoneNumber(text)}
            placeholder="e.g., 08012345678"
            keyboardType="phone-pad"
            returnKeyType="done"
            maxLength={11}
            rightElement={
              user?.phone ? (
                <TouchableOpacity
                  style={[styles.useMyNumberButton]}
                  onPress={() => setPhoneNumber(user.phone)}
                >
                  <RotateCw size={20} color={colors.primary} />
                </TouchableOpacity>
              ) : null
            }
          />

          {/* Airtime Tab Content */}
          {activeTab === 'airtime' && (
            <View style={styles.tabContent}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Select Amount
              </Text>
              <View style={styles.amountGrid}>
                {airtimeAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountOption,
                      {
                        backgroundColor: airtimeAmount === amount.toString()
                          ? colors.primary
                          : colors.background,
                        borderColor: airtimeAmount === amount.toString()
                          ? colors.primary
                          : colors.border,
                      }
                    ]}
                    onPress={() => setAirtimeAmount(amount.toString())}
                  >
                    <Text style={[
                      styles.amountText,
                      {
                        color: airtimeAmount === amount.toString()
                          ? '#FFFFFF'
                          : colors.text
                      }
                    ]}>
                      ₦{amount.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Custom Amount"
                value={airtimeAmount}
                onChangeText={setAirtimeAmount}
                placeholder="Enter custom amount"
                keyboardType="numeric"
                returnKeyType="done"
              />

              {/* 动态计算支付金额 */}
              {airtimeAmount && parseFloat(airtimeAmount) > 0 && (
                <View style={[styles.calculationCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                  <View style={styles.calculationHeader}>
                    <Calculator size={16} color={colors.success} />
                    <Text style={[styles.calculationTitle, { color: colors.success }]}>
                      CardKing专属优惠 3% OFF
                    </Text>
                  </View>
                  <View style={styles.calculationDetails}>
                    <View style={styles.calculationRow}>
                      <Text style={[styles.calculationLabel, { color: colors.textSecondary }]}>
                        Recharge Amount:
                      </Text>
                      <Text style={[styles.calculationValue, { color: colors.text }]}>
                        ₦{parseFloat(airtimeAmount).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={[styles.calculationLabel, { color: colors.textSecondary }]}>
                        You Pay:
                      </Text>
                      <Text style={[styles.calculationValue, { color: colors.success, fontFamily: 'Inter-Bold' }]}>
                        ₦{calculatePaymentAmount(parseFloat(airtimeAmount)).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={[styles.calculationLabel, { color: colors.textSecondary }]}>
                        You Save:
                      </Text>
                      <Text style={[styles.calculationValue, { color: colors.success, fontFamily: 'Inter-Bold' }]}>
                        ₦{(parseFloat(airtimeAmount) - calculatePaymentAmount(parseFloat(airtimeAmount))).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <Button
                title={isRecharging ? 'Processing Recharge...' : 'Recharge Airtime'}
                onPress={handleAirtimeRecharge}
                disabled={isRecharging || !selectedSupplier || !phoneNumber || !airtimeAmount}
                loading={isRecharging}
                style={styles.rechargeButton}
                fullWidth
              />
            </View>
          )}

          {/* Data Tab Content */}
          {activeTab === 'data' && (
            <View style={styles.tabContent}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Data Bundle
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selector,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setShowDataBundleModal(true)}
                  disabled={!selectedSupplier}
                >
                  <View style={styles.selectorContent}>
                    <Globe size={20} color={colors.primary} />
                    <Text style={[
                      styles.selectorText,
                      { color: selectedDataBundle ? colors.text : colors.textSecondary }
                    ]}>
                      {selectedDataBundle
                        ? `${selectedDataBundle.serviceName} - ₦${selectedDataBundle.servicePrice.toLocaleString()}`
                        : selectedSupplier
                          ? 'Select Data Bundle'
                          : 'Select Network Provider First'
                      }
                    </Text>
                  </View>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* 动态计算支付金额 */}
              {selectedDataBundle && (
                <View style={[styles.calculationCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                  <View style={styles.calculationHeader}>
                    <Calculator size={16} color={colors.success} />
                    <Text style={[styles.calculationTitle, { color: colors.success }]}>
                      CardKing专属优惠 3% OFF
                    </Text>
                  </View>
                  <View style={styles.calculationDetails}>
                    <View style={styles.calculationRow}>
                      <Text style={[styles.calculationLabel, { color: colors.textSecondary }]}>
                        Data Bundle:
                      </Text>
                      <Text style={[styles.calculationValue, { color: colors.text }]}>
                        ₦{selectedDataBundle.servicePrice.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={[styles.calculationLabel, { color: colors.textSecondary }]}>
                        You Pay:
                      </Text>
                      <Text style={[styles.calculationValue, { color: colors.success, fontFamily: 'Inter-Bold' }]}>
                        ₦{calculatePaymentAmount(selectedDataBundle.servicePrice).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={[styles.calculationLabel, { color: colors.textSecondary }]}>
                        You Save:
                      </Text>
                      <Text style={[styles.calculationValue, { color: colors.success, fontFamily: 'Inter-Bold' }]}>
                        ₦{(selectedDataBundle.servicePrice - calculatePaymentAmount(selectedDataBundle.servicePrice)).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <Button
                title={isRecharging ? 'Processing Recharge...' : 'Recharge Data'}
                onPress={handleDataRecharge}
                disabled={isRecharging || !selectedSupplier || !phoneNumber || !selectedDataBundle}
                loading={isRecharging}
                style={styles.rechargeButton}
                fullWidth
              />
            </View>
          )}
        </Card>

        {/* Info Section */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Zap size={24} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Quick & Secure Recharge
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Instant airtime and data top-up{'\n'}
            • Support for all major Nigerian networks{'\n'}
            • Secure payment from your wallet balance{'\n'}
            • 24/7 customer support available
          </Text>
        </Card>
      </ScrollView>

      {/* Modals */}
      <SupplierSelectionModal
        visible={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        suppliers={suppliers}
        isLoadingSuppliers={isLoadingSuppliers}
        selectedSupplier={selectedSupplier}
        onSelectSupplier={(supplier) => {
          setSelectedSupplier(supplier);
          setSelectedDataBundle(null); // Reset data bundle selection
        }}
      />

      <DataBundleSelectionModal
        visible={showDataBundleModal}
        onClose={() => setShowDataBundleModal(false)}
        dataBundles={dataBundles}
        isLoadingDataBundles={isLoadingDataBundles}
        selectedDataBundle={selectedDataBundle}
        onSelectDataBundle={setSelectedDataBundle}
        selectedSupplierName={selectedSupplier?.name}
      />

      <RechargeConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        pendingRechargeData={pendingRechargeData}
        onConfirm={handleConfirmRecharge}
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
        onExecuteRecharge={handleExecuteRecharge}
        isRecharging={isRecharging}
        pendingRechargeData={pendingRechargeData}
      />

      <RechargeLogsModal
        title='Mobile Recharge History'
        type='phone'
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />
    </SafeAreaWrapper>
  );
}

export default function MobileRechargeScreen() {
  return (
    <AuthGuard>
      <MobileRechargeScreenContent />
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

  // Recharge Card
  rechargeCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  serviceTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  serviceTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  serviceTabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
  tabContent: {
    gap: Spacing.md,
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
  calculationCard: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
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
  calculationDetails: {
    gap: Spacing.xs,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  calculationValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  rechargeButton: {
    height: 48,
    marginTop: Spacing.md,
  },
  useMyNumberButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
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