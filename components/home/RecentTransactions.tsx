import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Gift, ArrowDownLeft } from 'lucide-react-native';
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
  },
  {
    id: '2',
    type: 'gift_card',
    amount: '₦12,500',
    status: 'pending',
    date: 'Yesterday',
    description: 'Amazon Gift Card',
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: '₦35,000',
    status: 'success',
    date: '3 days ago',
    description: 'Bank Withdrawal',
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

  const getIconForType = (type: string) => {
    switch (type) {
      case 'gift_card':
        return <Gift size={20} color={colors.secondary} />;
      case 'withdrawal':
        return <ArrowDownLeft size={20} color={colors.primary} />;
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: typeof transactions[0] }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={() => router.push(`/(tabs)/wallet/transaction/${item.id}`)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}15` }]}>
        {getIconForType(item.type)}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionDesc, { color: colors.text }]}>{item.description}</Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{item.date}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: getStatusColor(item.status) },
          ]}
        >
          {item.amount}
        </Text>
        <Text
          style={[
            styles.transactionStatus,
            { color: getStatusColor(item.status) },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/(tabs)/wallet/transactions')}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          <ArrowRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
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
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: Spacing.xs,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
});