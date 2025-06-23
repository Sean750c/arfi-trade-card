import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import PaymentMethodCard from './PaymentMethodCard';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { Plus } from 'lucide-react-native';
import type { PaymentMethod, PaymentAccount, AvailablePaymentMethod } from '@/types';

interface UserPaymentListProps {
  paymentMethods: PaymentMethod[];
  onSelect: (account: PaymentAccount) => void;
  onAdd: () => void;
  showAddButton?: boolean;
  style?: any;
  loading?: boolean;
}

const UserPaymentList: React.FC<UserPaymentListProps> = ({
  paymentMethods,
  onSelect,
  onAdd,
  showAddButton = true,
  style,
  loading = false,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>收款方式</Text>
        {showAddButton && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={onAdd}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>添加</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={{ alignItems: 'center', padding: 32 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>加载中...</Text>
        </View>
      ) : paymentMethods.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>暂无收款方式</Text>
          <Button title="添加收款方式" onPress={onAdd} style={styles.emptyActionButton} />
        </View>
      ) : (
        <ScrollView style={styles.paymentMethodsList}>
          {paymentMethods.map((method) => (
            <View key={method.payment_id} style={styles.methodGroup}>
              <View style={styles.methodHeader}>
                <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
              </View>
              {method.data_list.map((account) => (
                <PaymentMethodCard
                  key={account.bank_id}
                  account={account}
                  methodType={method.code}
                  onSelect={() => onSelect(account)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default UserPaymentList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyActionButton: {
    paddingHorizontal: Spacing.xl,
  },
  paymentMethodsList: {
    gap: Spacing.lg,
  },
  methodGroup: {
    gap: Spacing.sm,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  methodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 