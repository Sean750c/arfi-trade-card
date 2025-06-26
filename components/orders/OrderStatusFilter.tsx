import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
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
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: activeStatus === 'all' ? colors.primary : 'transparent',
            borderColor: colors.border,
          },
        ]}
        onPress={() => onStatusChange('all')}
      >
        <Text
          style={[
            styles.filterText,
            { color: activeStatus === 'all' ? '#FFFFFF' : colors.text },
          ]}
        >
          All
        </Text>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: activeStatus === 'all' ? 'rgba(255, 255, 255, 0.2)' : `${colors.primary}15`,
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: activeStatus === 'all' ? '#FFFFFF' : colors.primary },
            ]}
          >
            {stats.all}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: activeStatus === 'inprocess' ? colors.warning : 'transparent',
            borderColor: colors.border,
          },
        ]}
        onPress={() => onStatusChange('inprocess')}
      >
        <Text
          style={[
            styles.filterText,
            { color: activeStatus === 'inprocess' ? '#FFFFFF' : colors.text },
          ]}
        >
          In Process
        </Text>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: activeStatus === 'inprocess' ? 'rgba(255, 255, 255, 0.2)' : `${colors.warning}15`,
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: activeStatus === 'inprocess' ? '#FFFFFF' : colors.warning },
            ]}
          >
            {stats.inprocess}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: activeStatus === 'done' ? colors.success : 'transparent',
            borderColor: colors.border,
          },
        ]}
        onPress={() => onStatusChange('done')}
      >
        <Text
          style={[
            styles.filterText,
            { color: activeStatus === 'done' ? '#FFFFFF' : colors.text },
          ]}
        >
          Completed
        </Text>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: activeStatus === 'done' ? 'rgba(255, 255, 255, 0.2)' : `${colors.success}15`,
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: activeStatus === 'done' ? '#FFFFFF' : colors.success },
            ]}
          >
            {stats.done}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
});