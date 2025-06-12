import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Eye, EyeOff, Gift, TrendingUp, Award } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { WalletBalanceData } from '@/types/api';

interface WalletBalanceCardProps {
  balanceData: WalletBalanceData;
  balanceVisible: boolean;
  onToggleVisibility: () => void;
  onRebatePress: () => void;
}

export default function WalletBalanceCard({
  balanceData,
  balanceVisible,
  onToggleVisibility,
  onRebatePress,
}: WalletBalanceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const formatAmount = (amount: number | string) => {
    if (!balanceVisible) return '****';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrency = (amount: number | string, symbol: string = '₦') => {
    return `${symbol}${formatAmount(amount)}`;
  };

  return (
    <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
      {/* Main Balance Section */}
      <View style={styles.balanceHeader}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceAmountContainer}>
            <Text style={styles.balanceAmount}>
              {formatCurrency(balanceData.total_amount)}
            </Text>
            <Text style={styles.currencyName}>
              {balanceData.currency_name}
            </Text>
          </View>
          
          {/* USD Equivalent */}
          <Text style={styles.usdEquivalent}>
            ≈ ${formatAmount(balanceData.usd_amount)} USD
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.visibilityButton}
          onPress={onToggleVisibility}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {balanceVisible ? (
            <Eye size={20} color="rgba(255, 255, 255, 0.8)" />
          ) : (
            <EyeOff size={20} color="rgba(255, 255, 255, 0.8)" />
          )}
        </TouchableOpacity>
      </View>

      {/* Balance Details Grid */}
      <View style={styles.balanceDetails}>
        {/* Withdrawable Amount */}
        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Withdrawable</Text>
            <Text style={styles.detailAmount}>
              {formatCurrency(balanceData.withdraw_amount)}
            </Text>
          </View>
        </View>

        {/* Rebate Amount - Clickable */}
        <TouchableOpacity 
          style={styles.detailItem}
          onPress={onRebatePress}
          activeOpacity={0.7}
        >
          <View style={styles.detailIcon}>
            <Gift size={16} color="rgba(255, 255, 255, 0.9)" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Rebate Balance</Text>
            <Text style={styles.detailAmount}>
              {formatCurrency(balanceData.rebate_amount)}
            </Text>
            <Text style={styles.rebateUsd}>
              ≈ ${formatAmount(balanceData.usd_rebate_money)} USD
            </Text>
          </View>
        </TouchableOpacity>

        {/* Frozen Amount */}
        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Award size={16} color="rgba(255, 255, 255, 0.9)" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Frozen</Text>
            <Text style={styles.detailAmount}>
              {formatCurrency(balanceData.frozen_amount)}
            </Text>
          </View>
        </View>

        {/* Points */}
        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Award size={16} color="rgba(255, 255, 255, 0.9)" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Points</Text>
            <Text style={styles.detailAmount}>
              {balanceVisible ? balanceData.point.toLocaleString() : '****'}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Dealing Orders</Text>
          <Text style={styles.statusValue}>{balanceData.dealing_cnt}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Exchange Rate</Text>
          <Text style={styles.statusValue}>1 USD = ₦{balanceData.rate}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginRight: Spacing.xs,
  },
  currencyName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  usdEquivalent: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  visibilityButton: {
    padding: Spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    minHeight: 60,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  detailAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  rebateUsd: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
});