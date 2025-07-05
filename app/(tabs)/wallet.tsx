import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletTabs from '@/components/wallet/WalletTabs';
import TransactionFilters from '@/components/wallet/TransactionFilters';
import TransactionList from '@/components/wallet/TransactionList';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';
import type { WalletTransaction } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

function WalletScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const {
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    isLoadingMore,
    balanceError,
    transactionsError,
    activeWalletType,
    activeTransactionType,
    fetchBalance,
    fetchTransactions,
    loadMoreTransactions,
    setActiveWalletType,
    setActiveTransactionType,
    setSelectedWithdrawAccount,
    getCurrentBalanceData,
  } = useWalletStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Get current balance data
  const balanceData = getCurrentBalanceData();

  // 优化：只在必要时刷新数据，避免频繁 API 调用
  useFocusEffect(
    useCallback(() => {
      if (user?.token) {
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime;
        
        // 如果距离上次刷新超过 30 秒，才重新获取数据
        if (timeSinceLastRefresh > 30000) {
          fetchBalance(user.token);
          fetchTransactions(user.token, true);
          setLastRefreshTime(now);
        }
      }
    }, [user?.token, fetchBalance, fetchTransactions, lastRefreshTime])
  );

  // 当钱包类型或交易类型改变时重新获取交易数据
  useFocusEffect(
    useCallback(() => {
      if (user?.token) {
        fetchTransactions(user.token, false);
      }
    }, [user?.token, activeWalletType, activeTransactionType, fetchTransactions])
  );

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;

    setRefreshing(true);
    try {
      await Promise.all([
        fetchBalance(user.token),
        fetchTransactions(user.token, true),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token, fetchBalance, fetchTransactions]);

  const handleWalletTypeChange = (type: '1' | '2') => {
    setActiveWalletType(type);
    setSelectedWithdrawAccount(null);
  };

  const handleTransactionTypeChange = (
    type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip'
  ) => {
    setActiveTransactionType(type);
  };

  const handleLoadMore = () => {
    if (!user?.token) return;
    loadMoreTransactions(user.token);
  };

  const handleWithdraw = () => {
    router.push('/wallet/withdraw');
  };

  const handleTransactionPress = (transaction: WalletTransaction) => {
    if (transaction.type === 'order') {
      router.push(`/orders/${transaction.order_no}`);
    }
  };

  const handleRebatePress = () => {
    // router.push('/wallet/rebate' as any);
    router.push({
      pathname: '/wallet/rebate',
      params: { walletType: activeWalletType },
    });
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      {/* Enhanced Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        }
      ]}>
        <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
      </View>

      {/* Wallet Tabs */}
      <View style={styles.tabsContainer}>
        <WalletTabs
          countryCurrencyName={user?.currency_name || 'NGN'}
          countryCurrencySymbol={user?.currency_symbol || '₦'}
          activeWalletType={activeWalletType}
          onWalletTypeChange={handleWalletTypeChange}
        />
      </View>
      {/* Balance Card */}
      {balanceData && (
        <View style={styles.balanceContainer}>
          <WalletBalanceCard
            balanceData={balanceData}
            balanceVisible={balanceVisible}
            onToggleVisibility={() => setBalanceVisible(!balanceVisible)}
            onRebatePress={handleRebatePress}
            walletType={activeWalletType}
          />
        </View>
      )}

      {/* Balance Error */}
      {balanceError && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            ⚠️ {balanceError}
          </Text>
        </View>
      )}

      {/* Withdraw Button */}
      <View style={styles.actionContainer}>
        <Button
          title="Withdraw Funds"
          onPress={handleWithdraw}
          style={styles.withdrawButton}
          fullWidth
        />
      </View>

      {/* Transaction Filters */}
      <View style={styles.filtersContainer}>
        <TransactionFilters
          activeType={activeTransactionType}
          onTypeChange={handleTransactionTypeChange}
        />
      </View>

      {/* Transactions Header */}
      <View style={styles.transactionsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Transaction History
        </Text>
        <Text style={[styles.transactionCount, { color: colors.textSecondary }]}>
          {transactions.length} transactions
        </Text>
      </View>
      {/* Transaction List */}
      <View style={styles.transactionListContainer}>
        <TransactionList
          transactions={transactions}
          isLoading={isLoadingTransactions}
          isLoadingMore={isLoadingMore}
          error={transactionsError}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
          onTransactionPress={handleTransactionPress}
          walletType={activeWalletType}
        />
      </View>
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxs,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  balanceContainer: {
    paddingHorizontal: Spacing.lg,
  },
  errorContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  withdrawButton: {
    height: 52,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  transactionListContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
});