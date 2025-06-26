import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Clock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import Card from '@/components/UI/Card';

export default function PromoTimer() {
  const { colors } = useTheme();
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((current) => {
        let { hours, minutes, seconds } = current;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Clock size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Limited Time Offer</Text>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={[styles.viewButtonText, { color: colors.primary }]}>View All</Text>
          <ArrowRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Get extra 5% bonus on all Steam gift cards
      </Text>

      <View style={styles.timerContainer}>
        <View style={[styles.timeBlock, { backgroundColor: colors.primary }]}>
          <Text style={styles.timeValue}>{String(timeLeft.hours).padStart(2, '0')}</Text>
          <Text style={styles.timeLabel}>Hours</Text>
        </View>
        <Text style={[styles.timeSeparator, { color: colors.primary }]}>:</Text>
        <View style={[styles.timeBlock, { backgroundColor: colors.primary }]}>
          <Text style={styles.timeValue}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
          <Text style={styles.timeLabel}>Minutes</Text>
        </View>
        <Text style={[styles.timeSeparator, { color: colors.primary }]}>:</Text>
        <View style={[styles.timeBlock, { backgroundColor: colors.primary }]}>
          <Text style={styles.timeValue}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
          <Text style={styles.timeLabel}>Seconds</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.actionButtonText}>Trade Now</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
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
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Spacing.xs,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  timeBlock: {
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  timeSeparator: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginHorizontal: Spacing.sm,
  },
  actionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});