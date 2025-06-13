import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface TransactionFiltersProps {
  activeType: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip';
  onTypeChange: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => void;
}

export default function TransactionFilters({ activeType, onTypeChange }: TransactionFiltersProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'order', label: 'Orders' },
    { id: 'withdraw', label: 'Withdrawals' },
    { id: 'transfer', label: 'Transfers' },
    { id: 'recommend', label: 'Referrals' },
    { id: 'vip', label: 'VIP Bonuses' },
  ] as const;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeType === filter.id ? colors.primary : 'transparent',
              borderColor: activeType === filter.id ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onTypeChange(filter.id)}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: activeType === filter.id ? '#FFFFFF' : colors.text,
              },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});