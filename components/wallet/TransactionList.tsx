import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Gift, 
  Users, 
  Crown,
  RefreshCw,
  CircleCheck as CheckCircle,
  Clock,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { WalletTransaction } from '@/types/api';

interface TransactionListProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onRefresh: () => void;
  onTransactionPress: (transaction: WalletTransaction) => void;
}

export default function TransactionList({
  transactions,
  isLoading,
  isLoadingMore,
  error,
  onLoadMore,
  onRefresh,
  onTransactionPress,
}: TransactionListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'withdraw':
        return <ArrowUpRight size={20} color={colors.error} />;
      case 'order':
        return <Gift size={20} color={colors.success} />;
      case 'transfer':
        return <ArrowDownRight size={20} color={colors.primary} />;
      case 'recommend':
        return <Users size={20} color={colors.secondary} />;
      case 'vip':
        return <Crown size={20} color={colors.warning} />;
      default:
        return <RefreshCw size={20} color={colors.textSecondary} />;
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('success') || statusLower.includes('completed') || statusLower.includes('transferred')) {
      return <CheckCircle size={16} color={colors.success} />;
    } else if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return <Clock size={16} color={colors.warning} />;
    } else if (statusLower.includes('failed') || statusLower.includes('rejected')) {
      return <AlertCircle size={16} color={colors.error} />;
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('success') || statusLower.includes('completed') || statusLower.includes('transferred')) {
      return colors.success;
    } else if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return colors.warning;
    } else if (statusLower.includes('failed') || statusLower.includes('rejected')) {
      return colors.error;
    }
    return colors.textSecondary;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatAmount = (amount: number, symbol: string) => {
    const isPositive = amount > 0;
    const formattedAmount = Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isPositive ? '+' : '-'}${symbol}${formattedAmount}`;
  };

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          borderColor: colors.border,
          shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}
      onPress={() => onTransactionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionContent}>
        {/* Icon and Type */}
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: `${
              item.type === 'withdraw' ? colors.error :
              item.type === 'order' ? colors.success :
              item.type === 'transfer' ? colors.primary :
              item.type === 'admin' ? colors.secondary :
              item.type === 'rank' ? colors.warning :
              colors.textSecondary
            }15`,
            shadowColor: item.type === 'withdraw' ? colors.error :
              item.type === 'order' ? colors.success :
              item.type === 'transfer' ? colors.primary :
              item.type === 'admin' ? colors.secondary :
              item.type === 'rank' ? colors.warning :
              colors.textSecondary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }
        ]}>
          {getTypeIcon(item.type)}
        </View>
        
        {/* Transaction Details */}
        <View style={styles.transactionDetails}>
          <View style={styles.transactionHeader}>
            <Text style={[styles.transactionName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.transactionMemo, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.memo}
            </Text>
          </View>
          
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
              {formatDate(item.create_time)}
            </Text>
            
            <View style={styles.statusContainer}>
              {getStatusIcon(item.order_status)}
              <Text
                style={[
                  styles.transactionStatus,
                  { color: getStatusColor(item.order_status) },
                ]}
              >
                {item.order_status}
              </Text>
            </View>
          </View>
          
          {/* Bank Details for Withdrawals */}
          {item.type === 'withdraw' && item.bank_name && (
            <View style={styles.bankDetails}>
              <Text style={[styles.bankName, { color: colors.textSecondary }]}>
                {item.bank_name} • {item.account_no}
              </Text>
            </View>
          )}
        </View>
        
        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.transactionAmount,
              {
                color: item.amount > 0 ? colors.success : colors.error,
              },
            ]}
          >
            {formatAmount(item.amount, item.currency_symbol)}
          </Text>
          <Text style={[styles.balanceAfter, { color: colors.textSecondary }]}>
            Balance: {item.currency_symbol}{item.balance_amount.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
      <Gift size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No transactions found
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Your transaction history will appear here once you start trading
      </Text>
    </View>
  );

  if (error) {
    return (
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
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.log_id.toString()}
      renderItem={renderTransactionItem}
      ListEmptyComponent={!isLoading ? renderEmptyState : null}
      ListFooterComponent={renderFooter}
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
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    marginBottom: Spacing.sm,
  },
  transactionName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 3,
  },
  transactionMemo: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  bankDetails: {
    marginTop: Spacing.xs,
  },
  bankName: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    marginBottom: 3,
  },
  balanceAfter: {
    fontSize: 10,
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
    fontSize: 20,
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
    paddingVertical: Spacing.xxl,
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