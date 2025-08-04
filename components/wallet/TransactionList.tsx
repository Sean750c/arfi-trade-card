import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Gift, Users, Crown, CreditCard, TrendingUp, CircleAlert as AlertCircle, CircleCheck, CircleX, Clock, Cog, Building, Wrench, ArrowRightLeft } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import type { WalletTransaction } from '@/types';
import { formatDate } from '@/utils/date';
import { useTheme } from '@/theme/ThemeContext';

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
const TransactionItem = React.memo(({
  transaction,
  index,
  onTransactionPress,
  colors,
  styles,
  getTransactionIcon,
  getTransactionColor,
  getTransactionTitle,
  formatAmount,
  formatBalanceAmount,
  formatDate,
  getStatusIcon,
  getStatusColor
}: {
  transaction: WalletTransaction;
  index: number;
  onTransactionPress: (transaction: WalletTransaction) => void;
  colors: any;
  styles: any;
  getTransactionIcon: (type: string) => React.ReactNode;
  getTransactionColor: (type: string) => string;
  getTransactionTitle: (transaction: WalletTransaction) => string;
  formatAmount: (amount: number, isPositive: boolean, currencySymbol: string) => string;
  formatBalanceAmount: (amount: number, currencySymbol: string) => string;
  formatDate: (timestamp: number) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}) => {
  const isPositive = transaction.amount > 0;
  const transactionColor = getTransactionColor(transaction.type);

  // 优化动画：减少延迟和复杂度
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300, // 减少动画时长
      delay: index * 20, // 减少延迟间隔
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }], // 减少位移距离
      }}
    >
      <TouchableOpacity
        style={[
          styles.transactionItem,
          {
            backgroundColor: colors.card,
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

          </View>

          <View style={styles.statusContainer}>
            <View style={styles.status}>
              {getStatusIcon(transaction.order_status)}
              <Text style={[styles.statusText, { color: getStatusColor(transaction.order_status) }]}>
                {transaction.order_status}
              </Text>
            </View>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
              {formatDate(transaction.create_time)}
            </Text>
          </View>

          {/* Bank details for withdrawal transactions */}
          {/* {transaction.type === 'withdraw' && transaction.bank_name && (
            <View style={styles.bankDetails}>
              <Text style={[styles.bankName, { color: colors.textSecondary }]}> 
                {transaction.bank_name} • {transaction.account_no?.slice(-4)}
              </Text>
            </View>
          )} */}
        </View>
      </TouchableOpacity>
    </Animated.View>
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
  const { colors } = useTheme();

  // 使用 useMemo 缓存函数，避免重复创建
  const getTransactionIcon = useMemo(() => (type: string) => {
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
  }, [colors]);

  const getTransactionColor = useMemo(() => (type: string) => {
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
  }, [colors]);

  const getStatusIcon = useMemo(() => (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
        return <CircleCheck size={16} color={colors.success} />;
      case 'failed':
        return <CircleX size={16} color={colors.error} />;
      case 'pending':
        return <Clock size={16} color={colors.warning} />;
      case 'system processing':
        return <Cog size={16} color={colors.primary} />;
      case 'bank processing':
        return <Building size={16} color={colors.primary} />;
      case 'bank maintaining':
        return <Wrench size={16} color={colors.warning} />;
      case 'transferred':
        return <ArrowRightLeft size={16} color={colors.success} />;
      default:
        return <Clock size={16} color={colors.textSecondary} />;
    }
  }, [colors]);

  const getStatusColor = useMemo(() => (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'transferred':
        return colors.success;
      case 'failed':
        return colors.error;
      case 'pending':
      case 'bank maintaining':
        return colors.warning;
      case 'system processing':
      case 'bank processing':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  }, [colors]);

  const formatAmount = useMemo(() => (amount: number, isPositive: boolean = true, currencySymbol: string = '₦') => {
    const prefix = isPositive ? '+' : '-';
    const symbol = walletType === '2' ? 'USDT' : currencySymbol;
    const decimals = walletType === '2' ? 4 : 2;

    return `${prefix}${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }, [walletType]);

  const formatBalanceAmount = useMemo(() => (amount: number, currencySymbol: string = '₦') => {
    const symbol = walletType === '2' ? 'USDT' : currencySymbol;
    const decimals = walletType === '2' ? 4 : 2;

    return `${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }, [walletType]);

  const getTransactionTitle = useMemo(() => (transaction: WalletTransaction) => {
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
  }, []);

  // 用 useCallback 包裹 renderTransaction，依赖项只写必要的
  const renderTransaction = React.useCallback(
    ({ item: transaction, index }: { item: WalletTransaction; index: number }) => (
      <TransactionItem
        transaction={transaction}
        colors={colors}
        index={index}
        onTransactionPress={onTransactionPress}
        styles={styles}
        getTransactionIcon={getTransactionIcon}
        getTransactionColor={getTransactionColor}
        getTransactionTitle={getTransactionTitle}
        formatAmount={formatAmount}
        formatBalanceAmount={formatBalanceAmount}
        formatDate={formatDate}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
      />
    ),
    [colors, onTransactionPress]
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
    <>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.log_id.toString()}
        renderItem={renderTransaction}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <TrendingUp size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions found
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  status: {
    flexDirection: 'row',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
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
  emptyText: {
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