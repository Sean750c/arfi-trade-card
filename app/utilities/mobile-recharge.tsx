import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
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
  X,
  RotateCw,
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUtilitiesStore } from '@/stores/useUtilitiesStore';
import type { Supplier, DataBundle } from '@/types/utilities';

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

  // Predefined airtime amounts
  const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];

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
    const regex = /^(?:\+234|0)(7[0-9]|8[0-9]|9[0-1])[0-9]{7}$/;
    return regex.test(phone);
  };

  const validatePhoneNumber = (phone: string) => {
    // Nigerian phone number validation
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11 && isNigerianNumber(phone);
  };

  const handleAirtimeRecharge = async () => {
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

    if (amount > Number(user?.money ?? 0)) {
      Alert.alert('Error', 'Insufficient balance for this recharge');
      return;
    }

    try {
      await airtimeRecharge(user.token, selectedSupplier.name, phoneNumber, amount);
      Alert.alert(
        'Recharge Successful! 🎉',
        `Airtime recharge of ₦${amount.toLocaleString()} to ${phoneNumber} was successful!`,
        [{
          text: 'OK', onPress: () => {
            setPhoneNumber('');
            setAirtimeAmount('');
          }
        }]
      );
    } catch (error) {
      Alert.alert(
        'Recharge Failed',
        error instanceof Error ? error.message : 'Failed to recharge airtime. Please try again.'
      );
    }
  };

  const handleDataRecharge = async () => {
    if (!user?.token || !selectedSupplier || !selectedDataBundle) {
      Alert.alert('Error', 'Please select a network provider and data bundle');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Nigerian phone number');
      return;
    }

    const amount = selectedDataBundle.servicePrice;
    if (amount > Number(user?.money ?? 0)) {
      Alert.alert('Error', 'Insufficient balance for this recharge');
      return;
    }

    try {
      await dataRecharge(
        user.token,
        selectedSupplier.name,
        phoneNumber,
        selectedDataBundle.servicePrice,
        selectedDataBundle.serviceId
      );
      Alert.alert(
        'Recharge Successful! 🎉',
        `Data recharge of ${selectedDataBundle.serviceName} to ${phoneNumber} was successful!`,
        [{
          text: 'OK', onPress: () => {
            setPhoneNumber('');
            setSelectedDataBundle(null);
          }
        }]
      );
    } catch (error) {
      Alert.alert(
        'Recharge Failed',
        error instanceof Error ? error.message : 'Failed to recharge data. Please try again.'
      );
    }
  };

  const renderSupplierOption = (supplier: Supplier) => (
    <TouchableOpacity
      key={supplier.mobileOperatorCode}
      style={[
        styles.modalOption,
        {
          backgroundColor: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode
            ? `${colors.primary}15`
            : colors.card,
          borderColor: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode
            ? colors.primary
            : colors.border,
        }
      ]}
      onPress={() => {
        setSelectedSupplier(supplier);
        setShowSupplierModal(false);
        setSelectedDataBundle(null); // Reset data bundle selection
      }}
    >
      <Text style={[
        styles.modalOptionText,
        {
          color: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode
            ? colors.primary
            : colors.text
        }
      ]}>
        {supplier.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDataBundleOption = (bundle: DataBundle) => (
    <TouchableOpacity
      key={bundle.serviceId}
      style={[
        styles.modalOption,
        {
          backgroundColor: selectedDataBundle?.serviceId === bundle.serviceId
            ? `${colors.primary}15`
            : colors.card,
          borderColor: selectedDataBundle?.serviceId === bundle.serviceId
            ? colors.primary
            : colors.border,
        }
      ]}
      onPress={() => {
        setSelectedDataBundle(bundle);
        setShowDataBundleModal(false);
      }}
    >
      <View style={styles.dataBundleInfo}>
        <Text style={[
          styles.modalOptionText,
          {
            color: selectedDataBundle?.serviceId === bundle.serviceId
              ? colors.primary
              : colors.text
          }
        ]}>
          {bundle.serviceName}
        </Text>
        <Text style={[
          styles.dataBundlePrice,
          {
            color: selectedDataBundle?.serviceId === bundle.serviceId
              ? colors.primary
              : colors.textSecondary
          }
        ]}>
          ₦{bundle.servicePrice.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        </View>

        {/* Recharge Form */}
        <Card style={styles.rechargeCard}>
          {/* Service Tabs */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.balanceText}>
              Available Balance
            </Text>
            <Text style={styles.balanceText}>
              {user?.currency_symbol || '₦'}{Number(user?.money ?? 0).toLocaleString()}
            </Text>
          </View>
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
            onChangeText={setPhoneNumber}
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
                  <RotateCw size={20} color={colors.primary} onPress={() => setPhoneNumber(user?.phone)}/>
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

      {/* Network Provider Modal */}
      <Modal
        visible={showSupplierModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSupplierModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowSupplierModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Network Provider
              </Text>
              <TouchableOpacity onPress={() => setShowSupplierModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {isLoadingSuppliers ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading providers...
                  </Text>
                </View>
              ) : suppliers.length > 0 ? (
                suppliers.map(renderSupplierOption)
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No network providers available
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Data Bundle Modal */}
      <Modal
        visible={showDataBundleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDataBundleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowDataBundleModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Data Bundle
              </Text>
              <TouchableOpacity onPress={() => setShowDataBundleModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {isLoadingDataBundles ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading data bundles...
                  </Text>
                </View>
              ) : dataBundles.length > 0 ? (
                dataBundles.map(renderDataBundleOption)
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No data bundles available for {selectedSupplier?.name}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  // Recharge Card
  rechargeCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  rechargeButton: {
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  dataBundleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataBundlePrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  modalLoading: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  emptyText: {
    padding: Spacing.xl,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  useMyNumberButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
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
});