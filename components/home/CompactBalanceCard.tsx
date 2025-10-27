import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Wallet, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface CompactBalanceCardProps {
  balance: string;
  rebateBalance: string;
  currencySymbol: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onPress: () => void;
}

export default function CompactBalanceCard({
  balance,
  rebateBalance,
  currencySymbol,
  isVisible,
  onToggleVisibility,
  onPress,
}: CompactBalanceCardProps) {
  const { colors } = useTheme();

  const formatBalance = (amount: string) => {
    return isVisible ? amount : '****';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <View style={styles.left}>
            <View style={styles.iconContainer}>
              <Wallet size={20} color="rgba(255, 255, 255, 0.9)" strokeWidth={2.5} />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.label}>Total Balance</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amount}>
                  {currencySymbol}{formatBalance(balance)}
                </Text>
                <View style={styles.rebateTag}>
                  <Text style={styles.rebateText}>
                    +{currencySymbol}{formatBalance(rebateBalance)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.right}>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isVisible ? (
                <Eye size={18} color="rgba(255, 255, 255, 0.8)" strokeWidth={2.5} />
              ) : (
                <EyeOff size={18} color="rgba(255, 255, 255, 0.8)" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
            <ArrowRight size={18} color="rgba(255, 255, 255, 0.6)" strokeWidth={2.5} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 70,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  rebateTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rebateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
