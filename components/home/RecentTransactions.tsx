import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Gift, ArrowDownLeft, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { formatDate } from '@/utils/date';

export default function RecentTransactions() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, isAuthenticated } = useAuthStore();
  const { orders, isLoadingOrders, fetchOrders } = useOrderStore();

  // Fetch recent orders when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      fetchOrders(user.token, true);
    }
  }, [isAuthenticated, user?.token, fetchOrders]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2:
        return colors.success;
      case 1:
        return colors.warning;
      case 3:
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 2:
        return <CheckCircle size={16} color={colors.success} />;
      case 1:
        return <Clock size={16} color={colors.warning} />;
      case 3:
        return <AlertCircle size={16} color={colors.error} />;
      default:
        return null;
    }
  };

  const getIconForType = (walletType: number) => {
    return <Gift size={20} color={colors.primary} />;
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : currency === 'USDT' ? 'USDT' : currency;
    return `+${symbol}${amount.toLocaleString()}`;
  };

  // Get last 5 orders
  const recentOrders = orders.slice(0, 5);

  const renderOrderItem = (order: any) => (
    <TouchableOpacity
      key={order.order_no}
      style={[
        styles.transactionItem,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
          borderColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/orders/${order.order_no}` as any)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: `${colors.primary}15` }
      ]}>
        {getIconForType(order.wallet_type)}
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <Text style={[styles.orderNumber, { color: colors.textSecondary }]}>
            #{order.order_no.slice(-14)}
          </Text>
        </View>
        <View style={styles.transactionMeta}>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {formatDate(order.show_time)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
            {getStatusIcon(order.status)}
            <Text
              style={[
                styles.transactionStatus,
                { color: getStatusColor(order.status) },
              ]}
            >
              {order.status_desc}
            </Text>
          </View>
      </View>
      
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: colors.success },
          ]}
        >
          {formatAmount(order.amount, order.currency)}
        </Text>
        <ArrowRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>Login</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.emptyContainer, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}>
          <Gift size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Login to View Transactions
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Sign in to see your recent transactions and trading history
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/orders')}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          <ArrowRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {isLoadingOrders ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading recent transactions...
          </Text>
        </View>
      ) : recentOrders.length > 0 ? (
        <View style={styles.transactionsList}>
          {recentOrders.map(renderOrderItem)}
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}>
          <Gift size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Recent Transactions
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Start trading gift cards to see your transaction here
          </Text>
          <TouchableOpacity
            style={[styles.startTradingButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/sell')}
          >
            <Text style={styles.startTradingText}>Start Trading</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
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
  transactionDesc: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  orderNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    textTransform: 'capitalize',
  },
  amountContainer: {
    //alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: 16,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  startTradingButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  startTradingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});