import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { OrderListItem } from '@/types/api';

interface OrderCardProps {
  order: OrderListItem;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: // Pending
        return <Clock size={16} color={colors.warning} />;
      case 2: // Succeed
        return <CheckCircle size={16} color={colors.success} />;
      case 3: // Refused
        return <XCircle size={16} color={colors.error} />;
      default:
        return <Clock size={16} color={colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: // Pending
        return colors.warning;
      case 2: // Succeed
        return colors.success;
      case 3: // Refused
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : currency === 'USDT' ? 'USDT' : currency;
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          borderColor: colors.border,
          shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            #{order.order_no.slice(-8)}
          </Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(order.status)}
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status_desc}
            </Text>
          </View>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(order.show_time)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.content}>
        <View style={styles.cardInfo}>
          {order.images ? (
            <Image 
              source={{ uri: order.images }} 
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.placeholderText, { color: colors.primary }]}>
                GC
              </Text>
            </View>
          )}
          <View style={styles.cardDetails}>
            <Text style={[styles.cardName, { color: colors.text }]}>
              {order.card_name || 'Gift Card Trade'}
            </Text>
            <Text style={[styles.walletType, { color: colors.textSecondary }]}>
              {order.wallet_type === 1 ? 'NGN Wallet' : 'USDT Wallet'}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: colors.success }]}>
            {formatAmount(order.amount, order.currency)}
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  walletType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});