import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Gift, TrendingUp, Users, CreditCard, Zap, ChartBar as BarChart3 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

type QuickActionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  color: string;
};

export default function QuickActions() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const actions: QuickActionItem[] = [
    {
      id: '1',
      title: 'Sell Card',
      subtitle: 'Trade instantly',
      icon: <Gift size={24} color="#FFFFFF" />,
      route: '/(tabs)/sell',
      color: colors.primary,
    },
    {
      id: '2',
      title: 'Rates',
      subtitle: 'Live rates',
      icon: <TrendingUp size={24} color="#FFFFFF" />,
      route: '/rates',
      color: '#8B5CF6',
    },
    {
      id: '3',
      title: 'Refer',
      subtitle: 'Earn rewards',
      icon: <Users size={24} color="#FFFFFF" />,
      route: '/refer',
      color: '#8B5CF6',
    },
    {
      id: '4',
      title: 'Wallet',
      subtitle: 'Manage funds',
      icon: <CreditCard size={24} color="#FFFFFF" />,
      route: '/(tabs)/wallet',
      color: '#F59E0B',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Zap size={16} color={colors.primary} />
          <Text style={[styles.viewAllText, { color: colors.primary }]}>Fast Trade</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionItem,
              { backgroundColor: action.color },
            ]}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.8}
          >
            <View style={styles.actionContent}>
              <View style={styles.iconContainer}>
                {action.icon}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
            </View>
            <View style={styles.actionIndicator} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  actionItem: {
    width: '48%',
    borderRadius: 16,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 100,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 20,
  },
});