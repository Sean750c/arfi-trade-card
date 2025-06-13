import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Define gradient colors based on theme and currency
  const getGradientColors = () => {
    if (balanceData.currency_name === 'USDT') {
      return colorScheme === 'dark' 
        ? ['#1E40AF', '#3B82F6', '#1E3A8A'] // Blue gradient for USDT in dark mode
        : ['#2563EB', '#3B82F6', '#1D4ED8']; // Blue gradient for USDT in light mode
    } else {
      return colorScheme === 'dark'
        ? [colors.primary, '#059669', '#047857'] // Green gradient for NGN in dark mode
        : [colors.primary, '#10B981', '#047857']; // Green gradient for NGN in light mode
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
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
            <Eye size={20} color="rgba(255, 255, 255, 0.9)" />
          ) : (
            <EyeOff size={20} color="rgba(255, 255, 255, 0.9)" />
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
              <Info size={12} color="rgba(255, 255, 255, 0.7)" />
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: Spacing.xs,
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
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.sm,
  },
  balanceAmountContainer: {
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    lineHeight: 42,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  usdEquivalent: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  visibilityButton: {
    padding: Spacing.md,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  rebateIcon: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
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
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 3,
  },
  detailAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rebateUsd: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: Spacing.md,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rebateInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rebateInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  rebateInfoText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    flex: 1,
    lineHeight: 18,
  },
  rebateInfoArrow: {
    marginLeft: Spacing.sm,
  },
  rebateInfoArrowText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
});