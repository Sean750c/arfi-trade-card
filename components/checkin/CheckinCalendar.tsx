import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  CalendarDays,
  Clock,
  Star,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { CheckinRule, RewardType } from '@/types';
import RewardIcon from './RewardIcon';

interface CheckinCalendarProps {
  rules: CheckinRule[];
  onCheckin: (ruleId: number) => void;
  onMakeUpSign: (ruleId: number) => void;
  currentDisplayDate: string; // YYYY-MM-DD format
  onDateChange: (newDate: string) => void;
  isLoading: boolean;
  isCheckingIn: boolean;
  userPoints: number;
  currencySymbol: string;
  maxMakeUpSigns: number;
  usedMakeUpSigns: number;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CheckinCalendar({
  rules,
  onCheckin,
  onMakeUpSign,
  currentDisplayDate,
  onDateChange,
  isLoading,
  isCheckingIn,
  userPoints,
  currencySymbol,
  maxMakeUpSigns,
  usedMakeUpSigns,
}: CheckinCalendarProps) {
  const { colors } = useTheme();

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }, []);

  const currentDisplayMonthYear = useMemo(() => {
    const date = new Date(currentDisplayDate);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }, [currentDisplayDate]);

  const getDayStatus = (rule: CheckinRule, date: Date) => {
    const ruleDate = new Date(rule.date);
    ruleDate.setHours(0, 0, 0, 0); // Normalize to start of day
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);

    if (rule.is_checkin) {
      return 'signed'; // Already signed
    } else if (ruleDate.getTime() === todayDate.getTime()) {
      return 'today'; // Today's date, not signed
    } else if (ruleDate.getTime() < todayDate.getTime()) {
      return 'past'; // Past date, not signed
    } else {
      return 'future'; // Future date
    }
  };

  const handleDayPress = (rule: CheckinRule) => {
    const status = getDayStatus(rule, new Date(rule.date));
    if (status === 'today') {
      onCheckin(rule.id);
    } else if (status === 'past') {
      // Check if make-up signs are available
      if (usedMakeUpSigns < maxMakeUpSigns) {
        onMakeUpSign(rule.id);
      } else {
        // Optionally, show a message that no make-up signs are left
      }
    }
  };

  const renderDay = (rule: CheckinRule) => {
    const date = new Date(rule.date);
    const dayOfMonth = date.getDate();
    const status = getDayStatus(rule, date);

    const isClickable = (status === 'today' && !isCheckingIn) || (status === 'past' && usedMakeUpSigns < maxMakeUpSigns && !isCheckingIn);

    let dayStyle: any = {};
    let textStyle: any = { color: colors.text };
    let icon: React.ReactNode = null;

    switch (status) {
      case 'signed':
        dayStyle = { backgroundColor: `${colors.primary}15`, borderColor: colors.primary };
        textStyle = { color: colors.primary };
        icon = <CheckCircle size={16} color={colors.primary} />;
        break;
      case 'today':
        dayStyle = { backgroundColor: colors.primary, borderColor: colors.primary };
        textStyle = { color: '#FFFFFF' };
        icon = isCheckingIn ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
        );
        break;
      case 'past':
        dayStyle = { backgroundColor: colors.card, borderColor: colors.border };
        textStyle = { color: colors.textSecondary };
        if (!rule.is_checkin && usedMakeUpSigns < maxMakeUpSigns) {
          icon = <Clock size={16} color={colors.warning} />; // Make-up sign available
        } else {
          icon = <Clock size={16} color={colors.textSecondary} />; // Past, no make-up or already used
        }
        break;
      case 'future':
        dayStyle = { backgroundColor: colors.card, borderColor: colors.border };
        textStyle = { color: colors.textSecondary };
        icon = <CalendarDays size={16} color={colors.textSecondary} />;
        break;
    }

    return (
      <TouchableOpacity
        key={rule.id}
        style={[styles.dayContainer, dayStyle]}
        onPress={() => isClickable && handleDayPress(rule)}
        disabled={!isClickable}
      >
        <Text style={[styles.dayOfMonth, textStyle]}>{dayOfMonth}</Text>
        <View style={styles.rewardInfo}>
          <RewardIcon
            type={RewardType.POINTS}
            value={rule.base_reward}
            size={16}
            iconSize={10}
            fontSize={10}
            color={status === 'today' ? '#FFFFFF' : colors.primary}
            showValue={true}
          />
          {rule.extra_reward_type && rule.extra_reward && (
            <RewardIcon
              type={rule.extra_reward_type}
              value={rule.extra_reward}
              size={16}
              iconSize={10}
              fontSize={10}
              color={status === 'today' ? '#FFFFFF' : colors.warning}
              currencySymbol={currencySymbol}
              showValue={true}
            />
          )}
        </View>
        <View style={styles.dayStatusIcon}>{icon}</View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.navigationHeader}>
        <TouchableOpacity
          onPress={() => onDateChange('prev')}
          style={[styles.navButton, { backgroundColor: `${colors.primary}15` }]}
        >
          <ChevronLeft size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthYear, { color: colors.text }]}>
          {currentDisplayMonthYear}
        </Text>
        <TouchableOpacity
          onPress={() => onDateChange('next')}
          style={[styles.navButton, { backgroundColor: `${colors.primary}15` }]}
        >
          <ChevronRight size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={[styles.weekDayText, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading check-in data...
          </Text>
        </View>
      ) : (
        <View style={styles.daysGrid}>
          {rules.map(renderDay)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  weekDayText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    flex: 1,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  dayContainer: {
    flex: 1,
    aspectRatio: 0.85, // Slightly taller than square for better text layout
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    minHeight: 80,
  },
  dayOfMonth: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  rewardInfo: {
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dayStatusIcon: {
    marginTop: 4,
  },
  loadingContainer: {
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});