import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronDown, Sparkles, Eye, EyeOff, RefreshCw, Ticket } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import PromoBanner from '@/components/home/PromoBanner';
import QuickActions from '@/components/home/QuickActions';
import PromoTimer from '@/components/home/PromoTimer';
import CustomerServiceButton from '@/components/UI/CustomerServiceButton';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { Country } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import AnnouncementBar from '@/components/home/AnnouncementBar';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { countries, selectedCountry, setSelectedCountry } = useCountryStore();
  const { isAuthenticated, user, reloadUser } = useAuthStore();
  const { initData, isLoading: initLoading, error: initError, initialize } = useAppStore();

  // 删除 useFocusEffect 里的自动 initialize 逻辑
  // 保留 handleRefresh 按钮和相关逻辑
  const handleRefresh = async () => {
    try {
      // Include user token if authenticated
      const userToken = isAuthenticated && user?.token ? user.token : undefined;
      await initialize(userToken);
      await reloadUser();
    } catch (error) {
      console.error('Failed to refresh app data:', error);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const formatBalance = (amount: string) => {
    if (!balanceVisible) {
      return '****';
    }
    return amount;
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Compact Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Country Display - Always on Left */}
            <View style={styles.locationContainer}>
              {(isAuthenticated && user) ? (
                <View style={[styles.countryDisplay, { backgroundColor: `${colors.primary}15` }]}>
                  <Image
                    source={{ uri: user.country_logo_image || '' }}
                    style={styles.flagImage}
                    resizeMode="cover"
                  />
                  <Text style={[styles.countryText, { color: colors.text }]}>
                    {user.country_name || ''}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.countrySelector, { backgroundColor: `${colors.primary}15` }]}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                >
                  <View style={styles.countryInfoContainer}>
                    <Image
                      source={{ uri: selectedCountry?.image || '' }}
                      style={styles.flagImage}
                      resizeMode="cover"
                    />
                    <Text style={[styles.countryText, { color: colors.text }]}>
                      {selectedCountry?.name || ''}
                    </Text>
                  </View>
                  <ChevronDown size={14} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>

            {/* Country Picker Dropdown */}
            {showCountryPicker && !isAuthenticated && (
              <View style={[
                styles.countryDropdown,
                { backgroundColor: colors.card, borderColor: colors.border, shadowColor: 'rgba(0, 0, 0, 0.1)' }
              ]}>
                <ScrollView
                  style={styles.countryScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {countries.map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.countryOption,
                        { borderBottomColor: colors.border },
                      ]}
                      onPress={() => handleCountrySelect(country)}
                    >
                      <View style={styles.countryInfoContainer}>
                        <Image
                          source={{ uri: country.image }}
                          style={styles.flagImage}
                          resizeMode="cover"
                        />
                        <Text style={[styles.countryOptionText, { color: colors.text }]}> {country.name} </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Header Actions */}
          <View style={styles.headerActions}>
            {/* Refresh Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={handleRefresh}
              disabled={initLoading}
            >
              {initLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <RefreshCw size={18} color={colors.primary} />
              )}
            </TouchableOpacity>

            {/* Notification Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={18} color={colors.primary} />
              {(initData?.notice_count || 0) > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.notificationCount}>
                    {(initData?.notice_count || 0) > 99 ? '99+' : initData?.notice_count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userInfoContainer}>
          {/* User Info - Compact/Guest Welcome 始终渲染 */}
          <View style={isAuthenticated && user ? styles.userInfoCompact : styles.guestWelcome}>
              {isAuthenticated && user ? (
                <>
                  <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
                  <View style={styles.rowStyle}>
                    <View style={styles.rowLeftStyle}>
                      <Text style={[styles.userName, { color: colors.text }]}> {user.username || ''} </Text>
                      <View style={styles.vipBadge}>
                        <Sparkles size={12} color={colors.primary} />
                        <Text style={[styles.rowText, { color: colors.primary }]}>VIP {user.vip_level || ''}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.rowRightStyle}
                      onPress={() => router.push('/profile/promo-codes')}
                    >
                      <Ticket size={12} color={colors.primary} />
                      <Text style={[styles.rowText, { color: colors.primary }]}>Coupon {user?.coupon_num ?? initData?.coupon_num ?? 0}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.guestTitle, { color: colors.text }]}>Welcome to CardKing</Text>
                  <View style={styles.rowStyle}>
                    <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>Trade gift cards at the best rates</Text>
                    <TouchableOpacity
                      style={styles.rowRightStyle}
                      onPress={() => router.push('/profile/promo-codes')}
                    >
                      <Ticket size={12} color={colors.primary} />
                      <Text style={[styles.rowText, { color: colors.primary }]}>Coupon {user?.coupon_num ?? 0}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
        </View>

        {/* Initialization Error */}
        {initError && (
          <View style={[styles.errorContainer, { backgroundColor: `${colors.error}10` }]}>
            <Text style={[styles.errorText, { color: colors.error }]}> {initError} </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={[styles.retryButton, { backgroundColor: colors.error }]}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Compact Balance Card for Authenticated Users，结构始终渲染 */}
        <View style={[
          styles.balanceCard,
          { backgroundColor: colors.primary, shadowColor: 'rgba(0, 0, 0, 0.1)' }
        ]}>
          <View style={styles.balanceHeader}>
            <TouchableOpacity
              style={styles.balanceInfo}
              onPress={() => router.push('/wallet')}
            >
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>
                {(user?.currency_symbol || '₦')}{formatBalance(balanceVisible && user ? user.money ?? '0' : '0')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={toggleBalanceVisibility}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {balanceVisible ? (
                <Eye size={20} color="rgba(255, 255, 255, 0.8)" />
              ) : (
                <EyeOff size={20} color="rgba(255, 255, 255, 0.8)" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.rebateHeader}>
            <Text style={styles.rebateBalance}>
              Rebate {(user?.currency_symbol || '₦')}{formatBalance(balanceVisible && user ? user.rebate_money ?? '0' : '0')}
            </Text>
            <Text style={styles.rebateBalance}>
              Points {(user?.point || '0')}
            </Text>
          </View>
        </View>

        {/* 公告栏、Banner、PromoBanner、QuickActions等始终渲染 */}
        <AnnouncementBar />
        <PromoBanner />
        <QuickActions />
        {/* <PromoTimer /> */}
        {/* <RecentTransactions /> */}
      </ScrollView>

      {/* Floating Customer Service Button */}
      <CustomerServiceButton
        style={styles.customerServiceButton}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    position: 'relative',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  locationContainer: {
    marginBottom: Spacing.sm,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minWidth: 120,
  },
  countryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  countryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  flagImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  countryText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  countryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  userInfoContainer: {
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  userInfoCompact: {
    gap: 2,
  },
  welcomeText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeftStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 135, 81, 0.1)',
    borderRadius: 4,
  },
  rowRightStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    marginLeft: Spacing.lg,
    backgroundColor: 'rgba(0, 135, 81, 0.1)',
    borderRadius: 4,
  },
  rowText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  guestWelcome: {
    gap: 2,
  },
  guestTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  guestSubtitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  countryDropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  countryScrollView: {
    maxHeight: 200,
  },
  countryOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter-Bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: Spacing.sm,
  },
  retryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  balanceCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xs,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  rebateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  eyeButton: {
    padding: Spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  rebateBalance: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  customerServiceButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
});