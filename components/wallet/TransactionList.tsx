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
import { ArrowUpRight, ArrowDownRight, Gift, Users, Award, Wallet } from 'lucide-react-native';
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
        return <Wallet size={20} color={colors.primary} />;
      case 'recommend':
        return <Users size={20} color={colors.secondary} />;
      case 'vip':
        return <Award size={20} color={colors.warning} />;
      default:
        return <ArrowDownRight size={20} color={colors.success} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'withdraw':
        return colors.error;
      case 'order':
        return colors.success;
      case 'transfer':
        return colors.primary;
      case 'recommend':
        return colors.secondary;
      case 'vip':
        return colors.warning;
      default:
        return colors.success;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number, symbol: string) => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderItem = ({ item }: { item: WalletTransaction }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        }
      ]}
      onPress={() => onTransactionPress(item)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: `${getTypeColor(item.type)}15` }
      ]}>
        {getTypeIcon(item.type)}
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionDesc, { color: colors.text }]} numberOfLines={1}>
          {item.memo || item.name || 'Transaction'}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
          {formatDate(item.create_time)}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.amount >= 0 ? colors.success : colors.error },
          ]}
        >
          {formatAmount(item.amount, item.currency_symbol)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No transactions found
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={[styles.errorContainer, { backgroundColor: `${colors.error}10` }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderError()}
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.log_id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !isLoadingMore}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={transactions.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
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
  transactionDesc: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footerLoader: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});