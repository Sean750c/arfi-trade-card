import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Gift, 
  Users, 
  Crown, 
  DollarSign, 
  ArrowRight,
  Wallet,
  TrendingUp,
  Star
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Card from '@/components/UI/Card';
import OrderBonusModal from '@/components/wallet/OrderBounsCard';
import AuthGuard from '@/components/UI/AuthGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRebateStore } from '@/stores/useRebateStore';

function RebateDetailsContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  const {
    rebateInfo,
    rebateData,
    rebateList,
    isLoadingInfo,
    isLoadingRebateList,
    isLoadingMore,
    infoError,
    rebateListError,
    hasMore,
    fetchInviteInfo,
    fetchRebateList,
    loadMoreRebateList,
    clearRebateData,
  } = useRebateStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAmountBonusModal, setShowAmountBonusModal] = useState(false);

  useEffect(() => {
    if (user?.token) {
      initializeData();
    }
    
    return () => {
      clearRebateData();
    };
  }, [user?.token]);

  const initializeData = async () => {
    if (!user?.token) return;
    
    try {
      await Promise.all([
        fetchInviteInfo(user.token),
        fetchRebateList(user.token, true)
      ]);
    } catch (error) {
      console.error('Failed to initialize rebate data:', error);
    }
  };

  const handleRefresh = async () => {
    if (!user?.token) return;
    
    setRefreshing(true);
    try {
      await initializeData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
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

  const formatAmount = (amount: number, symbol: string = '₦') => {
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRebateTypeIcon = (type: number) => {
    switch (type) {
      case 1: return <Gift size={20} color={colors.primary} />;
      case 2: return <Users size={20} color={colors.success} />;
      case 3: return <Users size={20} color={colors.warning} />;
      case 4: return <TrendingUp size={20} color={colors.secondary} />;
      case 5: return <DollarSign size={20} color={colors.primary} />;
      case 6: return <Crown size={20} color="#FFD700" />;
      default: return <Star size={20} color={colors.textSecondary} />;
    }
  };

  const getRebateTypeName = (type: number) => {
    switch (type) {
      case 1: return 'First Order';
      case 2: return 'Referral';
      case 3: return 'Registration';
      case 4: return 'Transfer';
      case 5: return 'Amount Bonus';
      case 6: return 'VIP Bonus';
      case 11: return 'Check-in';
      case 12: return 'Lottery';
      case 13: return 'Mall';
      default: return 'Other';
    }
  };

  const renderRebateItem = (item: any, index: number) => (
    <View 
      key={item.log_id} 
      style={[
        styles.rebateItem,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
          borderBottomColor: colors.border,
        }
      ]}
    >
      <View style={styles.rebateItemLeft}>
        <View style={[styles.rebateIcon, { backgroundColor: `${colors.primary}15` }]}>
          {getRebateTypeIcon(item.type)}
        </View>
        <View style={styles.rebateItemInfo}>
          <Text style={[styles.rebateItemTitle, { color: colors.text }]}>
            {getRebateTypeName(item.type)}
          </Text>
          <Text style={[styles.rebateItemDate, { color: colors.textSecondary }]}>
            {formatDate(item.create_time)}
          </Text>
          {item.from_get && (
            <Text style={[styles.rebateItemSource, { color: colors.textSecondary }]}>
              From: {item.from_get}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rebateItemRight}>
        <Text style={[styles.rebateItemAmount, { color: colors.success }]}>
          +{formatAmount(item.money, rebateData?.currency_symbol || '₦')}
        </Text>
        {item.wallet_type === '2' && (
          <Text style={[styles.rebateItemCurrency, { color: colors.textSecondary }]}>
            USDT
          </Text>
        )}
      </View>
    </View>
  );

  if (isLoadingInfo && !rebateInfo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading rebate information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your earnings and rewards
            </Text>
          </View>
        </View>

        {/* Rebate Balance Card */}
        <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color="#FFFFFF" />
            <Text style={styles.balanceTitle}>Total Rebate Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {formatAmount(rebateData?.rebate_total_amount || 0, rebateData?.currency_symbol || '₦')}
          </Text>
          {rebateData?.transfer_rebate && (
            <View style={styles.transferRebateContainer}>
              <Text style={styles.transferRebateLabel}>Available for Transfer:</Text>
              <Text style={styles.transferRebateAmount}>
                {formatAmount(parseFloat(rebateData.transfer_rebate), rebateData.currency_symbol || '₦')}
              </Text>
            </View>
          )}
        </Card>

        {/* Earning Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ways to Earn Rebates
          </Text>
          
          <View style={styles.earningMethods}>
            {/* First Order Bonus */}
            {rebateData && rebateData.first_order_bonus > 0 && (
              <TouchableOpacity 
                style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
              >
                <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Gift size={24} color={colors.primary} />
                </View>
                <View style={styles.earningMethodContent}>
                  <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                    First Order Bonus
                  </Text>
                  <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                    Get {formatAmount(rebateData.first_order_bonus, rebateData.currency_symbol)} on your first order
                  </Text>
                </View>
                <ArrowRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Amount Order Bonus */}
            {rebateData && rebateData.amount_order_bonus && rebateData.amount_order_bonus.length > 0 && (
              <TouchableOpacity 
                style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
                onPress={() => setShowAmountBonusModal(true)}
              >
                <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.success}15` }]}>
                  <DollarSign size={24} color={colors.success} />
                </View>
                <View style={styles.earningMethodContent}>
                  <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                    Amount Order Bonus
                  </Text>
                  <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                    Earn bonus rewards based on order amount
                  </Text>
                </View>
                <ArrowRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {/* VIP Rebate */}
            {rebateData && rebateData.vip_info && rebateData.vip_info.length > 0 && (
              <TouchableOpacity 
                style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
                onPress={() => router.push('/profile/vip')}
              >
                <View style={[styles.earningMethodIcon, { backgroundColor: '#FFD70015' }]}>
                  <Crown size={24} color="#FFD700" />
                </View>
                <View style={styles.earningMethodContent}>
                  <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                    VIP Rebate
                  </Text>
                  <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                    Higher VIP levels earn better rebate rates
                  </Text>
                </View>
                <ArrowRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Invitation Rebate */}
            {rebateData && rebateData.referred_bonus > 0 && (
              <TouchableOpacity 
                style={[styles.earningMethod, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
                onPress={() => router.push('/refer')}
              >
                <View style={[styles.earningMethodIcon, { backgroundColor: `${colors.warning}15` }]}>
                  <Users size={24} color={colors.warning} />
                </View>
                <View style={styles.earningMethodContent}>
                  <Text style={[styles.earningMethodTitle, { color: colors.text }]}>
                    Invitation Rebate
                  </Text>
                  <Text style={[styles.earningMethodDescription, { color: colors.textSecondary }]}>
                    Earned {formatAmount(rebateData.referred_bonus, rebateData.currency_symbol)} from referrals
                  </Text>
                </View>
                <ArrowRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Rebate History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Rebate History
          </Text>
          
          {isLoadingRebateList && rebateList.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading rebate history...
              </Text>
            </View>
          ) : rebateListError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {rebateListError}
              </Text>
              <TouchableOpacity 
                onPress={handleRefresh}
                style={[styles.retryButton, { backgroundColor: colors.error }]}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : rebateList.length > 0 ? (
            <View style={styles.rebateList}>
              {rebateList.map(renderRebateItem)}
              
              {/* Load More Button */}
              {hasMore && (
                <TouchableOpacity
                  style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
                  onPress={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Gift size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Rebate History
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                Start trading to earn rebates and see your history here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Amount Order Bonus Modal */}
      <OrderBonusModal
        visible={showAmountBonusModal}
        onClose={() => setShowAmountBonusModal(false)}
        bonusData={rebateData?.amount_order_bonus || []}
        currencySymbol={rebateData?.currency_symbol || '₦'}
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },

  // Balance Card
  balanceCard: {
    marginBottom: Spacing.lg,
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
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  transferRebateAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },

  // Earning Methods
  earningMethods: {
    gap: Spacing.sm,
  },
  earningMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  earningMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // Rebate List
  rebateList: {
    gap: Spacing.xs,
  },
  rebateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  rebateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rebateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rebateItemInfo: {
    flex: 1,
  },
  rebateItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  rebateItemDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  rebateItemSource: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  rebateItemRight: {
    alignItems: 'flex-end',
  },
  rebateItemAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  rebateItemCurrency: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },

  // Load More
  loadMoreButton: {
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});