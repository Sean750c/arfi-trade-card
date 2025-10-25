import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Clock, Headphones, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface BadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function SecurityBadge({ icon, title, description, color }: BadgeProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

export default function SecurityBadges() {
  const { colors } = useTheme();

  const badges = [
    {
      icon: <Shield size={20} color="#10B981" strokeWidth={2.5} />,
      title: '100% Secure',
      description: 'Bank-level encryption',
      color: '#10B981',
    },
    {
      icon: <Clock size={20} color="#3B82F6" strokeWidth={2.5} />,
      title: 'Fast Payout',
      description: 'Within 5 minutes',
      color: '#3B82F6',
    },
    {
      icon: <Headphones size={20} color="#F59E0B" strokeWidth={2.5} />,
      title: '24/7 Support',
      description: 'Always here to help',
      color: '#F59E0B',
    },
    {
      icon: <CheckCircle size={20} color="#8B5CF6" strokeWidth={2.5} />,
      title: 'Guaranteed',
      description: 'Money-back promise',
      color: '#8B5CF6',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.primary}10`, `${colors.primary}05`]}
        style={styles.headerGradient}
      >
        <Shield size={24} color={colors.primary} strokeWidth={2.5} />
        <Text style={[styles.headerText, { color: colors.text }]}>
          Why Choose Us
        </Text>
      </LinearGradient>

      <View style={styles.badgesContainer}>
        {badges.map((badge, index) => (
          <SecurityBadge key={index} {...badge} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badgesContainer: {
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  trustText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
