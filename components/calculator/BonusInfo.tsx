import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Gift, Star, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { AmountOrderBonus } from '@/types/api';

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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
            Available Bonuses
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
          {firstOrderBonus > 0 && (
            <View style={[styles.bonusItem, { borderBottomColor: colors.border }]}>
              <View style={styles.bonusItemHeader}>
                <Star size={16} color={colors.warning} />
                <Text style={[styles.bonusItemTitle, { color: colors.text }]}>
                  First Order Bonus
                </Text>
              </View>
              <Text style={[styles.bonusAmount, { color: colors.success }]}>
                {currencySymbol}{firstOrderBonus}
              </Text>
            </View>
          )}
          
          {amountOrderBonus.bonus_amount > 0 && (
            <View style={styles.bonusItem}>
              <View style={styles.bonusItemHeader}>
                <Gift size={16} color={colors.primary} />
                <Text style={[styles.bonusItemTitle, { color: colors.text }]}>
                  Volume Bonus
                </Text>
              </View>
              <View style={styles.volumeBonusDetails}>
                <Text style={[styles.bonusAmount, { color: colors.success }]}>
                  {currencySymbol}{amountOrderBonus.bonus_amount}
                </Text>
                <Text style={[styles.bonusRequirement, { color: colors.textSecondary }]}>
                  On orders ≥ {currencySymbol}{amountOrderBonus.order_amount}
                </Text>
              </View>
            </View>
          )}
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
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  bonusItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bonusItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  bonusAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  volumeBonusDetails: {
    alignItems: 'flex-end',
  },
  bonusRequirement: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
});