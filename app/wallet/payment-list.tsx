import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { useTheme } from '@/theme/ThemeContext';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { PaymentService } from '@/services/payment';
import Spacing from '@/constants/Spacing';
import type { PaymentMethod, PaymentAccount, AvailablePaymentMethod } from '@/types';
import PaymentMethodCard from '@/components/wallet/PaymentMethodCard';
import Button from '@/components/UI/Button';
import { router, useRouter } from 'expo-router';
import AddPaymentMethodModal from '@/components/wallet/AddPaymentMethodModal';

export default function PaymentListScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { activeWalletType, setSelectedWithdrawAccount } = useWalletStore();
  const router = useRouter();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchData();
      fetchAvailableMethods();
    }
  }, [user?.token, activeWalletType]);

  const fetchData = async () => {
    if (!user?.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const methods = await PaymentService.getPaymentMethods({
        token: user.token,
        type: activeWalletType,
      });
      setPaymentMethods(methods);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableMethods = async () => {
    if (!user?.token) return;
    try {
      const methods = await PaymentService.getAvailablePaymentMethods({
        token: user.token,
        type: activeWalletType,
        country_id: user.country_id,
      });
      setAvailablePaymentMethods(methods);
    } catch {}
  };

  const handleAdd = () => {
    setShowAddPaymentModal(true);
  };

  const handlePaymentMethodAdded = () => {
    setShowAddPaymentModal(false);
    fetchData();
  };

  // 查找默认PaymentAccount
  function getDefaultAccount(paymentMethods: PaymentMethod[]): PaymentAccount | null {
    for (const method of paymentMethods) {
      if (method.data_list && method.data_list.length > 0) {
        const found = method.data_list.find((acc: PaymentAccount) => acc.is_def === 1);
        if (found) return found;
      }
    }
    return null;
  }

  function handleBack() {
    const defaultAccount = getDefaultAccount(paymentMethods);
    setSelectedWithdrawAccount(defaultAccount);
    router.back();
  }

  return (
    <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => handleBack()}
          style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>My Payment Methods</Text>
        </View>
        <TouchableOpacity
          onPress={handleAdd}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginLeft: 8 }}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Button title="Retry" onPress={fetchData} style={styles.retryButton} />
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {paymentMethods.length === 0 || paymentMethods.every(m => !m.data_list || m.data_list.length === 0) ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No payment methods</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>Please click the add button in the top right corner</Text>
              <Button title="Add New Method" onPress={handleAdd} style={styles.emptyActionButton} />
            </View>
          ) : (
            paymentMethods.map((method) => (
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
                      onSelect={() => {
                        setSelectedWithdrawAccount(account);
                        router.back();
                      }}
                      onSetDefault={fetchData}
                    />
                  ))}
                </View>
              )
            ))
          )}
        </ScrollView>
      )}

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        visible={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSuccess={handlePaymentMethodAdded}
        availablePaymentMethods={availablePaymentMethods}
        walletType={activeWalletType}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  list: {
    paddingHorizontal: Spacing.lg,
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
  methodGroup: {
    marginBottom: Spacing.lg,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  methodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 