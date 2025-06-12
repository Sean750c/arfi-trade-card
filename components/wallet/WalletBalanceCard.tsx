import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Eye, EyeOff, Gift, TrendingUp, Info, Sparkles } from 'lucide-react-native';
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

  const getCurrencySymbol = () => {
    return balanceData.currency_name === 'USDT' ? 'USDT' : '₦';
  };

  return (
    <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
      {/* Main Balance Section */}
      <View style={styles.balanceHeader}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceAmountContainer}>
            <Text style={styles.balanceAmount}>
              {formatCurrency(balanceData.total_amount, getCurrencySymbol())}
            </Text>
          </View>
          
          {/* USD Equivalent - only show for non-USD currencies */}
          {balanceData.currency_name !== 'USDT' && (
            <Text style={styles.usdEquivalent}>
              ≈ ${formatAmount(balanceData.usd_amount)} USD
            </Text>
          )}
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
              {formatCurrency(balanceData.withdraw_amount, getCurrencySymbol())}
            </Text>
          </View>
        </View>

        {/* Rebate Amount - Clickable with Info */}
        <TouchableOpacity 
          style={styles.detailItem}
          onPress={onRebatePress}
          activeOpacity={0.7}
        >
          <View style={[styles.detailIcon, styles.rebateIcon]}>
            <Sparkles size={16} color="#FFD700" />
          </View>
          <View style={styles.detailContent}>
            <View style={styles.rebateLabelContainer}>
              <Text style={styles.detailLabel}>Rebate Balance</Text>
              <Info size={12} color="rgba(255, 255, 255, 0.6)" />
            </View>
            <Text style={styles.detailAmount}>
              {formatCurrency(balanceData.rebate_amount, getCurrencySymbol())}
            </Text>
            {balanceData.currency_name !== 'USDT' && (
              <Text style={styles.rebateUsd}>
                ≈ ${formatAmount(balanceData.usd_rebate_money)} USD
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Exchange Rate</Text>
          <Text style={styles.infoValue}>
            1 USD = {getCurrencySymbol()}{balanceData.rate}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Reward Points</Text>
          <Text style={styles.infoValue}>{balanceData.point.toLocaleString()}</Text>
        </View>
      </View>

      {/* Rebate Info Banner */}
      <TouchableOpacity 
        style={styles.rebateInfoBanner}
        onPress={onRebatePress}
        activeOpacity={0.8}
      >
        <View style={styles.rebateInfoContent}>
          <Gift size={16} color="rgba(255, 255, 255, 0.9)" />
          <Text style={styles.rebateInfoText}>
            Tap to learn more about rebate rewards and how to earn them
          </Text>
        </View>
        <View style={styles.rebateInfoArrow}>
          <Text style={styles.rebateInfoArrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    lineHeight: 38,
  },
  usdEquivalent: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  visibilityButton: {
    padding: Spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
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
  rebateIcon: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  detailContent: {
    flex: 1,
  },
  rebateLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  detailAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  rebateUsd: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 1,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: Spacing.sm,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  rebateInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rebateInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
  },
  rebateInfoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 16,
  },
  rebateInfoArrow: {
    marginLeft: Spacing.xs,
  },
  rebateInfoArrowText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});