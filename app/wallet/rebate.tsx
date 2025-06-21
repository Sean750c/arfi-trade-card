import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Gift,
  Users,
  Crown,
  DollarSign,
  ArrowRight,
  Wallet,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Card from '@/components/UI/Card';
import OrderBonusModal from '@/components/wallet/OrderBounsCard';
import AuthGuard from '@/components/UI/AuthGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRebateStore } from '@/stores/useRebateStore';
import RebateList from '@/components/wallet/RebateList';
import { RebateItem } from '@/types';

function RebateDetailsContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  const {
    rebateInfo,
    rebateList,
    isLoadingRebateList,
    isLoadingMore,
    infoError,
    activeWalletType,
    rebateListError,
    hasMore,
    setActiveWalletType,
    fetchRebateList,
    loadMoreRebateList,
    clearRebateInfo,
  } = useRebateStore();

  const [showAmountBonusModal, setShowAmountBonusModal] = useState(false);
  const { walletType } = useLocalSearchParams<{ walletType: string }>();

  useEffect(() => {
    setActiveWalletType(walletType === '2' ? '2' : '1');
    if (user?.token) {
      initializeData();
    }

    return () => {
      clearRebateInfo();
    };
  }, [user?.token]);

  const initializeData = async () => {
    if (!user?.token) return;
    try {
      await Promise.all([
        fetchRebateList(user.token, true)
      ]);
    } catch (error) {
      console.error('Failed to initialize rebate data:', error);
    }
  };

  const handleRefresh = async () => {
    if (!user?.token) return;

    try {
      await initializeData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleLoadMore = async () => {
    if (!user?.token || isLoadingMore || !hasMore) return;

    try {
      await loadMoreRebateList(user.token);
    } catch (error) {
      console.error('Failed to load more rebate list:', error);
    }
  };

  const handleRebatePress = (rebateItem: RebateItem) => {

  };

  const formatAmount = (amount: number, symbol: string = '₦', digits: number = 2) => {
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Rebate Details</Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        {/* Rebate Balance Card */}
        <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color="#FFFFFF" />
            <Text style={styles.balanceTitle}>Rebate Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {formatAmount(
              walletType === '1'
                ? rebateInfo?.rebate_amount || 0
                : rebateInfo?.rebate_amount_usd || 0,
              walletType === '1'
                ? rebateInfo?.currency_symbol || '₦'
                : rebateInfo?.currency_symbol_usd || 'USDT'
            )}
          </Text>
          <View style={styles.transferRebateContainer}>
            <Text style={styles.transferRebateLabel}>
              Auto transfer over {formatAmount(
                walletType === '1'
                  ? parseFloat(rebateInfo?.transfer_rebate || '0') || 0
                  : parseFloat(rebateInfo?.transfer_rebate_usd || '0') || 0,
                  walletType === '1'
                  ? rebateInfo?.currency_symbol || '₦'
                  : rebateInfo?.currency_symbol_usd || 'USDT',
                0
              )} to cash wallet.
            </Text>
          </View>
        </Card>
      </View>

      {/* Earning Methods */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ways to Earn Rebates
        </Text>

        <View style={styles.earningMethods}>
          {/* First Order Bonus */}
          {walletType === '1' && rebateInfo && rebateInfo.first_order_bonus > 0 && (
            <TouchableOpacity
              style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
            >
              <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Gift size={20} color={colors.primary} />
              </View>
              <View style={styles.earningMethodContent}>
                <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                  First Order Bonus
                </Text>
                <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                  Get {formatAmount(rebateInfo.first_order_bonus, rebateInfo.currency_symbol)} on your first order
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Amount Order Bonus */}
          {walletType === '1' && rebateInfo && rebateInfo.amount_order_bonus && rebateInfo.amount_order_bonus.length > 0 && (
            <TouchableOpacity
              style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
              onPress={() => setShowAmountBonusModal(true)}
            >
              <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.success}15` }]}>
                <DollarSign size={20} color={colors.success} />
              </View>
              <View style={styles.earningMethodContent}>
                <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                  Amount Order Bonus
                </Text>
                <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                  Earn bonus rewards based on order amount
                </Text>
              </View>
              <ArrowRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* VIP Rebate */}
          {rebateInfo && rebateInfo.vip_info && rebateInfo.vip_info.length > 0 && (
            <TouchableOpacity
              style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
              onPress={() => router.push('/profile/vip')}
            >
              <View style={[styles.earningMethodIcon, { backgroundColor: '#FFD70015' }]}>
                <Crown size={20} color="#FFD700" />
              </View>
              <View style={styles.earningMethodContent}>
                <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                  VIP Rebate
                </Text>
                <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                  Higher VIP levels earn better rebate rates
                </Text>
              </View>
              <ArrowRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Invitation Rebate */}
          {walletType === '1' && rebateInfo && rebateInfo.referred_bonus > 0 && (
            <TouchableOpacity
              style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
              onPress={() => router.push('/refer')}
            >
              <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.warning}15` }]}>
                <Users size={20} color={colors.warning} />
              </View>
              <View style={styles.earningMethodContent}>
                <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                  Invitation Rebate
                </Text>
                <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                  Earned {formatAmount(rebateInfo.referred_bonus, rebateInfo.currency_symbol)} from referrals
                </Text>
              </View>
              <ArrowRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.rebateListHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Rebate History
        </Text>
        <Text style={[styles.rebateListCount, { color: colors.textSecondary }]}>
          {rebateList.length} rebates
        </Text>
      </View>
      {/* Rebate History */}
      <View style={styles.rebateListContainer}>
        <RebateList
          rebateInfo={rebateInfo}
          rebateList={rebateList}
          isLoading={isLoadingRebateList}
          isLoadingMore={isLoadingMore}
          error={rebateListError}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
          onRebatePress={handleRebatePress}
          walletType={activeWalletType}
        />
      </View>

      {/* Amount Order Bonus Modal */}
      <OrderBonusModal
        visible={showAmountBonusModal}
        onClose={() => setShowAmountBonusModal(false)}
        bonusData={rebateInfo?.amount_order_bonus || []}
        currencySymbol={rebateInfo?.currency_symbol || '₦'}
      />
    </SafeAreaView>
  );
}

export default function RebateDetailsScreen() {
  return (
    <AuthGuard>
      <RebateDetailsContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Balance Card
  balanceContainer: {
    paddingHorizontal: Spacing.lg,
  },
  balanceCard: {
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Spacing.sm,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  transferRebateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  transferRebateLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  // Sections
  section: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },

  // Earning Methods
  earningMethods: {
    gap: Spacing.xs,
  },
  earningMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  earningMethodIcon: {
    width: 32,
    height: 32,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  earningMethodContent: {
    //flex: 1,
  },
  earningMethodTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  earningMethodDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // Rebate List
  rebateListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  rebateListCount: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  rebateListContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
});