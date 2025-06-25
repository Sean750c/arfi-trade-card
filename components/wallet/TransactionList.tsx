import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Gift, Users, Crown, CreditCard, TrendingUp, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { WalletTransaction } from '@/types';
import { formatDate } from '@/utils/date';

interface TransactionListProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onRefresh: () => void;
  onTransactionPress: (transaction: WalletTransaction) => void;
  walletType: '1' | '2'; // Add wallet type prop
}

// TransactionItem 组件，使用 React.memo 优化
const TransactionItem = React.memo(function TransactionItem({
  transaction,
  colorScheme,
  colors,
  walletType,
  onTransactionPress,
  getTransactionIcon,
  getTransactionColor,
  getTransactionTitle,
  formatAmount,
  formatBalanceAmount,
  formatDate,
}: {
  transaction: WalletTransaction;
  colorScheme: string;
  colors: any;
  walletType: '1' | '2';
  onTransactionPress: (transaction: WalletTransaction) => void;
  getTransactionIcon: (type: string) => React.ReactNode;
  getTransactionColor: (type: string) => string;
  getTransactionTitle: (transaction: WalletTransaction) => string;
  formatAmount: (amount: number, isPositive: boolean, currencySymbol: string) => string;
  formatBalanceAmount: (amount: number, currencySymbol: string) => string;
  formatDate: (timestamp: number) => string;
}) {
  const isPositive = transaction.amount > 0;
  const transactionColor = getTransactionColor(transaction.type);

  return (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        {
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}
      onPress={() => onTransactionPress(transaction)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: `${transactionColor}15` }
      ]}>
        {getTransactionIcon(transaction.type)}
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <Text style={[styles.transactionTitle, { color: colors.text }]}> 
            {getTransactionTitle(transaction)}
          </Text>
          <Text style={[
            styles.transactionAmount,
            { color: isPositive ? colors.success : colors.error }
          ]}>
            {formatAmount(transaction.amount, isPositive, transaction.currency_symbol)}
          </Text>
        </View>

        <View style={styles.transactionMeta}>
          <Text style={[styles.transactionMemo, { color: colors.textSecondary }]}> 
            {transaction.memo || 'No description'}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}> 
            {formatBalanceAmount(transaction.balance_amount, transaction.currency_symbol)}
          </Text>
        </View>
        <View style={styles.transactionOrder}>
          {/* Order number for order transactions */}
          {transaction.order_no ? (
            <Text style={[styles.orderNumber, { color: colors.textSecondary }]}> 
              Order: #{transaction.order_no.slice(-14)}
            </Text>
          ) : (
            <Text style={[styles.orderNumber, { color: colors.textSecondary }]}> 
              {' '}
            </Text>
          )}
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}> 
            {formatDate(transaction.create_time)}
          </Text>
        </View>

        {/* Bank details for withdrawal transactions */}
        {transaction.type === 'withdraw' && transaction.bank_name && (
          <View style={styles.bankDetails}>
            <Text style={[styles.bankName, { color: colors.textSecondary }]}> 
              {transaction.bank_name} • {transaction.account_no?.slice(-4)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function TransactionList({
  transactions,
  isLoading,
  isLoadingMore,
  error,
  onLoadMore,
  onRefresh,
  onTransactionPress,
  walletType,
}: TransactionListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Gift size={20} color={colors.success} />;
      case 'withdraw':
        return <ArrowUpRight size={20} color={colors.error} />;
      case 'transfer':
        return <ArrowDownLeft size={20} color={colors.primary} />;
      case 'recommend':
        return <Users size={20} color={colors.secondary} />;
      case 'vip':
        return <Crown size={20} color={colors.warning} />;
      case 'admin':
        return <CreditCard size={20} color={colors.primary} />;
      default:
        return <TrendingUp size={20} color={colors.text} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'order':
      case 'recommend':
      case 'vip':
      case 'activity':
        return colors.success;
      case 'withdraw':
        return colors.error;
      case 'transfer':
      case 'admin':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const formatAmount = (amount: number, isPositive: boolean = true, currencySymbol: string = '₦') => {
    const prefix = isPositive ? '+' : '-';
    const symbol = walletType === '2' ? 'USDT' : currencySymbol;
    const decimals = walletType === '2' ? 4 : 2;

    return `${prefix}${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const formatBalanceAmount = (amount: number, currencySymbol: string = '₦') => {
    const symbol = walletType === '2' ? 'USDT' : currencySymbol;
    const decimals = walletType === '2' ? 4 : 2;

    return `${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const getTransactionTitle = (transaction: WalletTransaction) => {
    if (transaction.name) return transaction.name;

    switch (transaction.type) {
      case 'order':
        return 'Gift Card Trade';
      case 'withdraw':
        return 'Withdrawal';
      case 'transfer':
        return 'Transfer';
      case 'recommend':
        return 'Referral Bonus';
      case 'vip':
        return 'VIP Bonus';
      case 'admin':
        return 'Admin Adjustment';
      case 'activity':
        return 'Activity Reward';
      default:
        return 'Transaction';
    }
  };

  // 用 useCallback 包裹 renderTransaction，依赖项只写必要的
  const renderTransaction = React.useCallback(
    ({ item: transaction }: { item: WalletTransaction }) => (
      <TransactionItem
        transaction={transaction}
        colorScheme={colorScheme}
        colors={colors}
        walletType={walletType}
        onTransactionPress={onTransactionPress}
        getTransactionIcon={getTransactionIcon}
        getTransactionColor={getTransactionColor}
        getTransactionTitle={getTransactionTitle}
        formatAmount={formatAmount}
        formatBalanceAmount={formatBalanceAmount}
        formatDate={formatDate}
      />
    ),
    [colorScheme, colors, walletType, onTransactionPress]
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more transactions...
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <TrendingUp size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Transactions
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AlertCircle size={48} color={colors.error} />
      <Text style={[styles.errorTitle, { color: colors.error }]}>
        Failed to load transactions
      </Text>
      <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={onRefresh}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return renderErrorState();
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.log_id.toString()}
      renderItem={renderTransaction}
      ListEmptyComponent={!isLoading ? renderEmptyState : null}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && transactions.length === 0}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContainer,
        transactions.length === 0 && !isLoading && styles.emptyListContainer,
      ]}
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: Spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionMemo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
    marginRight: Spacing.sm,
  },
  transactionAfterAmount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  transactionOrder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  bankDetails: {
    marginTop: 4,
  },
  bankName: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});