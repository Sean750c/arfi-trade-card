import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  ExternalLink, 
  Phone, 
  Wifi, 
  Smartphone,
  Globe,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useExploreStore } from '@/stores/useExploreStore';
import { formatDateString } from '@/utils/date';
import type { Activity, Supplier, DataBundle } from '@/types/explore';

function ExploreScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    activities,
    isLoadingActivities,
    activitiesError,
    suppliers,
    dataBundles,
    isLoadingSuppliers,
    isLoadingDataBundles,
    isRecharging,
    suppliersError,
    dataBundlesError,
    rechargeError,
    selectedSupplier,
    fetchActivities,
    fetchSuppliers,
    fetchDataBundles,
    airtimeRecharge,
    dataRecharge,
    setSelectedSupplier,
  } = useExploreStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'airtime' | 'data'>('airtime');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [selectedDataBundle, setSelectedDataBundle] = useState<DataBundle | null>(null);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showDataBundlePicker, setShowDataBundlePicker] = useState(false);

  // Predefined airtime amounts
  const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (user?.token) {
      fetchActivities(user.token, user.country_id);
      fetchSuppliers(user.token);
    }
  }, [user?.token, user?.country_id]);

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
      await Promise.all([
        fetchActivities(user.token, user.country_id),
        fetchSuppliers(user.token),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token, user?.country_id]);

  const handleActivityPress = async (activity: Activity) => {
    try {
      const supported = await Linking.canOpenURL(activity.active_url);
      if (supported) {
        await Linking.openURL(activity.active_url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open activity link');
    }
  };

  const validatePhoneNumber = (phone: string) => {
    // Nigerian phone number validation
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
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

    try {
      await airtimeRecharge(user.token, selectedSupplier.name, phoneNumber, amount);
      Alert.alert(
        'Success',
        `Airtime recharge of ₦${amount} to ${phoneNumber} was successful!`,
        [{ text: 'OK', onPress: () => {
          setPhoneNumber('');
          setAirtimeAmount('');
        }}]
      );
    } catch (error) {
      Alert.alert(
        'Recharge Failed',
        error instanceof Error ? error.message : 'Failed to recharge airtime'
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

    try {
      await dataRecharge(
        user.token,
        selectedSupplier.name,
        phoneNumber,
        selectedDataBundle.servicePrice,
        selectedDataBundle.serviceId
      );
      Alert.alert(
        'Success',
        `Data recharge of ${selectedDataBundle.serviceName} to ${phoneNumber} was successful!`,
        [{ text: 'OK', onPress: () => {
          setPhoneNumber('');
          setSelectedDataBundle(null);
        }}]
      );
    } catch (error) {
      Alert.alert(
        'Recharge Failed',
        error instanceof Error ? error.message : 'Failed to recharge data'
      );
    }
  };

  const renderActivityCard = (activity: Activity) => (
    <TouchableOpacity
      key={activity.id}
      style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleActivityPress(activity)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: activity.active_image }}
        style={styles.activityImage}
        resizeMode="cover"
      />
      <View style={styles.activityOverlay} />
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: '#FFFFFF' }]}>
          {activity.active_title}
        </Text>
        <Text style={[styles.activityMemo, { color: 'rgba(255, 255, 255, 0.9)' }]}>
          {activity.active_memo}
        </Text>
        <View style={styles.activityFooter}>
          <View style={styles.activityTime}>
            <Calendar size={14} color="rgba(255, 255, 255, 0.8)" />
            <Text style={[styles.activityTimeText, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              {formatDateString(activity.active_start_time)} - {formatDateString(activity.active_end_time)}
            </Text>
          </View>
          <View style={[styles.activityLink, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <ExternalLink size={12} color="#FFFFFF" />
            <Text style={styles.activityLinkText}>View</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSupplierOption = (supplier: Supplier) => (
    <TouchableOpacity
      key={supplier.mobileOperatorCode}
      style={[
        styles.supplierOption,
        {
          backgroundColor: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode 
            ? colors.primary 
            : colors.card,
          borderColor: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode 
            ? colors.primary 
            : colors.border,
        }
      ]}
      onPress={() => {
        setSelectedSupplier(supplier);
        setShowSupplierPicker(false);
        setSelectedDataBundle(null); // Reset data bundle selection
      }}
    >
      <Text style={[
        styles.supplierName,
        { 
          color: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode 
            ? '#FFFFFF' 
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
        styles.dataBundleOption,
        {
          backgroundColor: selectedDataBundle?.serviceId === bundle.serviceId 
            ? colors.primary 
            : colors.card,
          borderColor: selectedDataBundle?.serviceId === bundle.serviceId 
            ? colors.primary 
            : colors.border,
        }
      ]}
      onPress={() => {
        setSelectedDataBundle(bundle);
        setShowDataBundlePicker(false);
      }}
    >
      <Text style={[
        styles.dataBundleName,
        { 
          color: selectedDataBundle?.serviceId === bundle.serviceId 
            ? '#FFFFFF' 
            : colors.text 
        }
      ]}>
        {bundle.serviceName}
      </Text>
      <Text style={[
        styles.dataBundlePrice,
        { 
          color: selectedDataBundle?.serviceId === bundle.serviceId 
            ? 'rgba(255, 255, 255, 0.8)' 
            : colors.textSecondary 
        }
      ]}>
        ₦{bundle.servicePrice.toLocaleString()}
      </Text>
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
            <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Discover activities and services
            </Text>
          </View>
        </View>

        {/* Activities Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎉 Latest Activities
          </Text>
          
          {isLoadingActivities ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading activities...
              </Text>
            </View>
          ) : activitiesError ? (
            <Card style={styles.errorCard}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {activitiesError}
              </Text>
            </Card>
          ) : activities.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activitiesScroll}
            >
              {activities.map(renderActivityCard)}
            </ScrollView>
          ) : (
            <Card style={styles.emptyCard}>
              <Calendar size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No activities available at the moment
              </Text>
            </Card>
          )}
        </View>

        {/* Life Services Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📱 Life Services
          </Text>
          
          <Card style={styles.rechargeCard}>
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
                  styles.picker,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setShowSupplierPicker(!showSupplierPicker)}
              >
                <View style={styles.pickerContent}>
                  <Smartphone size={20} color={colors.primary} />
                  <Text style={[
                    styles.pickerText,
                    { color: selectedSupplier ? colors.text : colors.textSecondary }
                  ]}>
                    {selectedSupplier ? selectedSupplier.name : 'Select Network'}
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {showSupplierPicker && (
                <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {isLoadingSuppliers ? (
                    <View style={styles.pickerLoading}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    suppliers.map(renderSupplierOption)
                  )}
                </View>
              )}
            </View>

            {/* Phone Number Input */}
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="e.g., 08012345678"
              keyboardType="phone-pad"
              maxLength={11}
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
                />

                <Button
                  title={isRecharging ? 'Processing...' : 'Recharge Airtime'}
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
                      styles.picker,
                      { 
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setShowDataBundlePicker(!showDataBundlePicker)}
                    disabled={!selectedSupplier}
                  >
                    <View style={styles.pickerContent}>
                      <Globe size={20} color={colors.primary} />
                      <Text style={[
                        styles.pickerText,
                        { color: selectedDataBundle ? colors.text : colors.textSecondary }
                      ]}>
                        {selectedDataBundle 
                          ? `${selectedDataBundle.serviceName} - ₦${selectedDataBundle.servicePrice.toLocaleString()}`
                          : selectedSupplier 
                            ? 'Select Data Bundle'
                            : 'Select Network First'
                        }
                      </Text>
                    </View>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {showDataBundlePicker && selectedSupplier && (
                    <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {isLoadingDataBundles ? (
                        <View style={styles.pickerLoading}>
                          <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                      ) : dataBundles.length > 0 ? (
                        dataBundles.map(renderDataBundleOption)
                      ) : (
                        <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>
                          No data bundles available
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <Button
                  title={isRecharging ? 'Processing...' : 'Recharge Data'}
                  onPress={handleDataRecharge}
                  disabled={isRecharging || !selectedSupplier || !phoneNumber || !selectedDataBundle}
                  loading={isRecharging}
                  style={styles.rechargeButton}
                  fullWidth
                />
              </View>
            )}
          </Card>
        </View>

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
            • Secure payment processing{'\n'}
            • 24/7 customer support
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

export default function ExploreScreen() {
  return (
    <AuthGuard>
      <ExploreScreenContent />
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  
  // Activities
  activitiesScroll: {
    paddingRight: Spacing.lg,
  },
  activityCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    marginRight: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  activityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  activityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  activityContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  activityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  activityMemo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  activityTimeText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  activityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activityLinkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  // Recharge Services
  rechargeCard: {
    padding: Spacing.lg,
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
    position: 'relative',
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  pickerDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  pickerLoading: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyPickerText: {
    padding: Spacing.lg,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  supplierOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  supplierName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  dataBundleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dataBundleName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  dataBundlePrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
});