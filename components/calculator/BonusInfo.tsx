import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Gift, Star, ChevronDown, ChevronUp, DollarSign, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { AmountOrderBonus } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

interface BonusInfoProps {
  firstOrderBonus: number;
  amountOrderBonus: AmountOrderBonus;
  currencySymbol: string;
}

export default function BonusInfo({ 
  firstOrderBonus, 
  amountOrderBonus, 
  currencySymbol 
}: BonusInfoProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const hasAnyBonus = firstOrderBonus > 0 || amountOrderBonus.bonus_amount > 0;

  if (!hasAnyBonus) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.bonusHeader, { backgroundColor: `${colors.success}15` }]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.bonusHeaderContent}>
          <Gift size={20} color={colors.success} />
          <Text style={[styles.bonusTitle, { color: colors.success }]}>
            Available Bonuses & Rewards
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={16} color={colors.success} />
        ) : (
          <ChevronDown size={16} color={colors.success} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.bonusContent}>
          {/* First Order Bonus */}
          {firstOrderBonus > 0 && (
            <View style={[styles.bonusItem, { borderBottomColor: colors.border }]}>
              <View style={styles.bonusItemHeader}>
                <View style={[styles.bonusIcon, { backgroundColor: `${colors.warning}20` }]}>
                  <Star size={16} color={colors.warning} />
                </View>
                <View style={styles.bonusItemContent}>
                  <Text style={[styles.bonusItemTitle, { color: colors.text }]}>
                    First Order Bonus
                  </Text>
                  <Text style={[styles.bonusDescription, { color: colors.textSecondary }]}>
                    Welcome bonus for new traders
                  </Text>
                </View>
              </View>
              <Text style={[styles.bonusAmount, { color: colors.success }]}>
                +{currencySymbol}{firstOrderBonus}
              </Text>
            </View>
          )}
          
          {/* Volume Bonus */}
          {amountOrderBonus.bonus_amount > 0 && (
            <View style={[styles.bonusItem, { borderBottomColor: colors.border }]}>
              <View style={styles.bonusItemHeader}>
                <View style={[styles.bonusIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <DollarSign size={16} color={colors.primary} />
                </View>
                <View style={styles.bonusItemContent}>
                  <Text style={[styles.bonusItemTitle, { color: colors.text }]}>
                    Volume Cashback
                  </Text>
                  <Text style={[styles.bonusDescription, { color: colors.textSecondary }]}>
                    Extra {currencySymbol}{amountOrderBonus.bonus_amount} for orders ≥ {currencySymbol}{amountOrderBonus.order_amount}
                  </Text>
                </View>
              </View>
              <Text style={[styles.bonusAmount, { color: colors.success }]}>
                +{currencySymbol}{amountOrderBonus.bonus_amount}
              </Text>
            </View>
          )}

          {/* Referral Bonus Info */}
          <View style={styles.bonusItem}>
            <View style={styles.bonusItemHeader}>
              <View style={[styles.bonusIcon, { backgroundColor: `${colors.secondary}20` }]}>
                <Users size={16} color={colors.secondary} />
              </View>
              <View style={styles.bonusItemContent}>
                <Text style={[styles.bonusItemTitle, { color: colors.text }]}>
                  Referral Rewards
                </Text>
                <Text style={[styles.bonusDescription, { color: colors.textSecondary }]}>
                  Earn {currencySymbol}1,000 for each successful referral
                </Text>
              </View>
            </View>
            <Text style={[styles.bonusAmount, { color: colors.secondary }]}>
              +{currencySymbol}1,000
            </Text>
          </View>

          {/* Bonus Terms */}
          <View style={[styles.bonusTerms, { backgroundColor: `${colors.primary}05` }]}>
            <Text style={[styles.bonusTermsTitle, { color: colors.primary }]}>
              💡 Bonus Terms
            </Text>
            <Text style={[styles.bonusTermsText, { color: colors.text }]}>
              • Bonuses are automatically credited to your account{'\n'}
              • First order bonus applies to your initial transaction{'\n'}
              • Volume bonuses stack with VIP rate bonuses{'\n'}
              • Referral rewards paid when friend completes first trade
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
  },
  bonusHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bonusTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  bonusContent: {
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: 12,
    padding: Spacing.md,
  },
  bonusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  bonusItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  bonusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusItemContent: {
    flex: 1,
  },
  bonusItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  bonusDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  bonusAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  bonusTerms: {
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  bonusTermsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  bonusTermsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});