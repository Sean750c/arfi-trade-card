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
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Tag, Clock, CircleCheck as CheckCircle, CircleX as XCircle, Copy, Percent } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { APIRequest } from '@/utils/api';
import type { Coupon, CouponListResponse } from '@/types/api';

function PromoCodesScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeType, setActiveType] = useState<0 | 1 | 2>(0); // 0: all, 1: NGN, 2: USDT

  useEffect(() => {
    if (user?.token) {
      fetchCoupons();
    }
  }, [user?.token, activeType]);

  const fetchCoupons = async () => {
    if (!user?.token) return;

    setIsLoading(true);
    try {
      const response = await APIRequest.request<CouponListResponse>(
        '/gc/order/getAvailableCoupon',
        'POST',
        {
          token: user.token,
          type: activeType,
          page: 0,
          page_size: 50,
        }
      );

      if (response.success) {
        setCoupons(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCoupons();
    setRefreshing(false);
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

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: return <Clock size={16} color={colors.warning} />;
      case 2: return <CheckCircle size={16} color={colors.success} />;
      case 3: return <XCircle size={16} color={colors.error} />;
      case 4: return <XCircle size={16} color={colors.error} />;
      default: return null;
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
    if (coupon.discount_type === 1) {
      return `${(parseFloat(coupon.discount_value) * 100).toFixed(1)}%`;
    }
    return `${coupon.symbol}${coupon.discount_value}`;
  };

  const handleCopyCoupon = (code: string) => {
    // TODO: Implement clipboard functionality
    console.log('Copied coupon code:', code);
  };

  const renderCouponCard = ({ item: coupon }: { item: Coupon }) => {
    const isAvailable = coupon.new_use_status === 2;
    
    return (
      <View style={[
        styles.couponCard,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          opacity: isAvailable ? 1 : 0.6,
        }
      ]}>
        <View style={styles.couponHeader}>
          <View style={[styles.couponCodeBadge, { backgroundColor: colors.primary }]}>
            <Tag size={14} color="#FFFFFF" />
            <Text style={styles.couponCode}>{coupon.code}</Text>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon(coupon.new_use_status)}
            <Text style={[
              styles.statusText,
              { color: getStatusColor(coupon.new_use_status) }
            ]}>
              {getStatusText(coupon.new_use_status)}
            </Text>
          </View>
        </View>

        <View style={styles.couponContent}>
          <View style={styles.discountContainer}>
            <Percent size={24} color={colors.primary} />
            <Text style={[styles.discountText, { color: colors.primary }]}>
              {formatDiscount(coupon)} Off
            </Text>
          </View>
          
          <View style={styles.couponDetails}>
            <Text style={[styles.couponType, { color: colors.text }]}>
              {coupon.coupon_type}
            </Text>
            <Text style={[styles.usageInfo, { color: colors.textSecondary }]}>
              Used {coupon.used_times}/{coupon.max_use} times
            </Text>
          </View>
        </View>

        <View style={styles.couponFooter}>
          <View style={styles.validityInfo}>
            <Text style={[styles.validityLabel, { color: colors.textSecondary }]}>
              Valid until:
            </Text>
            <Text style={[styles.validityDate, { color: colors.text }]}>
              {new Date(coupon.valid_end_time * 1000).toLocaleDateString()}
            </Text>
          </View>
          
          {isAvailable && (
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => handleCopyCoupon(coupon.code)}
            >
              <Copy size={16} color={colors.primary} />
              <Text style={[styles.copyText, { color: colors.primary }]}>
                Copy
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {coupon.enough_money && parseFloat(coupon.enough_money) > 0 && (
          <View style={[styles.minimumAmount, { backgroundColor: `${colors.warning}15` }]}>
            <Text style={[styles.minimumText, { color: colors.warning }]}>
              Minimum order: {coupon.symbol}{coupon.enough_money}
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
        {activeType === 0 
          ? "You don't have any promo codes available at the moment."
          : `No ${activeType === 1 ? 'NGN' : 'USDT'} promo codes available.`
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
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
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {coupons.length} codes available
          </Text>
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
            NGN
          </Text>
        </TouchableOpacity>
        
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
      </View>

      {/* Content */}
      {isLoading ? (
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
        />
      )}
    </SafeAreaView>
  );
}

export default function PromoCodesScreen() {
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
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
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
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  couponCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  couponContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.lg,
  },
  discountText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  couponDetails: {
    flex: 1,
  },
  couponType: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  usageInfo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validityInfo: {
    flex: 1,
  },
  validityLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  validityDate: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: 4,
  },
  copyText: {
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