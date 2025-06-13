import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { ChevronRight, Clock, CircleCheck as CheckCircle, CircleX as XCircle, Gift, DollarSign, Calendar, Image as ImageIcon } from 'lucide-react-native';
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

  const getStatusIcon = () => {
    const statusLower = order.status_desc.toLowerCase();
    if (statusLower.includes('succeed') || statusLower.includes('completed')) {
      return <CheckCircle size={20} color={colors.success} />;
    } else if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return <Clock size={20} color={colors.warning} />;
    } else if (statusLower.includes('refused') || statusLower.includes('failed')) {
      return <XCircle size={20} color={colors.error} />;
    }
    return <Clock size={20} color={colors.textSecondary} />;
  };

  const getStatusColor = () => {
    const statusLower = order.status_desc.toLowerCase();
    if (statusLower.includes('succeed') || statusLower.includes('completed')) {
      return colors.success;
    } else if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return colors.warning;
    } else if (statusLower.includes('refused') || statusLower.includes('failed')) {
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

  const formatAmount = () => {
    const symbol = order.currency === 'NGN' ? '₦' : order.currency === 'USDT' ? 'USDT' : order.currency;
    return `${symbol}${parseFloat(order.all_money).toLocaleString(undefined, {
      miniminFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const hasImages = order.images && order.images.trim() !== '';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          borderColor: colors.border,
          shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.orderNumberContainer}>
              <Gift size={16} color={colors.primary} />
              <Text style={[styles.orderNumber, { color: colors.text }]}>
                #{order.order_no.slice(-8)}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              {getStatusIcon()}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {order.status_desc}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>

        {/* Card Name */}
        {order.card_name && (
          <Text style={[styles.cardName, { color: colors.text }]}>
            {order.card_name}
          </Text>
        )}

        {/* Amount and Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.amountContainer}>
            <DollarSign size={16} color={colors.primary} />
            <Text style={[styles.amount, { color: colors.primary }]}>
              {formatAmount()}
            </Text>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.dateContainer}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate(order.show_time)}
              </Text>
            </View>

            {hasImages && (
              <View style={styles.imageIndicator}>
                <ImageIcon size={14} color={colors.textSecondary} />
                <Text style={[styles.imageCount, { color: colors.textSecondary }]}>
                  Images
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Rebate Info */}
        {order.order_rebate > 0 && (
          <View style={[styles.rebateContainer, { backgroundColor: `${colors.success}10` }]}>
            <Text style={[styles.rebateText, { color: colors.success }]}>
              Rebate: {order.currency === 'NGN' ? '₦' : 'USDT'}{order.order_rebate.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Refused Reason */}
        {order.refused_reason && (
          <View style={[styles.refusedContainer, { backgroundColor: `${colors.error}10` }]}>
            <XCircle size={14} color={colors.error} />
            <Text style={[styles.refusedText, { color: colors.error }]}>
              {order.refused_reason}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  orderNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  detailsContainer: {
    gap: Spacing.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  imageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  rebateContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  rebateText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  refusedContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  refusedText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    flex: 1,
    lineHeight: 16,
  },
});