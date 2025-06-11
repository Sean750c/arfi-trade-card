import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { X, CircleCheck as CheckCircle, Tag } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { APIRequest } from '@/utils/api';

interface Coupon {
  code: string;
  valid_start_time: number;
  valid_end_time: number;
  use_status: number;
  new_use_status: number;
  max_use: number;
  type: number;
  discount_type: number;
  discount_value: string;
  used_times: number;
  asc_sort: number;
  coupon_amount: number;
  coupon_type: string;
  symbol: string;
  enough_money: string;
  enough_money_usd: string;
}

interface DiscountCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coupon: Coupon | null) => void;
  selectedCoupon: Coupon | null;
  userToken: string;
  walletType: 'NGN' | 'USDT';
}

export default function DiscountCodeModal({
  visible,
  onClose,
  onSelect,
  selectedCoupon,
  userToken,
  walletType,
}: DiscountCodeModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchCoupons = async (page = 0, refresh = false) => {
    if (loading || (!hasMore && !refresh)) return;
    
    setLoading(true);
    try {
      // Determine coupon type based on wallet selection
      const type = walletType === 'USDT' ? 2 : 1; // 1 for country currency, 2 for USDT
      
      const response = await APIRequest.request<{
        success: boolean;
        total: number;
        page: number;
        page_size: number;
        data: Coupon[];
      }>(
        '/gc/order/getAvailableCoupon',
        'POST',
        {
          token: userToken,
          type,
          page,
          page_size: 10,
        }
      );

      if (response.success) {
        const newCoupons = response.data || [];
        
        if (refresh || page === 0) {
          setCoupons(newCoupons);
        } else {
          setCoupons(prev => [...prev, ...newCoupons]);
        }
        
        setHasMore(newCoupons.length >= 10);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && userToken) {
      fetchCoupons(0, true);
    }
  }, [visible, userToken, walletType]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCoupons(currentPage + 1);
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
    if (coupon.discount_type === 1) {
      return `${(parseFloat(coupon.discount_value) * 100).toFixed(1)}%`;
    }
    return `${coupon.symbol}${coupon.discount_value}`;
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
            {formatDiscount(item)} Off
          </Text>
          <Text style={[styles.couponUsage, { color: colors.textSecondary }]}>
            Used {item.used_times}/{item.max_use}
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
    if (!loading) return null;
    
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
          
          {loading && coupons.length === 0 ? (
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
                    No discount codes available for {walletType}
                  </Text>
                </View>
              }
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