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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, TrendingUp, Eye, EyeOff, RefreshCw, Zap, Shield, Award, ChartBar as BarChart3 } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { selectedCountry } = useCountryStore();
  const { isAuthenticated, user } = useAuthStore();
  const { initData, isLoading: initLoading, initialize } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      const initializeApp = async () => {
        try {
          const userToken = isAuthenticated && user?.token ? user.token : undefined;
          if (!initData) {
            await initialize(userToken);
          }
        } catch (error) {
          console.error('Failed to initialize app:', error);
        }
      };
      initializeApp();
    }, [initialize, isAuthenticated, user?.token, initData])
  );

  const handleRefresh = async () => {
    try {
      const userToken = isAuthenticated && user?.token ? user.token : undefined;
      await initialize(userToken);
    } catch (error) {
      console.error('Failed to refresh app data:', error);
    }
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const formatBalance = (amount: string) => {
    if (!balanceVisible) return '****';
    return amount;
  };

  const quickActions = [
    {
      id: 'trade',
      title: 'Trade Now',
      subtitle: 'Start Trading',
      icon: <Zap size={24} color="#FFFFFF" />,
      gradient: [colors.primary, colors.accent],
      route: '/(tabs)/sell',
    },
    {
      id: 'rates',
      title: 'Live Rates',
      subtitle: 'Market Data',
      icon: <BarChart3 size={24} color="#FFFFFF" />,
      gradient: [colors.success, '#0891B2'],
      route: '/rates',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Insights',
      icon: <TrendingUp size={24} color="#FFFFFF" />,
      gradient: [colors.warning, '#EA580C'],
      route: '/calculator',
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Protection',
      icon: <Shield size={24} color="#FFFFFF" />,
      gradient: ['#059669', '#0891B2'],
      route: '/(tabs)/profile',
    },
  ];

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.appName}>TradePro</Text>
              {isAuthenticated && user && (
                <Text style={styles.userGreeting}>Hello, {user.username}</Text>
              )}
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRefresh}
                disabled={initLoading}
              >
                {initLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <RefreshCw size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/notifications')}
              >
                <Bell size={20} color="#FFFFFF" />
                {(initData?.notice_count || 0) > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>
                      {(initData?.notice_count || 0) > 99 ? '99+' : initData?.notice_count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Balance Card */}
        {isAuthenticated && user && (
          <View style={styles.balanceSection}>
            <LinearGradient
              colors={['#1E293B', '#334155']}
              style={styles.balanceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceHeader}>
                <View>
                  <Text style={styles.balanceLabel}>Portfolio Value</Text>
                  <Text style={styles.balanceAmount}>
                    {user.currency_symbol}{formatBalance(user.money)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={toggleBalanceVisibility}
                >
                  {balanceVisible ? (
                    <Eye size={24} color="#FFFFFF" />
                  ) : (
                    <EyeOff size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>Available</Text>
                  <Text style={styles.balanceItemValue}>
                    {user.currency_symbol}{formatBalance(user.money)}
                  </Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>Rewards</Text>
                  <Text style={styles.balanceItemValue}>
                    {user.currency_symbol}{formatBalance(user.rebate_money)}
                  </Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>VIP Level</Text>
                  <View style={styles.vipBadge}>
                    <Award size={12} color={colors.warning} />
                    <Text style={[styles.balanceItemValue, { color: colors.warning }]}>
                      {user.vip_level}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Trading Hub
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => router.push(action.route as any)}
              >
                <LinearGradient
                  colors={action.gradient as [string, string]}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.quickActionContent}>
                    <View style={styles.quickActionIcon}>
                      {action.icon}
                    </View>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Market Stats */}
        <View style={styles.marketStatsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Market Overview
          </Text>
          <View style={[styles.marketStatsCard, { backgroundColor: colors.card }]}>
            <View style={styles.marketStatItem}>
              <Text style={[styles.marketStatLabel, { color: colors.textSecondary }]}>
                Active Traders
              </Text>
              <Text style={[styles.marketStatValue, { color: colors.success }]}>
                12,847
              </Text>
            </View>
            <View style={styles.marketStatDivider} />
            <View style={styles.marketStatItem}>
              <Text style={[styles.marketStatLabel, { color: colors.textSecondary }]}>
                24h Volume
              </Text>
              <Text style={[styles.marketStatValue, { color: colors.primary }]}>
                $2.4M
              </Text>
            </View>
            <View style={styles.marketStatDivider} />
            <View style={styles.marketStatItem}>
              <Text style={[styles.marketStatLabel, { color: colors.textSecondary }]}>
                Success Rate
              </Text>
              <Text style={[styles.marketStatValue, { color: colors.warning }]}>
                99.2%
              </Text>
            </View>
          </View>
        </View>

        {/* Guest CTA */}
        {!isAuthenticated && (
          <View style={styles.guestSection}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.guestCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.guestTitle}>Start Your Trading Journey</Text>
              <Text style={styles.guestDescription}>
                Join thousands of traders and start earning with professional-grade tools
              </Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.guestButtonText}>Get Started</Text>
                <Zap size={20} color={colors.primary} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userGreeting: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  balanceSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
    marginBottom: Spacing.lg,
  },
  balanceCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickActionsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickActionItem: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    height: 120,
  },
  quickActionGradient: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  quickActionContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  quickActionIcon: {
    alignSelf: 'flex-start',
  },
  quickActionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  marketStatsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  marketStatsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  marketStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  marketStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  marketStatValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  marketStatDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: Spacing.md,
  },
  guestSection: {
    paddingHorizontal: Spacing.lg,
  },
  guestCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  guestDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  guestButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#7C3AED',
  },
});