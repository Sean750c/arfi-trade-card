import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletTabs from '@/components/wallet/WalletTabs';
import TransactionFilters from '@/components/wallet/TransactionFilters';
import TransactionList from '@/components/wallet/TransactionList';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';
import type { WalletTransaction } from '@/types/api';

function WalletScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  
  const {
    balanceData,
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
  } = useWalletStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial data fetch
  useEffect(() => {
    if (user?.token) {
      fetchBalance(user.token);
      fetchTransactions(user.token, true);
    }
  }, [user?.token, fetchBalance, fetchTransactions]);

  // Refetch transactions when filters change
  useEffect(() => {
    if (user?.token) {
      fetchTransactions(user.token, true);
    }
  }, [activeWalletType, activeTransactionType, user?.token, fetchTransactions]);

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
  };

  const handleTransactionTypeChange = (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => {
    setActiveTransactionType(type);
  };

  const handleLoadMore = useCallback(() => {
    if (user?.token) {
      loadMoreTransactions(user.token);
    }
  }, [user?.token, loadMoreTransactions]);

  const handleTransactionPress = (transaction: WalletTransaction) => {
    // Navigate to transaction details page
    router.push(`/wallet/transaction/${transaction.log_id}` as any);
  };

  const handleRebatePress = () => {
    // Navigate to rebate details page
    router.push('/wallet/rebate-details' as any);
  };

  const handleWithdraw = () => {
    // Navigate to withdrawal page
    router.push('/wallet/withdraw' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
        </View>

        {/* Wallet Tabs */}
        <View style={styles.tabsSection}>
          <WalletTabs
            activeWalletType={activeWalletType}
            onWalletTypeChange={handleWalletTypeChange}
          />
        </View>

        {/* Balance Card */}
        {balanceData && (
          <View style={styles.balanceSection}>
            <WalletBalanceCard
              balanceData={balanceData}
              balanceVisible={balanceVisible}
              onToggleVisibility={() => setBalanceVisible(!balanceVisible)}
              onRebatePress={handleRebatePress}
            />
          </View>
        )}

        {/* Balance Error */}
        {balanceError && (
          <View style={[styles.errorContainer, { backgroundColor: `${colors.error}10` }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {balanceError}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsSection}>
          <Button
            title="Withdraw"
            onPress={handleWithdraw}
            style={styles.withdrawButton}
            fullWidth
          />
        </View>

        {/* Transaction Filters */}
        <View style={styles.filtersSection}>
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
      </ScrollView>

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
        />
      </View>
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
  scrollView: {
    flex: 0,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  tabsSection: {
    paddingHorizontal: Spacing.lg,
  },
  balanceSection: {
    paddingHorizontal: Spacing.lg,
  },
  errorContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  actionButtonsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  withdrawButton: {
    height: 48,
  },
  filtersSection: {
    paddingHorizontal: Spacing.lg,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  transactionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  transactionListContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
});