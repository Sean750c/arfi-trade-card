import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronDown, Sparkles, Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import PromoBanner from '@/components/home/PromoBanner';
import QuickActions from '@/components/home/QuickActions';
import RecentTransactions from '@/components/home/RecentTransactions';
import PromoTimer from '@/components/home/PromoTimer';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { Country } from '@/types/api';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { countries, selectedCountry, setSelectedCountry } = useCountryStore();
  const { isAuthenticated, user } = useAuthStore();
  const { initData } = useAppStore();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Compact Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Country Display - Always on Left */}
            <View style={styles.locationContainer}>
              {isAuthenticated && user ? (
                <View style={[styles.countryDisplay, { backgroundColor: `${colors.primary}15` }]}>
                  <Image 
                    source={{ uri: user.country_logo_image }} 
                    style={styles.flagImage} 
                    resizeMode="cover"
                  />
                  <Text style={[styles.countryText, { color: colors.text }]}>
                    {user.country_name}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.countrySelector, { backgroundColor: `${colors.primary}15` }]}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                >
                  <View style={styles.countryInfoContainer}>
                    <Image 
                      source={{ uri: selectedCountry?.image }} 
                      style={styles.flagImage} 
                      resizeMode="cover"
                    />
                    <Text style={[styles.countryText, { color: colors.text }]}>
                      {selectedCountry?.name}
                    </Text>
                  </View>
                  <ChevronDown size={14} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>

            {/* User Info - Compact */}
            {isAuthenticated && user && (
              <View style={styles.userInfoCompact}>
                <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                  Welcome back,
                </Text>
                <View style={styles.userNameRow}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {user.username}
                  </Text>
                  <View style={styles.vipBadge}>
                    <Sparkles size={12} color={colors.primary} />
                    <Text style={[styles.vipText, { color: colors.primary }]}>
                      VIP {user.vip_level}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Guest Welcome */}
            {!isAuthenticated && (
              <View style={styles.guestWelcome}>
                <Text style={[styles.guestTitle, { color: colors.text }]}>
                  Welcome to AfriTrade
                </Text>
                <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
                  Trade gift cards at the best rates
                </Text>
              </View>
            )}

            {/* Country Picker Dropdown */}
            {showCountryPicker && !isAuthenticated && (
              <View style={[
                styles.countryDropdown, 
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
                }
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
                        <Text style={[styles.countryOptionText, { color: colors.text }]}>
                          {country.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Notification Button */}
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: `${colors.primary}15` }]}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={20} color={colors.primary} />
            { (initData?.notice_count || 0) > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.notificationCount}>{initData?.notice_count}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Compact Balance Card for Authenticated Users */}
        {isAuthenticated && user && (
          <View style={[
            styles.balanceCard,
            { 
              backgroundColor: colors.primary,
              shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
            }
          ]}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>
                  {user.currency_symbol}{formatBalance(user.money)}
                </Text>
              </View>
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
            <Text style={styles.rebateBalance}>
              Rebate: {user.currency_symbol}{formatBalance(user.rebate_money)}
            </Text>
          </View>
        )}

        {/* Content Sections */}
        <PromoBanner />
        <QuickActions />
        <PromoTimer />
        <RecentTransactions />
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
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
  userInfoCompact: {
    gap: 2,
  },
  welcomeText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  userNameRow: {
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
  vipText: {
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
    fontSize: 13,
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
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter-Bold',
  },
  balanceCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
});