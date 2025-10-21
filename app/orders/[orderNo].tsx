import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Gift, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, CircleX as XCircle, Copy, Share, Tag, Crown, Sparkles, Image as ImageIcon, Key } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOrderStore } from '@/stores/useOrderStore';
import type { OrderDetail } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { OrderService } from '@/services/order';
import { useAppStore } from '@/stores/useAppStore';
import * as Linking from 'expo-linking';
import { useAppReview } from '@/hooks/useAppReview';
import { useReviewStore } from '@/stores/useReviewStore';

const { width } = Dimensions.get('window');

function OrderDetailScreenContent() {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { isLoadingDetail, detailError } = useOrderStore();
  const { orderNo } = useLocalSearchParams<{ orderNo: string }>();
  const { initData } = useAppStore();
  const { recordSignificantEvent, shouldRequestReview } = useAppReview();
  const { setShowRatingPrompt } = useReviewStore();

  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const hasRequestedReview = useRef(false);

  useEffect(() => {
    if (user?.token && orderNo) {
      loadOrderDetail();
    }
  }, [user?.token, orderNo]);

  const loadOrderDetail = async () => {
    if (!user?.token || !orderNo) return;

    try {
      if (user?.token && orderNo) {
        const detail = await OrderService.getOrderDetail({
          token: user.token,
          order_no: orderNo,
        });
        //const detail = await fetchOrderDetail(user.token, orderNo);
        setOrderDetail(detail);
      }
    } catch (error) {
      console.error('Failed to load order detail:', error);
    } finally {
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    if (orderDetail && !hasRequestedReview.current) {
      const isCompleted = orderDetail.status === 2 || orderDetail.status === 4;

      if (isCompleted) {
        hasRequestedReview.current = true;
        checkAndRequestReview();
      }
    }
  }, [orderDetail]);

  const checkAndRequestReview = async () => {
    try {
      await recordSignificantEvent();

      setTimeout(async () => {
        const shouldShow = await shouldRequestReview();
        if (shouldShow) {
          setShowRatingPrompt(true);
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking review prompt:', error);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <Clock size={24} color={colors.warning} />;
      case 2:
      case 4:
        return <CheckCircle size={24} color={colors.success} />;
      case 3:
        return <XCircle size={24} color={colors.error} />;
      default:
        return <AlertCircle size={24} color={colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return colors.warning;
      case 2:
        return colors.success;
      case 3:
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAmount = (amount: string, walletType: number) => {
    const numAmount = parseFloat(amount);
    const symbol = walletType === 2 ? 'USDT' : user?.currency_symbol;
    return `${symbol}${numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCopyOrderNo = () => {
    Alert.alert('Copied', 'Order number copied to clipboard');
  };

  const handleShareOrder = () => {
    Alert.alert('Share', 'Order sharing functionality would be implemented here');
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleContactSupport = () => {
    //Alert.alert('Contact Support', 'Support contact functionality would be implemented here');
    const phone = initData?.service_phone;
    if (phone) {
      const url = `https://wa.me/${phone.replace(/[^\d]/g, '')}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Unable to open WhatsApp', 'Please check if WhatsApp is installed or if the phone number is correct.');
      });
    } else {
      Alert.alert('Unable to get service phone', 'Please try again later.');
    }
  };

  const handleCopyKey = (key: string) => {
    Alert.alert('Copied', 'Card key copied to clipboard');
  };

  if (isLoadingDetail || isFirstLoad) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (detailError || !orderDetail) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.error }]}>
            Failed to load order details
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {detailError || 'Order not found'}
          </Text>
          <Button
            title="Try Again"
            onPress={loadOrderDetail}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

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
          <Text style={[styles.title, { color: colors.text }]}>Order Details</Text>
        </View>
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: `${colors.primary}15` }]}
          onPress={handleShareOrder}
        >
          <Share size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={[
          styles.statusCard,
          {
            backgroundColor: colors.card,
            borderColor: getStatusColor(orderDetail.status),
          }
        ]}>
          <View style={styles.statusHeader}>
            {getStatusIcon(orderDetail.status)}
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: getStatusColor(orderDetail.status) }]}>
                {orderDetail.status_desc}
              </Text>
              <Text style={[styles.statusDate, { color: colors.textSecondary }]}>
                {formatDate(orderDetail.create_time)}
              </Text>
            </View>
          </View>

          {orderDetail.finish_time > 0 && (
            <View style={styles.finishTimeContainer}>
              <Text style={[styles.finishTimeLabel, { color: colors.textSecondary }]}>
                Completed:
              </Text>
              <Text style={[styles.finishTimeValue, { color: colors.text }]}>
                {formatDate(orderDetail.finish_time)}
              </Text>
            </View>
          )}
        </View>

        {/* Order Info Card */}
        <View style={[
          styles.infoCard,
          { backgroundColor: colors.card }
        ]}>
          <View style={styles.infoHeader}>
            <Gift size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Order Information
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Order Number
            </Text>
            <View style={styles.orderNumberContainer}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {orderDetail.order_no.slice(-14)}
              </Text>
              <TouchableOpacity onPress={handleCopyOrderNo}>
                <Copy size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Amount
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatAmount(orderDetail.amount, orderDetail.wallet_type)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Wallet Type
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {orderDetail.wallet_type === 1 ? `${user?.currency_name} Wallet` : 'USDT Wallet'}
            </Text>
          </View>

          {orderDetail.user_memo && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                User Note
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {orderDetail.user_memo}
              </Text>
            </View>
          )}
        </View>

        {/* Bonuses Card */}
        {(orderDetail.first_order_bonus > 0 ||
          orderDetail.reach_amount_bonus > 0 ||
          orderDetail.full_amount_bonus > 0 ||
          orderDetail.vip_bonus > 0) && (
            <View style={[
              styles.bonusCard,
              { backgroundColor: `${colors.success}10` }
            ]}>
              <View style={styles.bonusHeader}>
                <Sparkles size={20} color={colors.success} />
                <Text style={[styles.bonusTitle, { color: colors.success }]}>
                  Bonuses & Rewards
                </Text>
              </View>

              {orderDetail.first_order_bonus > 0 && (
                <View style={styles.bonusRow}>
                  <Text style={[styles.bonusLabel, { color: colors.textSecondary }]}>
                    First Order Bonus
                  </Text>
                  <Text style={[styles.bonusValue, { color: colors.success }]}>
                    +{formatAmount(orderDetail.first_order_bonus.toString(), orderDetail.wallet_type)}
                  </Text>
                </View>
              )}

              {orderDetail.reach_amount_bonus > 0 && (
                <View style={styles.bonusRow}>
                  <Text style={[styles.bonusLabel, { color: colors.textSecondary }]}>
                    Amount Bonus
                  </Text>
                  <Text style={[styles.bonusValue, { color: colors.success }]}>
                    +{formatAmount(orderDetail.reach_amount_bonus.toString(), orderDetail.wallet_type)}
                  </Text>
                </View>
              )}

              {orderDetail.vip_bonus > 0 && (
                <View style={styles.bonusRow}>
                  <Crown size={16} color={colors.warning} />
                  <Text style={[styles.bonusLabel, { color: colors.textSecondary }]}>
                    VIP Bonus
                  </Text>
                  <Text style={[styles.bonusValue, { color: colors.success }]}>
                    +{formatAmount(orderDetail.vip_bonus.toString(), orderDetail.wallet_type)}
                  </Text>
                </View>
              )}
            </View>
          )}

        {/* Coupon Card */}
        {orderDetail.coupon_code && (
          <View style={[
            styles.couponCard,
            { backgroundColor: `${colors.primary}10` }
          ]}>
            <View style={styles.couponHeader}>
              <Tag size={20} color={colors.primary} />
              <Text style={[styles.couponTitle, { color: colors.primary }]}>
                Discount Applied
              </Text>
            </View>
            <View style={styles.couponRow}>
              <Text style={[styles.couponCode, { color: colors.text }]}>
                {orderDetail.coupon_code}
              </Text>
              <Text style={[styles.couponAmount, { color: colors.primary }]}>
                {formatAmount(orderDetail.coupon_amount, orderDetail.wallet_type)}
              </Text>
            </View>
          </View>
        )}

        {/* Card Keys Card */}
        {orderDetail.keyList.length > 0 && (
          <View style={[
            styles.keysCard,
            { backgroundColor: colors.card }
          ]}>
            <View style={styles.keysHeader}>
              <Key size={20} color={colors.primary} />
              <Text style={[styles.keysTitle, { color: colors.text }]}>
                Card Keys ({orderDetail.keyList.length})
              </Text>
            </View>

            {orderDetail.keyList.map((keyInfo, index) => (
              <View
                key={index}
                style={[
                  styles.keyItem,
                  {
                    backgroundColor: `${colors.primary}05`,
                    borderColor: keyInfo.fail_reason ? colors.error : colors.border
                  }
                ]}
              >
                <View style={styles.keyItemHeader}>
                  <View style={styles.keyCardInfo}>
                    {keyInfo.card_image && (
                      <Image
                        source={{ uri: keyInfo.card_image }}
                        style={styles.keyCardImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.keyCardDetails}>
                      <Text style={[styles.keyCardName, { color: colors.text }]}>
                        {keyInfo.card_name}
                      </Text>
                      <Text style={[styles.keyCardCurrency, { color: colors.textSecondary }]}>
                        {keyInfo.card_currency}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.keyStatusBadge,
                    { backgroundColor: keyInfo.status === 'success' ? `${colors.success}20` : `${colors.warning}20` }
                  ]}>
                    <Text style={[
                      styles.keyStatusText,
                      { color: keyInfo.status === 'success' ? colors.success : colors.warning }
                    ]}>
                      {keyInfo.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.keyInfoRow}>
                  <View style={styles.keyInfoItem}>
                    <Text style={[styles.keyInfoLabel, { color: colors.textSecondary }]}>
                      Face Value
                    </Text>
                    <Text style={[styles.keyInfoValue, { color: colors.text }]}>
                      {keyInfo.currency_symbol}{keyInfo.facevalue.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.keyInfoItem}>
                    <Text style={[styles.keyInfoLabel, { color: colors.textSecondary }]}>
                      Amount
                    </Text>
                    <Text style={[styles.keyInfoValue, { color: colors.text }]}>
                      {user?.currency_symbol}{keyInfo.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.keyInfoItem}>
                    <Text style={[styles.keyInfoLabel, { color: colors.textSecondary }]}>
                      Rate
                    </Text>
                    <Text style={[styles.keyInfoValue, { color: colors.text }]}>
                      {(keyInfo.purchase_rate).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.keyValueContainer, { backgroundColor: colors.background }]}>
                  <Text style={[styles.keyValueLabel, { color: colors.textSecondary }]}>
                    Card Key:
                  </Text>
                  <View style={styles.keyValueRow}>
                    <Text
                      style={[styles.keyValueText, { color: colors.text }]}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {keyInfo.key}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopyKey(keyInfo.key)}
                      style={styles.copyKeyButton}
                    >
                      <Copy size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {keyInfo.fail_reason && (
                  <View style={[styles.keyErrorContainer, { backgroundColor: `${colors.error}10` }]}>
                    <AlertCircle size={14} color={colors.error} />
                    <Text style={[styles.keyErrorText, { color: colors.error }]}>
                      {keyInfo.fail_reason}
                    </Text>
                  </View>
                )}

                {keyInfo.sellout_image && (
                  <TouchableOpacity
                    style={styles.keySelloutImageContainer}
                    onPress={() => Alert.alert('Image', 'Full screen image viewer')}
                  >
                    <Image
                      source={{ uri: keyInfo.sellout_image }}
                      style={styles.keySelloutImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Images Card */}
        {orderDetail.imageList.length > 0 && (
          <View style={[
            styles.imagesCard,
            { backgroundColor: colors.card }
          ]}>
            <View style={styles.imagesHeader}>
              <ImageIcon size={20} color={colors.primary} />
              <Text style={[styles.imagesTitle, { color: colors.text }]}>
                Uploaded Images ({orderDetail.imageList.length})
              </Text>
            </View>

            <View style={styles.imagesGrid}>
              {orderDetail.imageList.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.imageContainer,
                    { borderColor: image.refused_reason ? colors.error : colors.border }
                  ]}
                  onPress={() => handleImagePress(index)}
                >
                  <Image
                    source={{ uri: image.url }}
                    style={styles.orderImage}
                    resizeMode="cover"
                  />
                  {image.refused_reason && (
                    <View style={[styles.imageErrorBadge, { backgroundColor: colors.error }]}>
                      <XCircle size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {orderDetail.imageList.some(img => img.refused_reason) && (
              <View style={[styles.imageErrorsContainer, { backgroundColor: `${colors.error}10` }]}>
                <Text style={[styles.imageErrorsTitle, { color: colors.error }]}>
                  Image Issues:
                </Text>
                {orderDetail.imageList
                  .filter(img => img.refused_reason)
                  .map((image, index) => (
                    <Text key={index} style={[styles.imageErrorText, { color: colors.text }]}>
                      • {image.refused_reason}
                    </Text>
                  ))}
              </View>
            )}
          </View>
        )}

        {/* Contact Support */}
        {orderDetail.status === 3 && (
          <View style={styles.supportContainer}>
            <Button
              title="Contact Support"
              variant="outline"
              onPress={handleContactSupport}
              style={styles.supportButton}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && (
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.imageViewerClose}
            onPress={() => setSelectedImageIndex(null)}
          >
            <XCircle size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={{ uri: orderDetail.imageList[selectedImageIndex].url }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      )}
    </SafeAreaWrapper>
  );
}

export default function OrderDetailScreen() {
  return (
    <AuthGuard>
      <OrderDetailScreenContent />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  statusCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  finishTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  finishTimeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  finishTimeValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  infoCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bonusCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bonusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bonusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  bonusValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  couponCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  couponTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  couponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponCode: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  couponAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  imagesCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  imagesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  imageContainer: {
    width: (width - Spacing.lg * 2 - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  orderImage: {
    width: '100%',
    height: '100%',
  },
  imageErrorBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorsContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: 8,
  },
  imageErrorsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  imageErrorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  supportContainer: {
    marginTop: Spacing.lg,
  },
  supportButton: {
    height: 48,
  },
  imageViewerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  fullScreenImage: {
    width: width - 40,
    height: '80%',
  },
  keysCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  keysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  keysTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  keyItem: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  keyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  keyCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  keyCardImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  keyCardDetails: {
    flex: 1,
  },
  keyCardName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  keyCardCurrency: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  keyStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  keyStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  keyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  keyInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  keyInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  keyInfoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  keyValueContainer: {
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  keyValueLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  keyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyValueText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: Spacing.sm,
  },
  copyKeyButton: {
    padding: 4,
  },
  keyErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  keyErrorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  keySelloutImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  keySelloutImage: {
    width: '100%',
    height: 120,
  },
});