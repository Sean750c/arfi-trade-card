import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Gift } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';

interface FirstOrderBonusProps {
  bonusAmount: number;
}

export default function FirstOrderBonus({
  bonusAmount,
}: FirstOrderBonusProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EF4444', '#DC2626']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.sparkleLeft}>
          <Sparkles size={20} color="rgba(255, 255, 255, 0.3)" strokeWidth={2} />
        </View>
        <View style={styles.sparkleRight}>
          <Sparkles size={16} color="rgba(255, 255, 255, 0.2)" strokeWidth={2} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Gift size={28} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.headerText}>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Sparkles size={10} color="#EF4444" strokeWidth={3} />
                  <Text style={styles.badgeText}>NEW USER</Text>
                </View>
                <View style={styles.hotBadge}>
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              </View>
              <Text style={styles.title}>First Order Bonus!</Text>
            </View>
          </View>

          <View style={styles.bonusSection}>
            <View style={styles.bonusLeft}>
              <Text style={styles.bonusLabel}>You Get Extra</Text>
              <View style={styles.amountRow}>
                <Text style={styles.bonusAmount}>+{bonusAmount.toFixed(2)}</Text>
              </View>
              <Text style={styles.bonusDesc}>on your first transaction</Text>
            </View>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.checkIcon}>
                <Sparkles size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.featureText}>No minimum required</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.checkIcon}>
                <Sparkles size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.featureText}>Auto-applied at checkout</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.checkIcon}>
                <Sparkles size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.featureText}>One-time welcome gift</Text>
            </View>
          </View>
        </View>

        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sparkleLeft: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
  },
  sparkleRight: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hotBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bonusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bonusLeft: {
    flex: 1,
  },
  bonusLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  bonusAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bonusDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
  },
  features: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    marginTop: Spacing.xs,
  },
  learnMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -50,
    right: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    top: -20,
    right: 80,
  },
});
