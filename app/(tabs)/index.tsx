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
import { Bell, ChevronDown, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import PromoBanner from '@/components/home/PromoBanner';
import QuickActions from '@/components/home/QuickActions';
import RecentTransactions from '@/components/home/RecentTransactions';
import PromoTimer from '@/components/home/PromoTimer';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Country } from '@/types/api';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { countries, selectedCountry, setSelectedCountry } = useCountryStore();
  const { isAuthenticated, user } = useAuthStore();

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()} 👋
            </Text>
            
            {/* User Info Section */}
            <View style={styles.userInfoContainer}>
              {isAuthenticated && user ? (
                <View style={styles.userInfoRow}>
                  <View style={styles.userMainInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>
                      {user.username}
                    </Text>
                    <View style={styles.vipContainer}>
                      <Sparkles size={14} color={colors.secondary} />
                      <Text style={[styles.vipLevel, { color: colors.secondary }]}>
                        VIP Level {user.vip_level}
                      </Text>
                    </View>
                  </View>
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
                </View>
              ) : (
                <View style={styles.guestContainer}>
                  <Text style={[styles.guestTitle, { color: colors.text }]}>
                    Welcome to AfriTrade
                  </Text>
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
                    <ChevronDown size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

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

          {/* Enhanced Notification Button */}
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: `${colors.primary}15` }]}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={20} color={colors.primary} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Balance Card for Authenticated Users */}
        {isAuthenticated && user && (
          <View style={[
            styles.balanceCard,
            { 
              backgroundColor: colors.primary,
              shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
            }
          ]}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <TouchableOpacity style={styles.eyeButton}>
                <Text style={styles.eyeButtonText}>👁️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {user.currency_symbol}{user.money}
            </Text>
            <Text style={styles.rebateBalance}>
              Rebate: {user.currency_symbol}{user.rebate_money}
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
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
    position: 'relative',
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  userInfoContainer: {
    marginBottom: Spacing.sm,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userMainInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  vipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vipLevel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  guestContainer: {
    gap: Spacing.sm,
  },
  guestTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
    minWidth: 140,
  },
  countryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  countryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  countryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  countryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  countryDropdown: {
    position: 'absolute',
    top: 80,
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  balanceCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  eyeButton: {
    padding: 4,
  },
  eyeButtonText: {
    fontSize: 16,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  rebateBalance: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});