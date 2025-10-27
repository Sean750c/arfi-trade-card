import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Tag, Gift, Calculator, Sparkles, ChevronRight, Info } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';

interface EarningsEstimatorProps {
  hasVIPBonus: boolean;
  hasCoupon: boolean;
  firstOrderBonus: number;
  vipBonusPercent?: string;
  onVIPPress?: () => void;
  onCouponPress?: () => void;
}

export default function EarningsEstimator({
  hasVIPBonus,
  hasCoupon,
  firstOrderBonus,
  vipBonusPercent = '0.0',
  onVIPPress,
  onCouponPress,
}: EarningsEstimatorProps) {
  const { colors } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const { user } = useAuthStore();

  const activeBoosts = [hasVIPBonus, hasCoupon, firstOrderBonus > 0].filter(Boolean).length;
  const totalBoosts = 3;

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Calculator size={18} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Earnings Boosts
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {activeBoosts} of {totalBoosts} active
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowInfo(!showInfo)}
            style={[styles.infoButton, { backgroundColor: colors.background }]}
          >
            <Info size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showInfo && (
          <View style={[styles.infoBox, { backgroundColor: colors.primary + '08' }]}>
            <Info size={14} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Activate these boosts to increase your actual earnings when you sell cards
            </Text>
          </View>
        )}

        <View style={styles.boosts}>
          {/* VIP Boost */}
          {hasVIPBonus ? (
            <TouchableOpacity style={[styles.boostItem, { backgroundColor: colors.background }]} onPress={onVIPPress}>
              <View style={styles.boostLeft}>
                <View style={[styles.boostIcon, { backgroundColor: '#F59E0B15' }]}>
                  <Crown size={16} color="#F59E0B" strokeWidth={2.5} />
                </View>
                <View style={styles.boostText}>
                  <Text style={[styles.boostName, { color: colors.text }]}>
                    VIP Member
                  </Text>
                  <Text style={[styles.boostValue, { color: '#F59E0B' }]}>
                    +{vipBonusPercent}% on all orders
                  </Text>
                </View>
              </View>
              <View style={[styles.activeBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </TouchableOpacity>
          ) : (
            onVIPPress && (
              <TouchableOpacity
                style={[styles.boostItem, styles.inactiveBoost, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={onVIPPress}
              >
                <View style={styles.boostLeft}>
                  <View style={[styles.boostIcon, { backgroundColor: '#F59E0B15' }]}>
                    <Crown size={16} color="#F59E0B" strokeWidth={2.5} />
                  </View>
                  <View style={styles.boostText}>
                    <Text style={[styles.boostName, { color: colors.text }]}>
                      Become VIP
                    </Text>
                    <Text style={[styles.boostValue, { color: colors.textSecondary }]}>
                      Get up to +5% extra
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )
          )}

          {/* Coupon Boost */}
          {hasCoupon ? (
            <View style={[styles.boostItem, { backgroundColor: colors.background }]}>
              <View style={styles.boostLeft}>
                <View style={[styles.boostIcon, { backgroundColor: '#10B98115' }]}>
                  <Tag size={16} color="#10B981" strokeWidth={2.5} />
                </View>
                <View style={styles.boostText}>
                  <Text style={[styles.boostName, { color: colors.text }]}>
                    Coupon Applied
                  </Text>
                  <Text style={[styles.boostValue, { color: '#10B981' }]}>
                    Extra bonus on this order
                  </Text>
                </View>
              </View>
              <View style={[styles.activeBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
          ) : (
            onCouponPress && (
              <TouchableOpacity
                style={[styles.boostItem, styles.inactiveBoost, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={onCouponPress}
              >
                <View style={styles.boostLeft}>
                  <View style={[styles.boostIcon, { backgroundColor: '#10B98115' }]}>
                    <Tag size={16} color="#10B981" strokeWidth={2.5} />
                  </View>
                  <View style={styles.boostText}>
                    <Text style={[styles.boostName, { color: colors.text }]}>
                      Use Coupon
                    </Text>
                    <Text style={[styles.boostValue, { color: colors.textSecondary }]}>
                      Get instant discount
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )
          )}

          {/* First Order Boost */}
          {firstOrderBonus > 0 && (
            <View style={[styles.boostItem, { backgroundColor: colors.background }]}>
              <View style={styles.boostLeft}>
                <View style={[styles.boostIcon, { backgroundColor: '#EF444415' }]}>
                  <Sparkles size={16} color="#EF4444" strokeWidth={2.5} />
                </View>
                <View style={styles.boostText}>
                  <Text style={[styles.boostName, { color: colors.text }]}>
                    First Order Bonus
                  </Text>
                  <Text style={[styles.boostValue, { color: '#EF4444' }]}>
                    +{user?.currency_symbol}{firstOrderBonus} welcome gift
                  </Text>
                </View>
              </View>
              <View style={[styles.activeBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
          )}
        </View>

        {activeBoosts > 0 && (
          <LinearGradient
            colors={[colors.primary + '15', colors.primary + '08']}
            style={styles.summary}
          >
            <Sparkles size={16} color={colors.primary} strokeWidth={2.5} />
            <Text style={[styles.summaryText, { color: colors.primary }]}>
              {activeBoosts} boost{activeBoosts > 1 ? 's' : ''} will be applied to your order
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
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  boosts: {
    gap: Spacing.sm,
  },
  boostItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
  },
  inactiveBoost: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  boostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  boostIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostText: {
    flex: 1,
  },
  boostName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  boostValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
