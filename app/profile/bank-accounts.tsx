import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Plus, CreditCard, Star, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { PaymentService } from '@/services/payment';
import type { PaymentMethod, PaymentAccount, AvailablePaymentMethod } from '@/types';
import AddPaymentMethodModal from '@/components/wallet/AddPaymentMethodModal';
import { useTheme } from '@/theme/ThemeContext';

function BankAccountsScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeWalletType, setActiveWalletType] = useState<'1' | '2'>('1');
  const [showAddModal, setShowAddModal] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([]);

  useEffect(() => {
    if (user?.token) {
      fetchPaymentMethods();
    }
  }, [user?.token, activeWalletType]);

  const fetchPaymentMethods = async () => {
    if (!user?.token) return;

    setIsLoading(true);
    try {
      const methods = await PaymentService.getPaymentMethods({
        token: user.token,
        type: activeWalletType,
      });
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentMethods();
    setRefreshing(false);
  };

  const handleAddAccount = async () => {
    if (!user?.token) return;
    try {
      const methods = await PaymentService.getAvailablePaymentMethods({ token: user.token, type: activeWalletType, country_id: user.country_id });
      setAvailablePaymentMethods(methods);
      setShowAddModal(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to fetch payment methods');
    }
  };

  const renderAccountCard = ({ item: account }: { item: PaymentAccount }) => {
    const isDefault = account.is_def === 1;
    return (
      <View style={[
        styles.accountCard,
        { 
          backgroundColor: colors.card,
          borderColor: account.is_def === 1 ? colors.primary : colors.border,
        }
      ]}>
        <View style={styles.accountHeader}>
          <View style={styles.bankInfo}>
            <Image 
              source={{ uri: account.bank_logo_image }} 
              style={styles.bankLogo}
              resizeMode="contain"
            />
            <View style={styles.bankDetails}>
              <Text style={[styles.bankName, { color: colors.text }]}>
                {account.bank_name}
              </Text>
              <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
                ****{account.account_no.slice(-4)}
              </Text>
              {account.account_name && (
                <Text style={[styles.accountName, { color: colors.textSecondary }]}>
                  {account.account_name}
                </Text>
              )}
            </View>
          </View>
          
          {account.is_def === 1 && (
            <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
              <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>

        <View style={styles.accountFooter}>
          <Text style={[styles.timeoutDesc, { color: colors.textSecondary }]}>
            {account.timeout_desc}
          </Text>
          
          <View style={styles.accountActions}>
            <TouchableOpacity
              onPress={async () => {
                if (!user?.token || isDefault) return;
                try {
                  await PaymentService.setDefaultPayment({ token: user.token, bank_id: account.bank_id });
                  fetchPaymentMethods();
                } catch (e) {
                  Alert.alert('Error', e instanceof Error ? e.message : 'Failed to set default');
                }
              }}
              disabled={isDefault}
              style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
            >
              <Star
                size={18}
                color={isDefault ? colors.primary : colors.textSecondary}
                fill={isDefault ? colors.primary : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {  
                if (!user?.token) return;
                Alert.alert(
                  'Confirm Delete',
                  'Are you sure you want to delete this account?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await PaymentService.deletePaymentMethod({ token: user.token, bank_id: account.bank_id });
                          fetchPaymentMethods();
                        } catch (e) {
                          Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete');
                        }
                      }
                    }
                  ]
                );
              }}
              style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]}
            >
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderMethodSection = ({ item: method }: { item: PaymentMethod }) => (
    <View style={styles.methodSection}>
      <View style={styles.methodHeader}>
        <CreditCard size={20} color={colors.primary} />
        <Text style={[styles.methodTitle, { color: colors.text }]}>
          {method.name}
        </Text>
        <Text style={[styles.accountCount, { color: colors.textSecondary }]}>
          {method.data_list.length} account{method.data_list.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {method.data_list.map((account) => (
        <View key={account.bank_id}>
          {renderAccountCard({ item: account })}
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <CreditCard size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Bank Accounts
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Add your bank accounts or payment methods to start withdrawing funds
      </Text>
      <Button
        title="Add Account"
        onPress={handleAddAccount}
        style={styles.addButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Bank Accounts</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your withdrawal accounts
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleAddAccount}
          style={[styles.addAccountButton, { backgroundColor: colors.primary }]}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Wallet Type Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeWalletType === '1' ? colors.primary : 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setActiveWalletType('1')}
        >
          <Text style={[
            styles.tabText,
            { color: activeWalletType === '1' ? '#FFFFFF' : colors.text }
          ]}>
            NGN Accounts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeWalletType === '2' ? colors.primary : 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setActiveWalletType('2')}
        >
          <Text style={[
            styles.tabText,
            { color: activeWalletType === '2' ? '#FFFFFF' : colors.text }
          ]}>
            USDT Accounts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading accounts...
          </Text>
        </View>
      ) : (
        <FlatList
          data={paymentMethods}
          keyExtractor={(item) => item.payment_id.toString()}
          renderItem={renderMethodSection}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            paymentMethods.length === 0 && styles.emptyListContainer,
          ]}
        />
      )}
      <AddPaymentMethodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchPaymentMethods();
        }}
        availablePaymentMethods={availablePaymentMethods}
        walletType={activeWalletType}
      />
    </SafeAreaView>
  );
}

export default function BankAccountsScreen() {
  const { colors } = useTheme();
  return (
    <AuthGuard>
      <BankAccountsScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  addAccountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  methodSection: {
    marginBottom: Spacing.xl,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  methodTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  accountCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  accountCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeoutDesc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  accountActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  addButton: {
    paddingHorizontal: Spacing.xl,
  },
});