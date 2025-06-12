import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  RefreshControl,
  ScrollView,
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

  useEffect(() => {
    if (user?.token) {
      fetchBalance(user.token);
      fetchTransactions(user.token, true);
    }
  }, [user?.token, fetchBalance, fetchTransactions]);

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

  const handleTransactionTypeChange = (
    type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip'
  ) => {
    setActiveTransactionType(type);
  };

  const handleLoadMore = useCallback(() => {
    if (user?.token) {
      loadMoreTransactions(user.token);
    }
  }, [user?.token, loadMoreTransactions]);

  const handleTransactionPress = (transaction: WalletTransaction) => {
    router.push(`/wallet/transaction/${transaction.log_id}` as any);
  };

  const handleRebatePress = () => {
    router.push('/wallet/rebate-details' as any);
  };

  const handleWithdraw = () => {
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
        </View>

        <View style={styles.card}>
          <WalletTabs
            activeWalletType={activeWalletType}
            onWalletTypeChange={handleWalletTypeChange}
          />
        </View>

        {balanceData && (
          <View style={styles.card}>
            <WalletBalanceCard
              balanceData={balanceData}
              balanceVisible={balanceVisible}
              onToggleVisibility={() => setBalanceVisible(!balanceVisible)}
              onRebatePress={handleRebatePress}
            />
          </View>
        )}

        {balanceError && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              ⚠️ {balanceError}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Button
            title="Withdraw"
            onPress={handleWithdraw}
            style={[styles.withdrawButton, { backgroundColor: colors.primary }]}
            fullWidth
          />
        </View>

        <View style={styles.card}>
          <TransactionFilters
            activeType={activeTransactionType}
            onTypeChange={handleTransactionTypeChange}
          />
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
          <Text style={[styles.transactionCount, { color: colors.textSecondary }]}>
            {transactions.length} transactions
          </Text>
        </View>
      </ScrollView>

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
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  withdrawButton: {
    height: 48,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
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
    paddingBottom: Spacing.lg,
  },
});
