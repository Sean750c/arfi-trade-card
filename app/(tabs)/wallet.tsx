import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Eye, 
  EyeOff,
  Gift,
  TrendingUp,
  Clock,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  ArrowRight
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';

function WalletScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  const {
    walletBalance,
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    balanceError,
    transactionsError,
    fetchWalletBalance,
    fetchWalletTransactions,
    clearWalletData,
  } = useWalletStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeWalletType, setActiveWalletType] = useState<'1' | '2'>('1'); // 1: NGN, 2: USDT

  useEffect(() => {
    if (user?.token) {
      initializeWalletData();
    }
    
    return () => {
      clearWalletData();
    };
  }, [user?.token, activeWalletType]);

  const initializeWalletData = async () => {
    if (!user?.token) return;
    
    try {
      await Promise.all([
        fetchWalletBalance(user.token),
        fetchWalletTransactions({
          token: user.token,
          type: 'all',
          wallet_type: activeWalletType,
          page: 0,
          page_size: 10,
        })
      ]);
    } catch (error) {
      console.error('Failed to initialize wallet data:', error);
    }
  };

  const handleRefresh = async () => {
    if (!user?.token) return;
    
    setRefreshing(true);
    try {
      await initializeWalletData();
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatBalance = (amount: number | string) => {
    if (!balanceVisible) return '****';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Gift size={20} color={colors.success} />;
      case 'withdraw':
        return <ArrowUpRight size={20} color={colors.error} />;
      case 'transfer':
        return <ArrowDownLeft size={20} color={colors.primary} />;
      case 'recommend':
        return <Gift size={20} color={colors.warning} />;
      default:
        return <TrendingUp size={20} color={colors.textSecondary} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'order':
      case 'transfer':
      case 'recommend':
        return colors.success;
      case 'withdraw':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatTransactionAmount = (amount: number, type: string) => {
    const prefix = ['order', 'transfer', 'recommend', 'vip'].includes(type) ? '+' : '-';
    return `${prefix}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes}m ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days}d ago`;
    }
  };

  const renderTransaction = (transaction: any) => (
    <TouchableOpacity
      key={transaction.log_id}
      style={[
        styles.transactionItem,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
          borderBottomColor: colors.border,
        }
      ]}
      onPress={() => router.push(`/wallet/${transaction.log_id}` as any)}
    >
      <View style={[styles.transactionIcon, { backgroundColor: `${colors.primary}15` }]}>
        {getTransactionIcon(transaction.type)}
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionTitle, { color: colors.text }]}>
          {transaction.name || transaction.memo}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
          {formatDate(transaction.create_time)}
        </Text>
        {transaction.order_no && (
          <Text style={[styles.transactionOrderNo, { color: colors.textSecondary }]}>
            #{transaction.order_no.slice(-8)}
          </Text>
        )}
      </View>
      
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.transactionAmountText,
            { color: getTransactionColor(transaction.type) }
          ]}
        >
          {activeWalletType === '1' ? '₦' : 'USDT'}{formatTransactionAmount(transaction.amount, transaction.type)}
        </Text>
        <ArrowRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (isLoadingBalance && !walletBalance) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading wallet information...
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
          <Text style={[styles.title, { color: colors.text }]}>My Wallet</Text>
          <TouchableOpacity 
            onPress={() => setBalanceVisible(!balanceVisible)}
            style={[styles.eyeButton, { backgroundColor: `${colors.primary}15` }]}
          >
            {balanceVisible ? (
              <Eye size={20} color={colors.primary} />
            ) : (
              <EyeOff size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Wallet Type Selector */}
        <View style={styles.walletTypeSelector}>
          <TouchableOpacity
            style={[
              styles.walletTypeButton,
              {
                backgroundColor: activeWalletType === '1' ? colors.primary : 'transparent',
                borderColor: colors.primary,
              }
            ]}
            onPress={() => setActiveWalletType('1')}
          >
            <Text
              style={[
                styles.walletTypeText,
                { color: activeWalletType === '1' ? '#FFFFFF' : colors.primary }
              ]}
            >
              NGN Wallet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.walletTypeButton,
              {
                backgroundColor: activeWalletType === '2' ? colors.primary : 'transparent',
                borderColor: colors.primary,
              }
            ]}
            onPress={() => setActiveWalletType('2')}
          >
            <Text
              style={[
                styles.walletTypeText,
                { color: activeWalletType === '2' ? '#FFFFFF' : colors.primary }
              ]}
            >
              USDT Wallet
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          {/* Main Balance Card */}
          <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
            <View style={styles.balanceHeader}>
              <Wallet size={24} color="#FFFFFF" />
              <Text style={styles.balanceLabel}>
                {activeWalletType === '1' ? 'NGN Balance' : 'USDT Balance'}
              </Text>
            </View>
            <Text style={styles.balanceAmount}>
              {activeWalletType === '1' ? '₦' : 'USDT'}{formatBalance(
                activeWalletType === '1' 
                  ? walletBalance?.total_amount || 0
                  : walletBalance?.usd_amount || '0'
              )}
            </Text>
            <View style={styles.balanceFooter}>
              <Text style={styles.balanceFooterText}>
                Available: {activeWalletType === '1' ? '₦' : 'USDT'}{formatBalance(
                  activeWalletType === '1'
                    ? (walletBalance?.total_amount || 0) - (walletBalance?.frozen_amount || 0)
                    : parseFloat(walletBalance?.usd_amount || '0')
                )}
              </Text>
            </View>
          </Card>

          {/* Rebate Balance Card */}
          <TouchableOpacity 
            style={[styles.rebateCard, { backgroundColor: colors.success }]}
            onPress={() => router.push('/wallet/rebate')}
          >
            <View style={styles.rebateHeader}>
              <Gift size={20} color="#FFFFFF" />
              <Text style={styles.rebateLabel}>Rebate Balance</Text>
            </View>
            <Text style={styles.rebateAmount}>
              ₦{formatBalance(walletBalance?.rebate_amount || 0)}
            </Text>
            <View style={styles.rebateFooter}>
              <Text style={styles.rebateFooterText}>Tap to view details</Text>
              <ArrowRight size={16} color="rgba(255, 255, 255, 0.8)" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/wallet/withdraw')}
          >
            <ArrowUpRight size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
            onPress={() => router.push('/profile/bank-accounts')}
          >
            <Plus size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Add Account</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push('/wallet/transactions' as any)}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoadingTransactions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading transactions...
              </Text>
            </View>
          ) : transactionsError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {transactionsError}
              </Text>
              <TouchableOpacity 
                onPress={handleRefresh}
                style={[styles.retryButton, { backgroundColor: colors.error }]}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map(renderTransaction)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Wallet size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Transactions Yet
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                Your transaction history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Wallet Type Selector
  walletTypeSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  walletTypeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  walletTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  // Balance Section
  balanceSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  balanceCard: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.sm,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  balanceFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: Spacing.sm,
  },
  balanceFooterText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // Rebate Card
  rebateCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rebateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  rebateLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.xs,
  },
  rebateAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  rebateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rebateFooterText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },

  // Transactions Section
  transactionsSection: {
    marginBottom: Spacing.lg,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  transactionsList: {
    gap: Spacing.xs,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  transactionOrderNo: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transactionAmountText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
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
});