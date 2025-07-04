import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
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
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import Card from '@/components/UI/Card';
import OrderBonusModal from '@/components/wallet/OrderBounsCard';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import Header from '@/components/UI/Header';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRebateStore } from '@/stores/useRebateStore';
import RebateList from '@/components/wallet/RebateList';
import { RebateItem } from '@/types';

function RebateDetailsContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    rebateInfo,
    rebateList,
    isLoadingRebateList,
    isLoadingMore,
    rebateListError,
    activeWalletType,
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
    <SafeAreaWrapper backgroundColor={colors.background}>
      {/* Header */}
      <Header 
        title="Rebate Details"
        backgroundColor={colors.card}
      />

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
              style={[styles.earningMethod, { backgroundColor: colors.card }]}
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
              style={[styles.earningMethod, { backgroundColor: colors.card }]}
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
              style={[styles.earningMethod, { backgroundColor: colors.card }]}
            >
              <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.warning}15` }]}>
                <Crown size={20} color={colors.warning} />
              </View>
              <View style={styles.earningMethodContent}>
                <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                  VIP Rebate
                </Text>
                <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                  Earn {rebateInfo.vip_info[0]?.rate || 0}% rebate on every order
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Referral Bonus */}
          {rebateInfo && rebateInfo.referred_bonus && rebateInfo.referred_bonus > 0 && (
            <TouchableOpacity
              style={[styles.earningMethod, { backgroundColor: colors.card }]}
            >
              <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.secondary}15` }]}>
                <Users size={20} color={colors.secondary} />
              </View>
              <View style={styles.earningMethodContent}>
                <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                  Referral Bonus
                </Text>
                <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                  Earn rewards by inviting friends
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Rebate List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Rebates
        </Text>
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

      {/* Amount Bonus Modal */}
      <OrderBonusModal
        visible={showAmountBonusModal}
        onClose={() => setShowAmountBonusModal(false)}
        bonusData={rebateInfo?.amount_order_bonus || []}
        currencySymbol={rebateInfo?.currency_symbol || '₦'}
      />
    </SafeAreaWrapper>
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
  balanceContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  balanceCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.sm,
    borderRadius: 8,
  },
  transferRebateLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  earningMethods: {
    gap: Spacing.md,
  },
  earningMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  earningMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  earningMethodContent: {
    flex: 1,
  },
  earningMethodTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  earningMethodDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
});