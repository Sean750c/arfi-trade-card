import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Gift, ArrowDownLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

// Sample transaction data
const transactions = [
  {
    id: '1',
    type: 'gift_card',
    amount: '₦25,000',
    status: 'success',
    date: '2 hours ago',
    description: 'Steam Gift Card',
    cardValue: '$40',
  },
  {
    id: '2',
    type: 'gift_card',
    amount: '₦12,500',
    status: 'pending',
    date: 'Yesterday',
    description: 'Amazon Gift Card',
    cardValue: '$20',
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: '₦35,000',
    status: 'success',
    date: '3 days ago',
    description: 'Bank Withdrawal',
    cardValue: null,
  },
];

export default function RecentTransactions() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} color={colors.success} />;
      case 'pending':
        return <Clock size={16} color={colors.warning} />;
      case 'failed':
        return <AlertCircle size={16} color={colors.error} />;
      default:
        return null;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'gift_card':
        return <Gift size={20} color={colors.primary} />;
      case 'withdrawal':
        return <ArrowDownLeft size={20} color={colors.secondary} />;
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: typeof transactions[0] }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
          borderColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/(tabs)/wallet/transaction/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: `${item.type === 'gift_card' ? colors.primary : colors.secondary}15` }
      ]}>
        {getIconForType(item.type)}
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <Text style={[styles.transactionDesc, { color: colors.text }]}>
            {item.description}
          </Text>
          {item.cardValue && (
            <Text style={[styles.cardValue, { color: colors.textSecondary }]}>
              {item.cardValue}
            </Text>
          )}
        </View>
        <View style={styles.transactionMeta}>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text
              style={[
                styles.transactionStatus,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.amount.includes('+') ? colors.success : colors.primary },
          ]}
        >
          {item.amount}
        </Text>
        <ArrowRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/(tabs)/wallet')}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          <ArrowRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.transactionsList}>
        {transactions.map((item) => (
          <View key={item.id}>
            {renderItem({ item })}
          </View>
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
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDesc: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cardValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  amountContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});