import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Gift, ChartBar as BarChart3, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

type QuickActionItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: string;
};

export default function QuickActions() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const actions: QuickActionItem[] = [
    {
      id: '1',
      title: 'Sell Card',
      icon: <Gift size={24} color={colors.primary} />,
      route: '/(tabs)/sell',
    },
    {
      id: '2',
      title: 'Rates',
      icon: <BarChart3 size={24} color={colors.primary} />,
      route: '/rates',
    },
    {
      id: '3',
      title: 'Refer',
      icon: <Users size={24} color={colors.primary} />,
      route: '/refer',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionItem,
              { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' },
            ]}
            onPress={() => router.push(action.route)}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              {action.icon}
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionItem: {
    width: '31%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});