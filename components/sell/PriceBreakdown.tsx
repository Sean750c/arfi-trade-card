import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Tag, Gift, TrendingUp, Sparkles, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface PriceBreakdownProps {
  baseAmount: number;
  vipBonus?: number;
  couponDiscount?: number;
  activityBonus?: number;
  firstOrderBonus?: number;
  currency?: string;
  onVIPPress?: () => void;
  onCouponPress?: () => void;
  onActivityPress?: () => void;
}

export default function PriceBreakdown({
  baseAmount,
  vipBonus = 0,
  couponDiscount = 0,
  activityBonus = 0,
  firstOrderBonus = 0,
  currency = 'USD',
  onVIPPress,
  onCouponPress,
  onActivityPress,
}: PriceBreakdownProps) {
  const { colors } = useTheme();

  const totalBonus = vipBonus + couponDiscount + activityBonus + firstOrderBonus;
  const finalAmount = baseAmount + totalBonus;
  const bonusPercentage = baseAmount > 0 ? ((totalBonus / baseAmount) * 100).toFixed(1) : '0.0';

  const hasAnyBonus = totalBonus > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '15', colors.primary + '08']}
        style={styles.header}
      >
        <TrendingUp size={22} color={colors.primary} strokeWidth={2.5} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Your Earnings Breakdown
        </Text>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.card }]}>
        {/* Base Amount */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Base Amount</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            ${baseAmount.toFixed(2)}
          </Text>
        </View>

        {/* Bonuses Section */}
        {hasAnyBonus && (
          <View style={styles.bonusSection}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* VIP Bonus */}
            {vipBonus > 0 ? (
              <View style={styles.bonusRow}>
                <View style={styles.bonusLeft}>
                  <View style={[styles.bonusIcon, { backgroundColor: '#F59E0B15' }]}>
                    <Crown size={16} color="#F59E0B" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={[styles.bonusLabel, { color: colors.text }]}>
                      VIP Bonus
                    </Text>
                    <Text style={[styles.bonusDesc, { color: colors.textSecondary }]}>
                      Member privilege
                    </Text>
                  </View>
                </View>
                <Text style={[styles.bonusValue, { color: '#F59E0B' }]}>
                  +${vipBonus.toFixed(2)}
                </Text>
              </View>
            ) : (
              onVIPPress && (
                <TouchableOpacity style={styles.bonusRow} onPress={onVIPPress}>
                  <View style={styles.bonusLeft}>
                    <View style={[styles.bonusIcon, { backgroundColor: '#F59E0B15' }]}>
                      <Crown size={16} color="#F59E0B" strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bonusLabel, { color: colors.text }]}>
                        Activate VIP
                      </Text>
                      <Text style={[styles.bonusDesc, { color: '#F59E0B' }]}>
                        Earn up to +5% more
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )
            )}

            {/* Coupon Discount */}
            {couponDiscount > 0 ? (
              <View style={styles.bonusRow}>
                <View style={styles.bonusLeft}>
                  <View style={[styles.bonusIcon, { backgroundColor: '#10B98115' }]}>
                    <Tag size={16} color="#10B981" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={[styles.bonusLabel, { color: colors.text }]}>
                      Coupon Applied
                    </Text>
                    <Text style={[styles.bonusDesc, { color: colors.textSecondary }]}>
                      Limited time offer
                    </Text>
                  </View>
                </View>
                <Text style={[styles.bonusValue, { color: '#10B981' }]}>
                  +${couponDiscount.toFixed(2)}
                </Text>
              </View>
            ) : (
              onCouponPress && (
                <TouchableOpacity style={styles.bonusRow} onPress={onCouponPress}>
                  <View style={styles.bonusLeft}>
                    <View style={[styles.bonusIcon, { backgroundColor: '#10B98115' }]}>
                      <Tag size={16} color="#10B981" strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bonusLabel, { color: colors.text }]}>
                        Apply Coupon
                      </Text>
                      <Text style={[styles.bonusDesc, { color: '#10B981' }]}>
                        Get extra discount
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )
            )}

            {/* Activity Bonus */}
            {activityBonus > 0 && (
              <View style={styles.bonusRow}>
                <View style={styles.bonusLeft}>
                  <View style={[styles.bonusIcon, { backgroundColor: '#8B5CF615' }]}>
                    <Gift size={16} color="#8B5CF6" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={[styles.bonusLabel, { color: colors.text }]}>
                      Activity Bonus
                    </Text>
                    <Text style={[styles.bonusDesc, { color: colors.textSecondary }]}>
                      Special promotion
                    </Text>
                  </View>
                </View>
                <Text style={[styles.bonusValue, { color: '#8B5CF6' }]}>
                  +${activityBonus.toFixed(2)}
                </Text>
              </View>
            )}

            {/* First Order Bonus */}
            {firstOrderBonus > 0 && (
              <View style={styles.bonusRow}>
                <View style={styles.bonusLeft}>
                  <View style={[styles.bonusIcon, { backgroundColor: '#EF444415' }]}>
                    <Sparkles size={16} color="#EF4444" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={[styles.bonusLabel, { color: colors.text }]}>
                      First Order Bonus
                    </Text>
                    <Text style={[styles.bonusDesc, { color: colors.textSecondary }]}>
                      Welcome gift
                    </Text>
                  </View>
                </View>
                <Text style={[styles.bonusValue, { color: '#EF4444' }]}>
                  +${firstOrderBonus.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Total */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.totalRow}>
          <View>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              You Will Receive
            </Text>
            {hasAnyBonus && (
              <Text style={[styles.savingsText, { color: colors.primary }]}>
                +{bonusPercentage}% bonus included
              </Text>
            )}
          </View>
          <View style={styles.totalRight}>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${finalAmount.toFixed(2)}
            </Text>
            <Text style={[styles.currency, { color: colors.textSecondary }]}>
              {currency}
            </Text>
          </View>
        </View>

        {/* Highlight Banner */}
        {hasAnyBonus && (
          <LinearGradient
            colors={[colors.primary + '15', colors.primary + '08']}
            style={styles.highlightBanner}
          >
            <Sparkles size={16} color={colors.primary} strokeWidth={2.5} />
            <Text style={[styles.highlightText, { color: colors.primary }]}>
              You're earning ${totalBonus.toFixed(2)} extra!
            </Text>
          </LinearGradient>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: {
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  bonusSection: {
    gap: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  bonusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  bonusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  bonusDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  bonusValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  totalRight: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  currency: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  highlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
