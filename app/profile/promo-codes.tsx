import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Tag, CircleCheck as CheckCircle, ArrowRight, } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCouponStore } from '@/stores/useCouponStore';
import type { Coupon } from '@/types';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { useAppStore } from '@/stores/useAppStore';

function PromoCodesScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { initData } = useAppStore();
  const {
    coupons,
    isLoadingCoupons,
    isLoadingMore,
    couponsError,
    hasMore,
    fetchCoupons,
    loadMoreCoupons,
    clearCouponData
  } = useCouponStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeType, setActiveType] = useState<0 | 1 | 2>(0); // 0: all, 1: NGN, 2: USDT

  const hideWalletTabs = initData?.hidden_flag === '1';

  useEffect(() => {
    if (user?.token) {
      // activeType: 0 (all), 1 (NGN), 2 (USDT)
      fetchCoupons(activeType, user.token, true);
    }
  }, [user?.token, activeType]);

  useEffect(() => {
    return () => {
      clearCouponData();
    };
  }, []);

  const handleRefresh = async () => {
    if (!user?.token) return;

    setRefreshing(true);
    await fetchCoupons(activeType, user.token, true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && user?.token) {
      loadMoreCoupons(user.token);
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more promo codes...
        </Text>
      </View>
    );
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return colors.warning;
      case 2: return colors.success;
      case 3: return colors.error;
      case 4: return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Not Started';
      case 2: return 'Available';
      case 3: return 'Expired';
      case 4: return 'Limit Reached';
      default: return 'Unknown';
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    const discountValue = parseFloat(coupon.discount_value);

    // 百分比类型优惠
    if (coupon.discount_type === 1) {
      return `Rate +${(discountValue * 100).toFixed(1)}%`;
    }

    // 数值类型优惠
    if (coupon.discount_type === 2) {
      // 成交返利类型
      if (coupon.type === 1) {
        return `+${coupon.symbol}${discountValue.toFixed(2)}`;
      }
      // 汇率提高类型
      if (coupon.type === 2) {
        return `Rate +${discountValue.toFixed(2)}`;
      }
    }

    // 默认情况
    return `+${coupon.symbol}${discountValue.toFixed(2)}`;
  };

  const renderCouponCard = ({ item: coupon }: { item: Coupon }) => {
    const isAvailable = coupon.new_use_status === 2;

    return (
      <View style={[
        styles.couponCard,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          opacity: isAvailable ? 1 : 0.6,
        }
      ]}>
        <View style={styles.couponHeader}>
          <View style={[styles.couponCodeBadge, { backgroundColor: colors.primary }]}>
            <Tag size={14} color="#FFFFFF" />
            <Text style={styles.couponCode}>{coupon.code}</Text>
          </View>
          <Text style={[
            styles.couponStatus,
            { color: getStatusColor(coupon.new_use_status) }
          ]}>
            {getStatusText(coupon.new_use_status)}
          </Text>
        </View>

        <View style={styles.couponDetails}>
          <Text style={[styles.couponDiscount, { color: colors.primary }]}>
            {formatDiscount(coupon)}
          </Text>
          <Text style={[styles.couponUsage, { color: colors.textSecondary }]}>
            {coupon.max_use === 0 || !coupon.max_use
              ? "Unlimited uses"
              : `Used ${coupon.used_times}/${coupon.max_use} times`
            }
          </Text>
        </View>

        <View style={styles.couponFooter}>
          <Text style={[styles.couponExpiry, { color: colors.textSecondary }]}>
            Expires: {new Date(coupon.valid_end_time * 1000).toLocaleDateString()}
          </Text>
          {isAvailable && (
            <TouchableOpacity
              style={[styles.sellButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => router.push('/(tabs)/sell')}
            >
              <Text style={[styles.sellButtonText, { color: colors.primary }]}>
                Sell
              </Text>
              <ArrowRight size={12} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {typeof coupon.enough_money === 'string' &&
          !isNaN(parseFloat(coupon.enough_money)) &&
          parseFloat(coupon.enough_money) > 0 &&
          coupon.symbol !== 'ALL' && (
            <View style={[styles.minimumAmount, { backgroundColor: `${colors.warning}15` }]}>
              <Text style={[styles.minimumText, { color: colors.warning }]}>
                Minimum order: {coupon.symbol} {coupon.enough_money}
              </Text>
            </View>
          )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Tag size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Promo Codes
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {couponsError || (activeType === 0
          ? "You don't have any promo codes available at the moment."
          : `No ${activeType === 1 ? user?.currency_name : 'USDT'} promo codes available.`
        )}
      </Text>
    </View>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
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
          <Text style={[styles.title, { color: colors.text }]}>Promo Codes</Text>
        </View>
      </View>

      {/* Type Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: activeType === 0 ? colors.primary : 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setActiveType(0)}
        >
          <Text style={[
            styles.filterText,
            { color: activeType === 0 ? '#FFFFFF' : colors.text }
          ]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: activeType === 1 ? colors.primary : 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setActiveType(1)}
        >
          <Text style={[
            styles.filterText,
            { color: activeType === 1 ? '#FFFFFF' : colors.text }
          ]}>
            {user?.currency_name}
          </Text>
        </TouchableOpacity>

        {!hideWalletTabs && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: activeType === 2 ? colors.primary : 'transparent',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setActiveType(2)}
          >
            <Text style={[
              styles.filterText,
              { color: activeType === 2 ? '#FFFFFF' : colors.text }
            ]}>
              USDT
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoadingCoupons ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading promo codes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item.code}
          renderItem={renderCouponCard}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
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
            coupons.length === 0 && styles.emptyListContainer,
          ]}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaWrapper>
  );
}

export default function PromoCodesScreen() {
  const { colors } = useTheme();
  return (
    <AuthGuard>
      <PromoCodesScreenContent />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  filterText: {
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
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  couponCard: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  couponCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  couponCode: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  couponStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  couponDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  couponDiscount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  couponUsage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponExpiry: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: 4,
    minWidth: 60,
    justifyContent: 'center',
  },
  sellButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  minimumAmount: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
  },
  minimumText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
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
  },
});