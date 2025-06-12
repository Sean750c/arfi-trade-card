import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface TransactionFiltersProps {
  activeType: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip';
  onTypeChange: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => void;
}

export default function TransactionFilters({
  activeType,
  onTypeChange,
}: TransactionFiltersProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const filterTypes = [
    { key: 'all', label: 'All' },
    { key: 'order', label: 'Orders' },
    { key: 'withdraw', label: 'Withdrawals' },
    { key: 'transfer', label: 'Transfers' },
    { key: 'recommend', label: 'Referrals' },
    { key: 'vip', label: 'VIP' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Filter size={16} color={colors.text} />
          <Text style={[styles.title, { color: colors.text }]}>
            Filter by Type
          </Text>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filterTypes.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: activeType === filter.key 
                  ? colors.primary 
                  : colorScheme === 'dark' ? colors.card : '#F9FAFB',
                borderColor: activeType === filter.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onTypeChange(filter.key as any)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: activeType === filter.key ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  filtersContainer: {
    gap: Spacing.xs,
    paddingRight: Spacing.lg,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});