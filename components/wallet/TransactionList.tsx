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

  const formatAmount = (amount: number, isPositive: boolean = true) => {
    const prefix = isPositive ? '+' : '-';
    const symbol = walletType === '2' ? 'USDT' : '₦';
    const decimals = walletType === '2' ? 4 : 2;
    
    return `${prefix}${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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

  const renderTransaction = ({ item: transaction }: { item: WalletTransaction }) => {
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
              {formatAmount(transaction.amount, isPositive)}
            </Text>
          </View>
          
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionMemo, { color: colors.textSecondary }]}>
              {transaction.memo || 'No description'}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
              {formatDate(transaction.create_time)}
            </Text>
          </View>

          {/* Order number for order transactions */}
          {transaction.order_no && (
            <Text style={[styles.orderNumber, { color: colors.textSecondary }]}>
              Order: #{transaction.order_no.slice(-8)}
            </Text>
          )}

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
  };

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
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {walletType === '2' 
          ? "You haven't made any USDT transactions yet."
          : "You haven't made any transactions yet."
        }
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
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  orderNumber: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
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