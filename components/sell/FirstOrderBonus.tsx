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
        <Sparkles
          size={14}
          color="rgba(255, 255, 255, 0.25)"
          strokeWidth={2}
          style={styles.sparkleLeft}
        />
        <Sparkles
          size={12}
          color="rgba(255, 255, 255, 0.2)"
          strokeWidth={2}
          style={styles.sparkleRight}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Gift size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.headerText}>
              <View style={styles.badge}>
                <Sparkles size={8} color="#EF4444" strokeWidth={3} />
                <Text style={styles.badgeText}>FIRST ORDER</Text>
              </View>
              <Text style={styles.title}>Welcome Bonus</Text>
            </View>
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusAmount}>+{user?.currency_symbol}{bonusAmount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.checkIcon}>
                <Sparkles size={10} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.featureText}>Auto-applied • No minimum</Text>
            </View>
          </View>
        </View>

        <View style={styles.decorativeCircle} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  sparkleLeft: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  sparkleRight: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bonusContainer: {
    alignItems: 'flex-end',
  },
  bonusAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 26,
  },
  bonusPercentage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 12,
    fontWeight: '600',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -30,
    right: -20,
  },
});
