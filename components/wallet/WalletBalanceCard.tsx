import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Eye, EyeOff, Gift, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { WalletBalanceData } from '@/types/api';

interface WalletBalanceCardProps {
  balanceData: WalletBalanceData;
  balanceVisible: boolean;
  onToggleVisibility: () => void;
  onRebatePress?: () => void;
  walletType: '1' | '2'; // Add wallet type prop
}

export default function WalletBalanceCard({
  balanceData,
  balanceVisible,
  onToggleVisibility,
  onRebatePress,
  walletType,
}: WalletBalanceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const formatBalance = (amount: number | string) => {
    if (!balanceVisible) return '****';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString(undefined, {
      minimumFractionDigits: walletType === '2' ? 4 : 2,
      maximumFractionDigits: walletType === '2' ? 6 : 2,
    });
  };

  const getBalanceAmount = () => {
    if (walletType === '2') {
      // USDT wallet - use usd_amount
      return balanceData.usd_amount || '0';
    } else {
      // NGN wallet - use total_amount
      return balanceData.total_amount || 0;
    }
  };

  const getRebateAmount = () => {
    if (walletType === '2') {
      // USDT wallet - use usd_rebate_money
      return balanceData.usd_rebate_money || 0;
    } else {
      // NGN wallet - use rebate_amount
      return balanceData.rebate_amount || 0;
    }
  };

  const getCurrencySymbol = () => {
    if (walletType === '2') {
      return 'USDT';
    } else {
      return balanceData.currency_name === 'NGN' ? '₦' : balanceData.currency_name;
    }
  };

  const getGradientColors = () => {
    if (walletType === '2') {
      // USDT - Green gradient
      return ['#10B981', '#059669'];
    } else {
      // NGN - Blue gradient (primary color)
      return [colors.primary, '#0066CC'];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>
            {walletType === '2' ? 'USDT Wallet' : 'Main Wallet'}
          </Text>
          <Text style={styles.walletType}>
            {walletType === '2' ? 'Cryptocurrency' : 'Local Currency'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.eyeButton}
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

      {/* Main Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>
            {getCurrencySymbol()}{formatBalance(getBalanceAmount())}
          </Text>
        </View>
        
        {/* USD Equivalent for NGN wallet */}
        {walletType === '1' && balanceData.usd_amount && (
          <Text style={styles.usdEquivalent}>
            ≈ ${formatBalance(balanceData.usd_amount)}
          </Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Frozen Amount */}
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={16} color="rgba(255, 255, 255, 0.8)" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Frozen</Text>
            <Text style={styles.statValue}>
              {getCurrencySymbol()}{formatBalance(balanceData.frozen_amount || 0)}
            </Text>
          </View>
        </View>

        {/* Rebate Amount */}
        <TouchableOpacity 
          style={styles.statItem}
          onPress={onRebatePress}
          activeOpacity={0.7}
        >
          <View style={styles.statIconContainer}>
            <Gift size={16} color="rgba(255, 255, 255, 0.8)" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Rebate</Text>
            <Text style={styles.statValue}>
              {getCurrencySymbol()}{formatBalance(getRebateAmount())}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Additional Info for USDT */}
      {walletType === '2' && (
        <View style={styles.additionalInfo}>
          <Text style={styles.infoText}>
            • USDT transactions may take 5-30 minutes to confirm
          </Text>
          <Text style={styles.infoText}>
            • Network fees apply for withdrawals
          </Text>
        </View>
      )}

      {/* Additional Info for NGN */}
      {walletType === '1' && balanceData.dealing_cnt > 0 && (
        <View style={styles.additionalInfo}>
          <Text style={styles.infoText}>
            • {balanceData.dealing_cnt} pending transaction{balanceData.dealing_cnt > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  walletType: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  eyeButton: {
    padding: Spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceSection: {
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
    fontFamily: 'Inter-Medium',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  additionalInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    marginBottom: 2,
  },
});