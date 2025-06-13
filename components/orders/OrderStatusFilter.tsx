import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Clock, CheckCircle, CircleX } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

interface OrderStatusFilterProps {
  activeStatus: 'all' | 'inprocess' | 'done';
  onStatusChange: (status: 'all' | 'inprocess' | 'done') => void;
  stats: {
    all: number;
    inprocess: number;
    done: number;
  };
}

export default function OrderStatusFilter({
  activeStatus,
  onStatusChange,
  stats,
}: OrderStatusFilterProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const filters = [
    {
      key: 'all',
      label: 'All Orders',
      count: stats.all,
      icon: null,
    },
    {
      key: 'inprocess',
      label: 'In Process',
      count: stats.inprocess,
      icon: <Clock size={16} color={activeStatus === 'inprocess' ? '#FFFFFF' : colors.warning} />,
    },
    {
      key: 'done',
      label: 'Completed',
      count: stats.done,
      icon: <CheckCircle size={16} color={activeStatus === 'done' ? '#FFFFFF' : colors.success} />,
    },
  ];

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
        shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
      }
    ]}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeStatus === filter.key ? colors.primary : 'transparent',
              shadowColor: activeStatus === filter.key ? colors.primary : 'transparent',
              shadowOffset: activeStatus === filter.key ? { width: 0, height: 4 } : { width: 0, height: 0 },
              shadowOpacity: activeStatus === filter.key ? 0.3 : 0,
              shadowRadius: activeStatus === filter.key ? 8 : 0,
              elevation: activeStatus === filter.key ? 6 : 0,
            },
          ]}
          onPress={() => onStatusChange(filter.key as any)}
          activeOpacity={0.7}
        >
          <View style={styles.filterContent}>
            {filter.icon && (
              <View style={styles.filterIcon}>
                {filter.icon}
              </View>
            )}
            <View style={styles.filterTextContainer}>
              <Text
                style={[
                  styles.filterLabel,
                  {
                    color: activeStatus === filter.key ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
              <Text
                style={[
                  styles.filterCount,
                  {
                    color: activeStatus === filter.key ? 'rgba(255, 255, 255, 0.9)' : colors.textSecondary,
                  },
                ]}
              >
                {filter.count}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  filterIcon: {
    marginRight: Spacing.xs,
  },
  filterTextContainer: {
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  filterCount: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
});