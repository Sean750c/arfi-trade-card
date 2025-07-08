import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, ChevronRight } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import type { OrderListItem } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

interface OrderCardProps {
  currencySymbol: String,
  currencyName: String,
  order: OrderListItem;
  onPress: () => void;
}

export default function OrderCard({ currencySymbol, currencyName, order, onPress }: OrderCardProps) {
  const { colors } = useTheme();

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

  const formatAmount = (amount: number, walletType: number) => {
    const symbol = (walletType === 1 ? currencySymbol : 'USDT');
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
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            #{order.order_no.slice(-14)}
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
              {order.wallet_type === 1 ? `${currencyName} Wallet` : 'USDT Wallet'}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: colors.success }]}>
            {formatAmount(order.amount, order.wallet_type)}
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