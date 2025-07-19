import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CreditCard, 
  TrendingUp,
  Wallet as WalletIcon,
  Shield,
  Star,
  Gift,
  Zap
} from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletTabs from '@/components/wallet/WalletTabs';
import TransactionList from '@/components/wallet/TransactionList';
import TransactionFilters from '@/components/wallet/TransactionFilters';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

const { width } = Dimensions.get('window');

function WalletScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    walletBalance,
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    isLoadingMore,
    balanceError,
    transactionsError,
    activeWalletType,
    activeTransactionType,
    fetchWalletBalance,
    fetchTransactions,
    loadMoreTransactions,
    setActiveWalletType,
    setActiveTransactionType,
  } = useWalletStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.token) {
        fetchWalletBalance(user.token);
        fetchTransactions(user.token, true);
      }
    }, [user?.token, activeWalletType, activeTransactionType])
  );

  const handleRefresh = async () => {
    if (!user?.token) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        fetchWalletBalance(user.token),
        fetchTransactions(user.token, true)
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (user?.token) {
      loadMoreTransactions(user.token);
    }
  };

  const formatBalance = (amount: number) => {
    if (!balanceVisible) return '****';
    return amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const quickActions = [
    {
      id: 'withdraw',
      title: 'Withdraw',
      subtitle: 'Cash out',
      icon: <ArrowUpRight size={24} color="#FFFFFF" />,
      gradient: [colors.success, '#0891B2'],
      route: '/wallet/withdraw',
    },
    {
      id: 'trade',
      title: 'Trade',
      subtitle: 'Start trading',
      icon: <Zap size={24} color="#FFFFFF" />,
      gradient: [colors.primary, colors.accent],
      route: '/(tabs)/sell',
    },
    {
      id: 'rebate',
      title: 'Rewards',
      subtitle: 'View earnings',
      icon: <Gift size={24} color="#FFFFFF" />,
      gradient: [colors.warning, '#EA580C'],
      route: '/wallet/rebate',
    },
    {
      id: 'payment',
      title: 'Payment',
      subtitle: 'Manage methods',
      icon: <CreditCard size={24} color="#FFFFFF" />,
      gradient: ['#8B5CF6', '#EC4899'],
      route: '/wallet/payment-list',
    },
  ];

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Professional Header */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Portfolio Manager</Text>
              <Text style={styles.headerSubtitle}>Professional Trading Wallet</Text>
            </View>
            
            <TouchableOpacity
              style={styles.visibilityButton}
              onPress={() => setBalanceVisible(!balanceVisible)}
            >
              {balanceVisible ? (
                <Eye size={24} color="#FFFFFF" />
              ) : (
                <EyeOff size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Enhanced Balance Card */}
        <View style={styles.balanceSection}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoadingBalance ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading portfolio...</Text>
              </View>
            ) : balanceError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{balanceError}</Text>
              </View>
            ) : (
              <>
                <View style={styles.balanceHeader}>
                  <View>
                    <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
                    <Text style={styles.balanceAmount}>
                      {user?.currency_symbol}{formatBalance(walletBalance?.total_amount || 0)}
                    </Text>
                    <Text style={styles.balanceUSD}>
                      ≈ ${walletBalance?.usd_amount || '0.00'} USD
                    </Text>
                  </View>
                  <View style={[styles.portfolioBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <TrendingUp size={20} color="#10B981" />
                    <Text style={styles.portfolioGrowth}>+12.5%</Text>
                  </View>
                </View>

                <View style={styles.balanceDetails}>
                  <View style={styles.balanceItem}>
                    <WalletIcon size={16} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.balanceItemLabel}>Available</Text>
                    <Text style={styles.balanceItemValue}>
                      {user?.currency_symbol}{formatBalance((walletBalance?.total_amount || 0) - (walletBalance?.frozen_amount || 0))}
                    </Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Shield size={16} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.balanceItemLabel}>Frozen</Text>
                    <Text style={styles.balanceItemValue}>
                      {user?.currency_symbol}{formatBalance(walletBalance?.frozen_amount || 0)}
                    </Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Star size={16} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.balanceItemLabel}>Rewards</Text>
                    <Text style={styles.balanceItemValue}>
                      {user?.currency_symbol}{formatBalance(walletBalance?.rebate_amount || 0)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </LinearGradient>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
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

        {/* Wallet Type Selector */}
        <View style={styles.walletTypeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Wallet Type
          </Text>
          <View style={styles.walletTypeSelector}>
            <TouchableOpacity
              style={[
                styles.walletTypeButton,
                {
                  backgroundColor: activeWalletType === '1' ? colors.primary : colors.card,
                  borderColor: activeWalletType === '1' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveWalletType('1')}
            >
              <Text
                style={[
                  styles.walletTypeText,
                  {
                    color: activeWalletType === '1' ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {user?.currency_name || 'Local'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.walletTypeButton,
                {
                  backgroundColor: activeWalletType === '2' ? colors.primary : colors.card,
                  borderColor: activeWalletType === '2' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveWalletType('2')}
            >
              <Text
                style={[
                  styles.walletTypeText,
                  {
                    color: activeWalletType === '2' ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                USDT
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Filters */}
        <TransactionFilters
          activeType={activeTransactionType}
          onTypeChange={setActiveTransactionType}
        />

        {/* Transaction List */}
        <View style={[styles.transactionsSection, { backgroundColor: colors.card }]}>
          <View style={styles.transactionsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => router.push('/wallet/transactions')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <TransactionList
            transactions={transactions}
            isLoading={isLoadingTransactions}
            isLoadingMore={isLoadingMore}
            error={transactionsError}
            onLoadMore={handleLoadMore}
            onRefresh={() => user?.token && fetchTransactions(user.token, true)}
            onTransactionPress={() => {}}         // 添加这一行
            walletType={activeWalletType}     
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

export default function WalletScreen() {
  return (
    <AuthGuard>
      <WalletScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  visibilityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Balance Section
  balanceSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
    marginBottom: Spacing.lg,
  },
  balanceCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceUSD: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  portfolioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  portfolioGrowth: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
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
    borderRadius: 20,
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  quickActionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Wallet Type Selector
  walletTypeSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  walletTypeSelector: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  walletTypeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  walletTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Transactions Section
  transactionsSection: {
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  viewAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});