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
import type { DataBundle } from '@/types/utilities';
import CustomerServiceButton from '@/components/UI/CustomerServiceButton';

interface PendingRechargeData {
  type: 'airtime' | 'data';
  supplier: string;
  phone: string;
  amount: number;
  paymentAmount: number;
  dataBundle?: DataBundle;
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
  // 获取当前选择供应商的折扣和费用
  const currentSupplierDiscount = selectedSupplier?.discount ?? 100; // 默认0折扣
  const currentSupplierFee = selectedSupplier?.fee ?? 0;
  // 计算实际折扣百分比
  const actualDiscountPercentage = 100 - currentSupplierDiscount;
  // 计算需要支付的金额
  const calculatePaymentAmount = (amount: number) => {
    const fee = Number(currentSupplierFee);
    const total = amount * (currentSupplierDiscount / 100) + fee;
    return Math.round(total * 100) / 100;
  };

  const calculateDiscountAmount = (amount: number) => {
    return Math.round(amount * (actualDiscountPercentage / 100) * 100) / 100;
  };

  useEffect(() => {
    if (user?.token) {
      fetchSuppliers(user.token);
      if (suppliers) {
        setSelectedSupplier(suppliers[0]);
      }
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
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (selectedSupplier && (amount < selectedSupplier.min || amount > selectedSupplier.max)) {
      Alert.alert('Error', `Amount must be between ₦${selectedSupplier.min} and ₦${selectedSupplier.max}`);
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
      phone: phoneNumber.trim(),
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

    if (selectedSupplier && (selectedDataBundle.servicePrice < selectedSupplier.min || selectedDataBundle.servicePrice > selectedSupplier.max)) {
      Alert.alert('Error', `Data bundle price must be between ₦${selectedSupplier.min} and ₦${selectedSupplier.max}`);
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
      phone: phoneNumber.trim(),
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
          pendingRechargeData.phone.trim(),
          pendingRechargeData.amount,
          paymentPassword
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
          pendingRechargeData.dataBundle!.serviceId,
          pendingRechargeData.dataBundle!.serviceName,
          paymentPassword
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
                  {selectedSupplier ? `${selectedSupplier.name} (${actualDiscountPercentage}% off)` : 'Select Network Provider'}
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

              {/* 折扣金额展示 */}
              {(airtimeAmount && selectedSupplier) && (
                <View style={styles.paymentSummary}>
                  {selectedSupplier && <View style={styles.calculationHeader}>
                    <Calculator size={16} color={colors.primary} />
                    <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                      Save {actualDiscountPercentage}% with CardKing
                    </Text>
                  </View>}
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Service Amount:
                    </Text>
                    <Text style={[styles.originalPrice, { color: colors.text }]}>
                      ₦{parseFloat(airtimeAmount).toLocaleString()}
                    </Text>
                  </View>
                  {selectedSupplier && <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.success }]}>
                      CardKing Discount ({actualDiscountPercentage}%):
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      -₦{(calculateDiscountAmount(parseFloat(airtimeAmount || '0'))).toLocaleString()}
                    </Text>
                  </View>
                  }
                  {currentSupplierFee > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Service Fee:
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        +₦{currentSupplierFee.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={[styles.summaryLabel, { color: colors.primary, fontFamily: 'Inter-Bold' }]}>
                      Total Payment:
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.primary, fontFamily: 'Inter-Bold', fontSize: 18 }]}>
                      ₦{calculatePaymentAmount(parseFloat(airtimeAmount || '0')).toLocaleString()}
                    </Text>
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
              {(selectedDataBundle && selectedSupplier) && (
                <View style={styles.paymentSummary}>
                  {selectedSupplier && <View style={styles.calculationHeader}>
                    <Calculator size={16} color={colors.primary} />
                    <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                      Save {actualDiscountPercentage}% with CardKing
                    </Text>
                  </View>}
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Service Amount:
                    </Text>
                    <Text style={[styles.originalPrice, { color: colors.text }]}>
                      ₦{selectedDataBundle.servicePrice.toLocaleString()}
                    </Text>
                  </View>
                  {selectedSupplier && <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.success }]}>
                      CardKing Discount ({actualDiscountPercentage}%):
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      -₦{(calculateDiscountAmount(selectedDataBundle.servicePrice)).toLocaleString()}
                    </Text>
                  </View>
                  }
                  {currentSupplierFee > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Service Fee:
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        +₦{currentSupplierFee.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={[styles.summaryLabel, { color: colors.primary, fontFamily: 'Inter-Bold' }]}>
                      Total Payment:
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.primary, fontFamily: 'Inter-Bold', fontSize: 18 }]}>
                      ₦{calculatePaymentAmount(selectedDataBundle.servicePrice).toLocaleString()}
                    </Text>
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
        chargeDiscount={actualDiscountPercentage}
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

      <CustomerServiceButton
        style={styles.customerServiceButton}
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
    gap: Spacing.xxs,
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
  calculationTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
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

  originalPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'line-through',
  },
  paymentSummary: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: Spacing.md,
    borderRadius: 12,
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
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
  customerServiceButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
});