import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const formatBalance = (amount: number) => {
    if (!balanceVisible) {
      return '****';
    }
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Define gradient colors based on the primary color
  const gradientColors = [
    colors.primary,
    `${colors.primary}E6`, // 90% opacity
    `${colors.primary}CC`, // 80% opacity
  ];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      <View style={styles.balanceHeader}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            {balanceData.currency_symbol}{formatBalance(balanceData.total_amount)}
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

      <TouchableOpacity 
        style={styles.rebateContainer}
        onPress={onRebatePress}
      >
        <View style={styles.rebateInfo}>
          <Text style={styles.rebateLabel}>Rebate Balance:</Text>
          <Text style={styles.rebateAmount}>
            {balanceData.currency_symbol}{formatBalance(balanceData.rebate_amount)}
          </Text>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  eyeButton: {
    padding: Spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rebateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  rebateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rebateLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  rebateAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});