import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import CustomerServiceButton from '@/components/UI/CustomerServiceButton';
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
import { PerformanceMonitor } from '@/utils/performance';
import { useAppStore } from '@/stores/useAppStore';
import WithdrawDetailModal from '@/components/wallet/WithdrawDetailModal';

function WalletScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { initData } = useAppStore();

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
    setSelectedWithdrawAccount,
  } = useWalletStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const [selectedWithdrawId, setSelectedWithdrawId] = React.useState<number | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);

  // 使用 useMemo 缓存交易统计
  const transactionStats = useMemo(() => ({
    totalCount: transactions.length,
    hasTransactions: transactions.length > 0,
  }), [transactions.length]);

  // 使用 useMemo 缓存样式
  const headerStyle = useMemo(() => [
    styles.header, 
    { 
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
    }
  ], [colors.card, colors.border]);

  const titleStyle = useMemo(() => [styles.title, { color: colors.text }], [colors.text]);
  const errorContainerStyle = useMemo(() => [styles.errorContainer, { backgroundColor: colors.error + '10' }], [colors.error]);
  const errorTextStyle = useMemo(() => [styles.errorText, { color: colors.error }], [colors.error]);
  const sectionTitleStyle = useMemo(() => [styles.sectionTitle, { color: colors.text }], [colors.text]);
  const transactionCountStyle = useMemo(() => [styles.transactionCount, { color: colors.textSecondary }], [colors.textSecondary]);

  // WalletBalanceData 默认空对象
  const defaultBalanceData = {
    total_amount: 0,
    usd_amount: '0',
    frozen_amount: 0,
    withdraw_amount: 0,
    transfer_rebate: '0',
    rebate_amount: 0,
    usd_rebate_money: 0,
    checkin_status: false,
    lottery_status: false,
    rank_status: false,
    default_wallet_type: '1',
    dealing_cnt: 0,
    currency_name: user?.currency_name || 'NGN',
    rate: '0',
    point: 0,
  };

  // 判断是否隐藏钱包tab和USDT钱包
  const hideWalletTabs = initData?.hidden_flag === '1';

  // 优化：只在必要时刷新数据，避免频繁 API 调用
  useFocusEffect(
    useCallback(() => {
      const endTimer = PerformanceMonitor.getInstance().startTimer('wallet_focus_effect');
      
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
      
      endTimer();
    }, [user?.token, fetchBalance, fetchTransactions, lastRefreshTime])
  );

  // 强制刷新余额数据
  useEffect(() => {
    if (user?.token && !balanceData) {
      fetchBalance(user.token);
    }
  }, [user?.token, balanceData, fetchBalance]);

  // 当钱包类型或交易类型改变时重新获取交易数据
  useFocusEffect(
    useCallback(() => {
      const endTimer = PerformanceMonitor.getInstance().startTimer('wallet_type_change_effect');
      
      if (user?.token) {
        fetchTransactions(user.token, false);
      }
      
      endTimer();
    }, [user?.token, activeWalletType, activeTransactionType, fetchTransactions])
  );

  const handleRefresh = useCallback(async () => {
    const endTimer = PerformanceMonitor.getInstance().startTimer('wallet_refresh');
    
    if (!user?.token) return;

    setRefreshing(true);
    try {
      await Promise.all([
        fetchBalance(user.token),
        fetchTransactions(user.token, true),
      ]);
    } finally {
      setRefreshing(false);
      endTimer();
    }
  }, [user?.token, fetchBalance, fetchTransactions]);

  const handleWalletTypeChange = useCallback((type: '1' | '2') => {
    setActiveWalletType(type);
    setSelectedWithdrawAccount(null);
  }, [setActiveWalletType, setSelectedWithdrawAccount]);

  const handleTransactionTypeChange = useCallback((
    type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip'
  ) => {
    setActiveTransactionType(type);
  }, [setActiveTransactionType]);

  const handleLoadMore = useCallback(() => {
    if (!user?.token) return;
    loadMoreTransactions(user.token);
  }, [user?.token, loadMoreTransactions]);

  const handleWithdraw = useCallback(() => {
    router.push('/wallet/withdraw');
  }, []);

  const handleTransactionPress = useCallback((transaction: WalletTransaction) => {
    if (transaction.type === 'order') {
      router.push(`/orders/${transaction.order_no}`);
    } else if (transaction.type === 'withdraw') {
      setSelectedWithdrawId(transaction.log_id);
      setShowWithdrawModal(true);
    }
  }, []);

  const handleRebatePress = useCallback(() => {
    router.push({
      pathname: '/wallet/rebate',
      params: { walletType: activeWalletType },
    });
  }, [activeWalletType]);

  const handleToggleBalanceVisibility = useCallback(() => {
    setBalanceVisible(prev => !prev);
  }, []);

  const handleCloseWithdrawModal = () => {
    setShowWithdrawModal(false);
    setSelectedWithdrawId(null);
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      {/* Enhanced Header */}
      <View style={headerStyle}>
        <Text style={titleStyle}>Wallet</Text>
      </View>

      {/* Wallet Tabs */}
      {!hideWalletTabs && (
        <View style={styles.tabsContainer}>
          <WalletTabs
            countryCurrencyName={user?.currency_name || 'NGN'}
            countryCurrencySymbol={user?.currency_symbol || '₦'}
            activeWalletType={activeWalletType}
            onWalletTypeChange={handleWalletTypeChange}
          />
        </View>
      )}
      {/* Balance Card */}
      <View style={styles.balanceContainer}>
        <WalletBalanceCard
          balanceData={balanceData || defaultBalanceData}
          balanceVisible={balanceVisible}
          onToggleVisibility={handleToggleBalanceVisibility}
          onRebatePress={handleRebatePress}
          walletType={activeWalletType}
        />
      </View>

      {/* Balance Error */}
      {balanceError && (
        <View style={errorContainerStyle}>
          <Text style={errorTextStyle}>
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
        <Text style={sectionTitleStyle}>
          Transaction History
        </Text>
        <Text style={transactionCountStyle}>
          {transactionStats.totalCount} transactions
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
      
      {/* Floating Customer Service Button */}
      <CustomerServiceButton
        style={styles.customerServiceButton}
      />

      {/* Withdraw Detail Modal */}
      {showWithdrawModal && selectedWithdrawId && (
        <WithdrawDetailModal
          visible={showWithdrawModal}
          onClose={handleCloseWithdrawModal}
          logId={selectedWithdrawId}
        />
      )}
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
    paddingTop: Spacing.sm,
  },
  balanceContainer: {
    paddingTop: Spacing.md,
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
  customerServiceButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
});