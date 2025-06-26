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
import { DollarSign, Star, Gift, Users, Crown, TrendingUp, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { RebateInfo, RebateItem, WalletTransaction } from '@/types';
import { formatDateString } from '@/utils/date';
import { useTheme } from '@/theme/ThemeContext';

interface RebateListProps {
  rebateInfo: RebateInfo | null;
  rebateList: RebateItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onRefresh: () => void;
  onRebatePress: (rebateItem: RebateItem) => void;
  walletType: '1' | '2'; // Add wallet type prop
}

export default function RebateList({
  rebateInfo,
  rebateList,
  isLoading,
  isLoadingMore,
  error,
  onLoadMore,
  onRefresh,
  onRebatePress,
  walletType,
}: RebateListProps) {
  const { colors } = useTheme();

  const getRebateTypeIcon = (type: number) => {
    switch (type) {
      case 1: return <Gift size={20} color={colors.primary} />;
      case 2: return <Users size={20} color={colors.success} />;
      case 3: return <Users size={20} color={colors.warning} />;
      case 4: return <TrendingUp size={20} color={colors.error} />;
      case 5: return <DollarSign size={20} color={colors.primary} />;
      case 6: return <Crown size={20} color="#FFD700" />;
      default: return <Star size={20} color={colors.textSecondary} />;
    }
  };

  const getRebateTypeName = (type: number) => {
    switch (type) {
      case 1: return 'First Order';
      case 2: return 'Referral';
      case 3: return 'Registration';
      case 4: return 'Transfer';
      case 5: return 'Amount Bonus';
      case 6: return 'VIP Bonus';
      case 11: return 'Check-in';
      case 12: return 'Lottery';
      case 13: return 'Mall';
      default: return 'Other';
    }
  };

  const getTransactionColor = (type: number) => {
    switch (type) {
      case 4:
        return colors.error;
      default:
        return colors.primary;
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

  const formatAfterRebate = (amount: string, currencySymbol: string = '₦') => {
    const symbol = walletType === '2' ? 'USDT' : currencySymbol;
    const decimals = walletType === '2' ? 4 : 2;

    return `${symbol}${Math.abs(Number(amount)).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const renderRebateItem = ({ item: rebateItem }: { item: RebateItem }) => {
    const isPositive = rebateItem.money > 0;
    const transactionColor = getTransactionColor(rebateItem.type);

    return (
      <TouchableOpacity
        style={[
          styles.rebateItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => onRebatePress(rebateItem)}
        activeOpacity={0.7}
      >

        <View style={styles.rebateItemLeft}>
          <View style={[styles.rebateIcon, { backgroundColor: `${transactionColor}15` }]}>
            {getRebateTypeIcon(rebateItem.type)}
          </View>
          <View style={styles.rebateItemInfo}>
            <Text style={[styles.rebateItemTitle, { color: colors.text }]}>
              {getRebateTypeName(rebateItem.type)}
            </Text>
            <Text style={[styles.rebateItemDate, { color: colors.textSecondary }]}>
              {formatDateString(rebateItem.create_time)}
            </Text>
            {rebateItem.from_get && (
              <Text style={[styles.rebateItemSource, { color: colors.textSecondary }]}>
                #{rebateItem.from_get}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rebateItemRight}>
          <Text style={[styles.rebateItemAmount, { color: `${transactionColor}` }]}>
            {formatAmount(rebateItem.money, isPositive, rebateInfo?.currency_symbol || '₦')}
          </Text>
          <Text style={[styles.rebateDate, { color: colors.textSecondary }]}>
              {formatAfterRebate(rebateItem.after_balance, rebateInfo?.currency_symbol || '₦')}
            </Text>
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
      data={rebateList}
      keyExtractor={(item) => item.log_id.toString()}
      renderItem={renderRebateItem}
      ListEmptyComponent={!isLoading ? renderEmptyState : null}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && rebateList.length === 0}
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
        rebateList.length === 0 && !isLoading && styles.emptyListContainer,
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
  rebateItem: {
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
  rebateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rebateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rebateItemInfo: {
    flex: 1,
  },
  rebateItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  rebateItemDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  rebateItemSource: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  rebateItemRight: {
    alignItems: 'flex-end',
  },
  rebateItemAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  rebateItemCurrency: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  rebateDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
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