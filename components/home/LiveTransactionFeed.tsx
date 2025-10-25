import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  username: string;
  amount: string;
  currency: string;
  timeAgo: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', username: 'John ***', amount: '50', currency: 'USD', timeAgo: '2 mins ago' },
  { id: '2', username: 'Sarah ***', amount: '100', currency: 'EUR', timeAgo: '5 mins ago' },
  { id: '3', username: 'Mike ***', amount: '75', currency: 'USD', timeAgo: '8 mins ago' },
  { id: '4', username: 'Lisa ***', amount: '120', currency: 'GBP', timeAgo: '12 mins ago' },
  { id: '5', username: 'David ***', amount: '80', currency: 'USD', timeAgo: '15 mins ago' },
];

export default function LiveTransactionFeed() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 50,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      setCurrentIndex((prevIndex) => (prevIndex + 1) % MOCK_TRANSACTIONS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim]);

  const currentTransaction = MOCK_TRANSACTIONS[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={[styles.liveBadge, { backgroundColor: '#10B981' }]}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <TrendingUp size={16} color={colors.primary} strokeWidth={2.5} />
      </View>

      <Animated.View
        style={[
          styles.transactionContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.transactionRow}>
          <View style={styles.transactionInfo}>
            <View style={styles.iconContainer}>
              <CheckCircle size={20} color="#10B981" strokeWidth={2.5} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.username, { color: colors.text }]}>
                {currentTransaction.username}
              </Text>
              <Text style={[styles.details, { color: colors.textSecondary }]}>
                successfully sold{' '}
                <Text style={[styles.amount, { color: colors.primary }]}>
                  ${currentTransaction.amount} {currentTransaction.currency}
                </Text>
              </Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {currentTransaction.timeAgo}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  transactionContent: {
    minHeight: 50,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B98115',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
    lineHeight: 16,
  },
  amount: {
    fontWeight: '700',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
