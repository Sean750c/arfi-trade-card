import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowUpRight, ArrowDownRight, Gift, Filter } from 'lucide-react-native';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

// Sample transaction data
const transactions = [
  {
    id: '1',
    type: 'withdrawal',
    amount: '-₦35,000',
    status: 'success',
    date: '2023-06-18',
    time: '14:30',
    description: 'Withdrawal to Bank',
  },
  {
    id: '2',
    type: 'gift_card',
    amount: '+₦25,000',
    status: 'success',
    date: '2023-06-17',
    time: '10:15',
    description: 'Steam Gift Card',
  },
  {
    id: '3',
    type: 'gift_card',
    amount: '+₦12,500',
    status: 'pending',
    date: '2023-06-16',
    time: '16:45',
    description: 'Amazon Gift Card',
  },
  {
    id: '4',
    type: 'withdrawal',
    amount: '-₦20,000',
    status: 'success',
    date: '2023-06-15',
    time: '09:00',
    description: 'Withdrawal to Bank',
  },
  {
    id: '5',
    type: 'gift_card',
    amount: '+₦15,000',
    status: 'success',
    date: '2023-06-14',
    time: '11:30',
    description: 'iTunes Gift Card',
  },
];

export default function WalletScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [activeTab, setActiveTab] = useState('NGN');
  
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
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return <ArrowUpRight size={20} color={colors.error} />;
      case 'gift_card':
        return <Gift size={20} color={colors.success} />;
      default:
        return <ArrowDownRight size={20} color={colors.success} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === 'NGN' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('NGN')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'NGN' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            NGN Wallet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === 'USDT' ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('USDT')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'USDT' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            USDT Wallet
          </Text>
        </TouchableOpacity>
      </View>
      
      <Card style={styles.balanceCard}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          Available Balance
        </Text>
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          {activeTab === 'NGN' ? '₦120,500.00' : 'USDT 215.75'}
        </Text>
        
        <View style={styles.rebateContainer}>
          <Text style={[styles.rebateLabel, { color: colors.textSecondary }]}>
            Rebate Balance:
          </Text>
          <Text style={[styles.rebateAmount, { color: colors.primary }]}>
            {activeTab === 'NGN' ? '₦1,250.00' : 'USDT 0.00'}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Deposit"
            style={styles.actionButton}
            onPress={() => router.push('/wallet/deposit')}
          />
          <Button
            title="Withdraw"
            variant="outline"
            style={styles.actionButton}
            onPress={() => router.push('/wallet/withdraw')}
          />
        </View>
      </Card>
      
      <View style={styles.transactionsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Transaction History
        </Text>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' },
          ]}
        >
          <Filter size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.transactionItem,
              { borderBottomColor: colors.border },
            ]}
            onPress={() => router.push(`/wallet/transaction/${item.id}`)}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    item.type === 'withdrawal'
                      ? `${colors.error}15`
                      : `${colors.success}15`,
                },
              ]}
            >
              {getTypeIcon(item.type)}
            </View>
            
            <View style={styles.transactionDetails}>
              <Text style={[styles.transactionDescription, { color: colors.text }]}>
                {item.description}
              </Text>
              <Text
                style={[styles.transactionDate, { color: colors.textSecondary }]}
              >
                {item.date} • {item.time}
              </Text>
            </View>
            
            <View style={styles.transactionAmount}>
              <Text
                style={[
                  styles.amountText,
                  {
                    color:
                      item.amount.includes('+') ? colors.success : colors.error,
                  },
                ]}
              >
                {item.amount}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.transactionsList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.sm,
    marginRight: Spacing.xl,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  rebateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rebateLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: Spacing.xs,
  },
  rebateAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionsList: {
    paddingHorizontal: Spacing.lg,
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
  transactionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
});