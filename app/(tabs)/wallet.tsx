import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { CircleAlert as AlertCircle } from 'lucide-react-native';
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
  const [fadeAnim] = useState(new Animated.Value(0));

  // Initialize data on component mount
  useEffect(() => {
    if (user?.token) {
      fetchBalance(user.token);
      fetchTransactions(user.token, true);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [user?.token, fetchBalance, fetchTransactions, fadeAnim]);

  // Refetch transactions when wallet type or transaction type changes
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

  const handleWalletTypeChange = useCallback((type: '1' | '2') => {
    // Add visual feedback for wallet switching
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveWalletType(type);
  }, [setActiveWalletType, fadeAnim]);

  const handleTransactionTypeChange = useCallback((
    type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip'
  ) => {
    setActiveTransactionType(type);
  }, [setActiveTransactionType]);

  const handleLoadMore = useCallback(() => {
    if (user?.token) {
      loadMoreTransactions(user.token);
    }
  }, [user?.token, loadMoreTransactions]);

  const handleTransactionPress = useCallback((transaction: WalletTransaction) => {
    router.push(`/wallet/transaction/${transaction.log_id}` as any);
  }, []);

  const handleRebatePress = useCallback(() => {
    router.push('/wallet/rebate-details' as any);
  }, []);

  const handleWithdraw = useCallback(() => {
    router.push('/wallet/withdraw' as any);
  }, []);

  // Loading state for initial load
  if (isLoadingBalance && !balanceData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading wallet data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
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
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Manage your funds and transactions
            </Text>
          </View>

          {/* Wallet Type Tabs */}
          <View style={styles.section}>
            <WalletTabs
              activeWalletType={activeWalletType}
              onWalletTypeChange={handleWalletTypeChange}
            />
          </View>

          {/* Balance Card */}
          {balanceData && (
            <View style={styles.section}>
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
              <AlertCircle size={20} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {balanceError}
              </Text>
            </View>
          )}

          {/* Withdraw Button */}
          <View style={styles.section}>
            <Button
              title="Withdraw Funds"
              onPress={handleWithdraw}
              style={[styles.withdrawButton, { backgroundColor: colors.primary }]}
              fullWidth
            />
          </View>

          {/* Transaction Filters */}
          <View style={styles.section}>
            <TransactionFilters
              activeType={activeTransactionType}
              onTypeChange={handleTransactionTypeChange}
            />
          </View>

          {/* Transaction Header */}
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
      </Animated.View>
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
  animatedContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16, // 16px base spacing
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  scrollView: {
    flex: 0,
  },
  header: {
    paddingHorizontal: 16, // 16px base spacing
    paddingTop: 16, // 16px base spacing
    paddingBottom: 8, // 8px compact spacing
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16, // 16px base spacing
    marginHorizontal: 16, // 16px base spacing
    marginBottom: 16, // 16px base spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16, // 16px base spacing
    padding: 16, // 16px base spacing
    borderRadius: 8,
    marginBottom: 16, // 16px base spacing
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  withdrawButton: {
    height: 48,
    borderRadius: 12,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, // 16px base spacing
    marginBottom: 8, // 8px compact spacing
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
    paddingHorizontal: 16, // 16px base spacing
    paddingBottom: 16, // 16px base spacing
  },
});