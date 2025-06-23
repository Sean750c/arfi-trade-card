import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import PaymentMethodCard from './PaymentMethodCard';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { X } from 'lucide-react-native';
import type { PaymentMethod, PaymentAccount } from '@/types';

interface UserPaymentListProps {
  visible: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[];
  onSelect: (account: PaymentAccount) => void;
  onAdd: () => void;
  loading?: boolean;
}

const UserPaymentList: React.FC<UserPaymentListProps> = ({
  visible,
  onClose,
  paymentMethods,
  onSelect,
  onAdd,
  loading = false,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // 判断所有data_list是否都为空
  const allEmpty = paymentMethods.length === 0 || paymentMethods.every(m => !m.data_list || m.data_list.length === 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Payment Methods</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ alignItems: 'center', padding: 32 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading...</Text>
            </View>
          ) : allEmpty ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No payment methods</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>Please add a payment method to proceed with withdrawal.</Text>
              <Button title="Add New" onPress={onAdd} style={styles.emptyActionButton} />
            </View>
          ) : (
            <ScrollView style={styles.paymentMethodsList}>
              {paymentMethods.map((method) => (
                method.data_list && method.data_list.length > 0 && (
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
                )
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default UserPaymentList;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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