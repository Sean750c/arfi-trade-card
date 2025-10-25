import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradientColors: string[];
  iconBg: string;
}

function StatCard({ icon, value, label, gradientColors, iconBg }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <View style={[styles.iconInner, { backgroundColor: iconBg }]}>
          {icon}
        </View>
      </LinearGradient>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function TodayStats() {
  const { colors } = useTheme();

  const stats = [
    {
      icon: <DollarSign size={20} color="#10B981" strokeWidth={2.5} />,
      value: '$125K+',
      label: 'Today Volume',
      gradientColors: ['#10B98120', '#10B98130'],
      iconBg: '#10B98115',
    },
    {
      icon: <Users size={20} color="#3B82F6" strokeWidth={2.5} />,
      value: '2,450+',
      label: 'Active Users',
      gradientColors: ['#3B82F620', '#3B82F630'],
      iconBg: '#3B82F615',
    },
    {
      icon: <TrendingUp size={20} color="#F59E0B" strokeWidth={2.5} />,
      value: '98.5%',
      label: 'Success Rate',
      gradientColors: ['#F59E0B20', '#F59E0B30'],
      iconBg: '#F59E0B15',
    },
    {
      icon: <Zap size={20} color="#8B5CF6" strokeWidth={2.5} />,
      value: '< 2 min',
      label: 'Avg. Speed',
      gradientColors: ['#8B5CF620', '#8B5CF630'],
      iconBg: '#8B5CF615',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Today's Highlights</Text>
        <View style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}>
          <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>LIVE</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
