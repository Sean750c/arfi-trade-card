import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { X, CircleCheck as CheckCircle, Tag } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useCouponStore } from '@/stores/useCouponStore';
import { Coupon } from '@/types';

interface DiscountCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coupon: Coupon | null) => void;
  selectedCoupon: Coupon | null;
  userToken: string;
  walletType: string;
}

export default function DiscountCodeModal({
  visible,
  onClose,
  onSelect,
  selectedCoupon,
  userToken,
  walletType,
}: DiscountCodeModalProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();

  const {
    coupons,
    isLoadingCoupons,
    isLoadingMore,
    couponsError,
    hasMore,
    fetchCoupons,
    loadMoreCoupons,
    clearCouponData,
  } = useCouponStore();

  useEffect(() => {
    if (visible && userToken) {
      const type = walletType === 'USDT' ? 2 : 1;
      fetchCoupons(type, userToken, true);
    }
  }, [visible, userToken, walletType]);

  useEffect(() => {
    if (!visible) {
      clearCouponData();
    }
  }, [visible]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore && userToken) {
      loadMoreCoupons(userToken);
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

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return colors.warning;
      case 2: return colors.success;
      case 3: return colors.error;
      case 4: return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    const discountValue = parseFloat(coupon.discount_value);

    // 百分比类型优惠
    if (coupon.discount_type === 1) {
      return `${(discountValue * 100).toFixed(1)}% Off`;
    }

    // 数值类型优惠
    if (coupon.discount_type === 2) {
      // 成交返利类型
      if (coupon.type === 1) {
        return `${coupon.symbol}${discountValue.toFixed(2)} Off`;
      }
      // 汇率提高类型
      if (coupon.type === 2) {
        return `Rate +${discountValue.toFixed(2)}`;
      }
    }

    // 默认情况
    return `${coupon.symbol}${discountValue.toFixed(2)} Off`;
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => {
    const isSelected = selectedCoupon?.code === item.code;
    const isAvailable = item.new_use_status === 2;

    return (
      <TouchableOpacity
        style={[
          styles.couponItem,
          {
            borderBottomColor: colors.border,
            backgroundColor: isSelected ? `${colors.primary}10` : 'transparent',
            opacity: isAvailable ? 1 : 0.6,
          }
        ]}
        onPress={() => isAvailable ? onSelect(item) : null}
        disabled={!isAvailable}
      >
        <View style={styles.couponHeader}>
          <View style={[styles.couponCodeBadge, { backgroundColor: colors.primary }]}>
            <Tag size={14} color="#FFFFFF" />
            <Text style={styles.couponCode}>{item.code}</Text>
          </View>
          <Text style={[
            styles.couponStatus,
            { color: getStatusColor(item.new_use_status) }
          ]}>
            {getStatusText(item.new_use_status)}
          </Text>
        </View>

        <View style={styles.couponDetails}>
          <Text style={[styles.couponDiscount, { color: colors.primary }]}>
            {formatDiscount(item)}
          </Text>
          <Text style={[styles.couponUsage, { color: colors.textSecondary }]}>
            {item.max_use === 0 || !item.max_use
              ? "Unlimited uses"
              : `Used ${item.used_times}/${item.max_use} times`
            }
          </Text>
        </View>

        <View style={styles.couponFooter}>
          <Text style={[styles.couponExpiry, { color: colors.textSecondary }]}>
            Expires: {new Date(item.valid_end_time * 1000).toLocaleDateString()}
          </Text>
          {isSelected && (
            <CheckCircle size={20} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more coupons...
        </Text>
      </View>
    );
  };

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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Discount Codes ({walletType})
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isLoadingCoupons && coupons.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading discount codes...
              </Text>
            </View>
          ) : (
            <FlatList
              data={coupons}
              keyExtractor={(item) => item.code}
              renderItem={renderCouponItem}
              ListFooterComponent={renderFooter}
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Tag size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {couponsError || `No discount codes available for ${walletType}`}
                  </Text>
                </View>
              }
              initialNumToRender={6}
              maxToRenderPerBatch={8}
              windowSize={10}
              removeClippedSubviews={true}
            />
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.border }]}
              onPress={() => onSelect(null)}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                Clear Selection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  couponItem: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
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
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  modalActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
  },
  clearButton: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});