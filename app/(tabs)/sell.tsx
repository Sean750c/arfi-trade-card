import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  Dimensions,
  PanResponder,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Calculator, Crown, ChevronRight, ChevronDown, Trophy, Phone, Camera, X, ArrowLeft, Zap, CircleHelp as HelpCircle, Wallet, CircleCheck as CheckCircle, Tag, Upload, Image as ImageIcon, Clock, Shield, Star } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import AuthGuard from '@/components/UI/AuthGuard';
import DiscountCodeModal from '@/components/sell/DiscountCodeModal';
import VIPModal from '@/components/sell/VIPModal';
import ActivityModal from '@/components/sell/ActivityModal';
import OrderCompensationModal from '@/components/sell/OrderCompensationModal';
import HtmlRenderer from '@/components/UI/HtmlRenderer';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { UploadService } from '@/services/upload';
import { OrderService } from '@/services/order';
import { useTheme } from '@/theme/ThemeContext';
import { Coupon } from '@/types';
import { useOrderStore } from '@/stores/useOrderStore';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { PerformanceMonitor } from '@/utils/performance';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SelectedCard {
  id: string;
  localUri?: string;
  uploadUrl?: string;
  objectName?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  isUploaded?: boolean;
  uploadError?: string;
}

function SellScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    fetchOrderSellDetail,
    orderSellDetail,
    isLoadingOrderSellDetail,
    orderSellDetailError
  } = useOrderStore();

  const currencyName = user?.currency_name || '';
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardInfo, setCardInfo] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string>(currencyName);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [showSellTipsModal, setShowSellTipsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Draggable help button state
  const [helpButtonPosition, setHelpButtonPosition] = useState({
    x: screenWidth - 80,
    y: screenHeight - 250,
  });

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      // Store initial position
    },
    onPanResponderMove: (evt, gestureState) => {
      const newX = helpButtonPosition.x + gestureState.dx;
      const newY = helpButtonPosition.y + gestureState.dy;

      const buttonSize = 60;
      const margin = 20;

      const constrainedX = Math.max(margin, Math.min(screenWidth - buttonSize - margin, newX));
      const constrainedY = Math.max(margin, Math.min(screenHeight - buttonSize - margin, newY));

      if (Math.abs(constrainedX - helpButtonPosition.x) > 2 || Math.abs(constrainedY - helpButtonPosition.y) > 2) {
        setHelpButtonPosition({
          x: constrainedX,
          y: constrainedY,
        });
      }
    },
    onPanResponderRelease: () => {
      // Position is already constrained in onPanResponderMove
    },
  }), [helpButtonPosition.x, helpButtonPosition.y, screenWidth, screenHeight]);

  // Load data when page comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.token) {
        if (!orderSellDetail) {
          fetchOrderSellDetail(user.token);
        }
      }
    }, [user?.token, orderSellDetail])
  );

  const vipList = orderSellDetail?.vip || [];
  const vipDetail = orderSellDetail?.vip_detail;
  const currentVipLevel = vipDetail?.level || user?.vip_level || 1;
  const currentVipRate = vipDetail?.rate || '0';

  const handleHelpPress = () => {
    setShowSellTipsModal(true);
  };

  const addCardImage = async () => {
    if (selectedCards.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 cards per transaction.');
      return;
    }

    if (Platform.OS === 'web') {
      openWebImagePicker();
    } else {
      Alert.alert(
        'Add Trading Asset',
        'Choose how to add your trading asset',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Gallery', onPress: () => openGallery() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const openWebImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Web image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const processSelectedImage = async (imageUri: string) => {
    if (!user?.token) {
      Alert.alert('Error', 'Please login to upload images.');
      return;
    }

    const newCard: SelectedCard = {
      id: Date.now().toString(),
      localUri: imageUri,
      isUploading: true,
      uploadProgress: 0,
    };

    setSelectedCards(prev => [...prev, newCard]);

    try {
      const uploadUrls = await UploadService.getUploadUrls({
        token: user.token,
        image_count: 1,
      });

      if (uploadUrls.length === 0) {
        throw new Error('No upload URL received');
      }

      const uploadUrl = uploadUrls[0];
      const imageUrl = uploadUrl.url.split("?")[0];

      setSelectedCards(prev =>
        prev.map(card =>
          card.id === newCard.id
            ? {
              ...card,
              uploadUrl: imageUrl,
              objectName: uploadUrl.objectName,
              uploadProgress: 25
            }
            : card
        )
      );

      await UploadService.uploadImageToGoogleStorage(
        uploadUrl.url,
        imageUri,
        (progress) => {
          const throttledProgress = Math.round(progress * 10) / 10;
          setSelectedCards(prev =>
            prev.map(card =>
              card.id === newCard.id
                ? { ...card, uploadProgress: 25 + (throttledProgress * 0.75) }
                : card
            )
          );
        }
      );

      setSelectedCards(prev =>
        prev.map(card =>
          card.id === newCard.id
            ? {
              ...card,
              isUploading: false,
              isUploaded: true,
              uploadProgress: 100
            }
            : card
        )
      );

    } catch (error) {
      console.error('Upload error:', error);
      setSelectedCards(prev =>
        prev.map(card =>
          card.id === newCard.id
            ? {
              ...card,
              isUploading: false,
              uploadError: error instanceof Error ? error.message : 'Upload failed'
            }
            : card
        )
      );

      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      );
    }
  };

  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(card => card.id !== cardId));
  };

  const retryUpload = async (cardId: string) => {
    const card = selectedCards.find(c => c.id === cardId);
    if (!card?.localUri) return;

    await processSelectedImage(card.localUri);
    setSelectedCards(prev => prev.filter(c => c.id !== cardId));
  };

  const isFormValid = useMemo(() => {
    const hasUploadedImages = selectedCards.some(card => card.isUploaded);
    const hasCardInfo = cardInfo.trim() !== '';
    const noUploadingImages = !selectedCards.some(card => card.isUploading);

    return (hasUploadedImages || hasCardInfo) && noUploadingImages;
  }, [selectedCards, cardInfo]);

  const uploadStats = useMemo(() => {
    const uploadedCount = selectedCards.filter(c => c.isUploaded).length;
    const totalCount = selectedCards.length;
    return { uploadedCount, totalCount };
  }, [selectedCards]);

  const handleSubmit = async () => {
    const endTimer = PerformanceMonitor.getInstance().startTimer('sell_submit');

    if (!isFormValid || !user?.token) {
      Alert.alert('Incomplete Form', 'Please add at least one card image or enter card information.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImages = selectedCards
        .filter(card => card.isUploaded && card.uploadUrl)
        .map(card => card.uploadUrl!);

      const orderResult = await OrderService.sellOrder({
        token: user.token,
        images: uploadedImages,
        user_memo: cardInfo.trim(),
        wallet_type: selectedWallet === 'USDT' ? 2 : 1,
        coupon_code: selectedCoupon?.code || '',
        channel_type: '1',
      });

      Alert.alert(
        'Trade Executed Successfully! 🎉',
        `Order #${orderResult.order_no.slice(-14)}\n\n` +
        `${uploadedImages.length} asset(s) uploaded\n` +
        `Wallet: ${selectedWallet}\n` +
        `${selectedCoupon ? `Promo: ${selectedCoupon.code}\n` : ''}` +
        'Your trade is being processed. You will receive a notification once it\'s reviewed.',
        [
          { text: 'View Trades', onPress: () => router.push('/orders') },
          { text: 'OK', style: 'default' },
        ]
      );

      setSelectedCards([]);
      setCardInfo('');
      setSelectedCoupon(null);

    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Trade Failed',
        error instanceof Error ? error.message : 'Failed to execute trade. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      endTimer();
    }
  };

  const formatCouponDisplay = (coupon: Coupon) => {
    const discountValue = parseFloat(coupon.discount_value);

    if (coupon.discount_type === 1) {
      return `${coupon.code} (${(discountValue * 100).toFixed(1)}% Off)`;
    }

    if (coupon.discount_type === 2) {
      if (coupon.type === 1) {
        return `${coupon.code} (${coupon.symbol}${discountValue.toFixed(2)} Off)`;
      }
      if (coupon.type === 2) {
        return `${coupon.code} (Rate +${discountValue.toFixed(2)})`;
      }
    }
    return `${coupon.code} (${coupon.symbol}${discountValue.toFixed(2)} Off)`;
  };

  const CardPreviewItem = React.memo(({ card }: { card: SelectedCard }) => (
    <View key={card.id} style={styles.cardPreview}>
      <Image source={{ uri: card.localUri }} style={styles.cardPreviewImage} />

      {card.isUploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.uploadProgressText}>
            {Math.round(card.uploadProgress || 0)}%
          </Text>
        </View>
      )}

      {card.isUploaded && (
        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
          <CheckCircle size={12} color="#FFFFFF" />
        </View>
      )}

      {card.uploadError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Failed</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => retryUpload(card.id)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.removeCardButton, { backgroundColor: colors.error }]}
        onPress={() => removeCard(card.id)}
      >
        <X size={12} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  ));

  const cardPreviewList = useMemo(() => {
    return selectedCards.map(card => (
      <CardPreviewItem key={card.id} card={card} />
    ));
  }, [selectedCards, colors.success, colors.error]);

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Professional Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Professional Trading</Text>
              <Text style={styles.headerSubtitle}>Secure • Fast • Reliable</Text>
            </View>

            <TouchableOpacity
              onPress={() => Alert.alert('24/7 Support', 'Get instant help from our trading experts')}
              style={styles.supportButton}
            >
              <Phone size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
        >
          {/* Trading Assets Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trading Assets</Text>
              <View style={[styles.securityBadge, { backgroundColor: `${colors.success}15` }]}>
                <Text style={[styles.securityText, { color: colors.success }]}>SECURE</Text>
              </View>
            </View>

            <TextInput
              style={[
                styles.assetInput,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter asset details, codes, or additional information..."
              placeholderTextColor={colors.textSecondary}
              value={cardInfo}
              onChangeText={setCardInfo}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <LinearGradient
              colors={[`${colors.primary}10`, `${colors.accent}10`]}
              style={styles.uploadArea}
            >
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={addCardImage}
              >
                <View style={[styles.uploadIcon, { backgroundColor: colors.primary }]}>
                  <Upload size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.uploadTitle, { color: colors.text }]}>
                  Upload Trading Assets
                </Text>
                <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                  {Platform.OS === 'web'
                    ? 'Select high-quality images for verification'
                    : 'Professional trading platform - Max 10 assets'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            {selectedCards.length > 0 && (
              <View style={styles.assetsPreview}>
                <View style={styles.previewHeader}>
                  <ImageIcon size={18} color={colors.primary} />
                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    Uploaded Assets ({uploadStats.uploadedCount}/{uploadStats.totalCount})
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
                  {cardPreviewList}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Wallet Selection */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Wallet size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
            </View>

            <View style={styles.walletGrid}>
              <TouchableOpacity
                style={[
                  styles.walletCard,
                  {
                    backgroundColor: selectedWallet === currencyName ? colors.primary : colors.background,
                    borderColor: selectedWallet === currencyName ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedWallet(currencyName)}
              >
                <LinearGradient
                  colors={selectedWallet === currencyName ? ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] : [`${colors.primary}15`, `${colors.primary}05`]}
                  style={styles.walletIconContainer}
                >
                  <Text style={[styles.walletSymbol, { color: selectedWallet === currencyName ? '#FFFFFF' : colors.primary }]}>
                    {user?.currency_symbol}
                  </Text>
                </LinearGradient>
                <Text style={[styles.walletName, { color: selectedWallet === currencyName ? '#FFFFFF' : colors.text }]}>
                  {user?.currency_name}
                </Text>
                <Text style={[styles.walletType, { color: selectedWallet === currencyName ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
                  Local Currency
                </Text>
                {selectedWallet === currencyName && (
                  <CheckCircle size={20} color="#FFFFFF" style={styles.selectedBadge} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.walletCard,
                  {
                    backgroundColor: selectedWallet === 'USDT' ? colors.primary : colors.background,
                    borderColor: selectedWallet === 'USDT' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedWallet('USDT')}
              >
                <LinearGradient
                  colors={selectedWallet === 'USDT' ? ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] : [`${colors.primary}15`, `${colors.primary}05`]}
                  style={styles.walletIconContainer}
                >
                  <Text style={[styles.walletSymbol, { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.primary }]}>
                    ₮
                  </Text>
                </LinearGradient>
                <Text style={[styles.walletName, { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.text }]}>
                  USDT
                </Text>
                <Text style={[styles.walletType, { color: selectedWallet === 'USDT' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
                  Stablecoin
                </Text>
                {selectedWallet === 'USDT' && (
                  <CheckCircle size={20} color="#FFFFFF" style={styles.selectedBadge} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Promo Code Section */}
          <TouchableOpacity
            style={[styles.promoSection, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowCouponModal(true)}
          >
            <LinearGradient
              colors={[`${colors.accent}15`, `${colors.primary}15`]}
              style={styles.promoGradient}
            >
              <Tag size={24} color={colors.accent} />
              <View style={styles.promoContent}>
                <Text style={[styles.promoTitle, { color: colors.text }]}>
                  {selectedCoupon ? formatCouponDisplay(selectedCoupon) : 'Apply Promo Code'}
                </Text>
                {selectedCoupon && (
                  <Text style={[styles.promoExpiry, { color: colors.textSecondary }]}>
                    Expires: {new Date(selectedCoupon.valid_end_time * 1000).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Premium Features */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Premium Benefits</Text>
            </View>

            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.premiumCard}
            >
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => setShowVIPModal(true)}
              >
                <Crown size={24} color="#FFD700" />
                <View style={styles.premiumContent}>
                  <Text style={styles.premiumTitle}>VIP{currentVipLevel} Elite Status</Text>
                  <Text style={styles.premiumSubtitle}>+{currentVipRate}% Premium Bonus</Text>
                </View>
                <ChevronRight size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={['#059669', '#0891B2']}
              style={styles.premiumCard}
            >
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => setShowActivityModal(true)}
              >
                <Trophy size={24} color="#FFFFFF" />
                <View style={styles.premiumContent}>
                  <Text style={styles.premiumTitle}>Rewards Program</Text>
                  <Text style={styles.premiumSubtitle}>Earn up to 3% cashback</Text>
                </View>
                <ChevronRight size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </LinearGradient>

            {orderSellDetail?.overdue_max_percent && (
              <LinearGradient
                colors={['#DC2626', '#EF4444']}
                style={styles.premiumCard}
              >
                <TouchableOpacity
                  style={styles.premiumButton}
                  onPress={() => setShowOverdueModal(true)}
                >
                  <Clock size={24} color="#FFFFFF" />
                  <View style={styles.premiumContent}>
                    <Text style={styles.premiumTitle}>Processing Guarantee</Text>
                    <Text style={styles.premiumSubtitle}>Up to {orderSellDetail.overdue_max_percent}% compensation</Text>
                  </View>
                  <ChevronRight size={20} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </ScrollView>

        {/* Bottom Trading Panel */}
        <LinearGradient
          colors={[colors.card, colors.background]}
          style={styles.bottomPanel}
        >
          <View style={styles.tradingActions}>
            <TouchableOpacity
              style={[styles.calculatorBtn, { backgroundColor: colors.background, borderColor: colors.primary }]}
              onPress={() => router.push('/calculator' as any)}
            >
              <Calculator size={22} color={colors.primary} />
              <Text style={[styles.calculatorText, { color: colors.primary }]}>Calculator</Text>
            </TouchableOpacity>

            <LinearGradient
              colors={isFormValid && !isSubmitting ? [colors.primary, colors.accent] : [colors.border, colors.border]}
              style={styles.executeGradient}
            >
              <TouchableOpacity
                style={styles.executeButton}
                onPress={handleSubmit}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size={24} color="#FFFFFF" />
                ) : (
                  <Zap size={24} color="#FFFFFF" />
                )}
                <Text style={styles.executeText}>
                  {isSubmitting ? 'Processing Trade...' : 'Execute Trade'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Floating Help Assistant */}
        <View
          style={[
            styles.helpFloat,
            {
              left: helpButtonPosition.x,
              top: helpButtonPosition.y,
            }
          ]}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            style={styles.helpGradient}
          >
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleHelpPress}
            >
              <HelpCircle size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Modals */}
        {showCouponModal && (
          <DiscountCodeModal
            visible={showCouponModal}
            onClose={() => setShowCouponModal(false)}
            onSelect={(coupon) => {
              setSelectedCoupon(coupon);
              setShowCouponModal(false);
            }}
            selectedCoupon={selectedCoupon}
            userToken={user?.token || ''}
            walletType={selectedWallet || ''}
          />
        )}

        {showVIPModal && (
          <VIPModal
            visible={showVIPModal}
            onClose={() => setShowVIPModal(false)}
            vipList={vipList}
            vipDetail={vipDetail}
          />
        )}

        {showActivityModal && (
          <ActivityModal
            visible={showActivityModal}
            onClose={() => setShowActivityModal(false)}
            orderSellDetail={orderSellDetail}
            currencySymbol={user?.currency_symbol || '₦'}
          />
        )}

        {showOverdueModal && (
          <OrderCompensationModal
            visible={showOverdueModal}
            onClose={() => setShowOverdueModal(false)}
            overdueData={orderSellDetail?.overdue_data || []}
            maxPercent={orderSellDetail?.overdue_max_percent}
          />
        )}

        {showSellTipsModal && (
          <HtmlRenderer
            visible={showSellTipsModal}
            onClose={() => setShowSellTipsModal(false)}
            title="Professional Trading Guide"
            htmlContent={
              isLoadingOrderSellDetail
                ? '<p>Loading...</p>'
                : orderSellDetail?.sell_card_tips || '<p>No content available</p>'
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

export default function SellScreen() {
  return (
    <AuthGuard>
      <SellScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  supportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 140,
  },
  section: {
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: Spacing.sm,
    flex: 1,
  },
  securityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  securityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },

  // Asset Input Styles
  assetInput: {
    borderWidth: 2,
    borderRadius: 16,
    padding: Spacing.lg,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    marginBottom: Spacing.lg,
  },
  uploadArea: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  // Assets Preview
  assetsPreview: {
    marginTop: Spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Spacing.sm,
  },
  previewScroll: {
    marginTop: Spacing.sm,
  },
  cardPreview: {
    width: 90,
    height: 70,
    marginRight: Spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPreviewImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  uploadProgressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  removeCardButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Wallet Selection
  walletGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  walletCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
    minHeight: 120,
  },
  walletIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  walletSymbol: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  walletName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  walletType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  selectedBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },

  // Promo Section
  promoSection: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  promoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  promoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  promoExpiry: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },

  // Premium Features
  premiumCard: {
    borderRadius: 16,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  premiumContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  premiumSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },

  // Bottom Panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  tradingActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  calculatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    gap: Spacing.sm,
    flex: 0.35,
  },
  calculatorText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  executeGradient: {
    flex: 0.65,
    borderRadius: 16,
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  executeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },

  // Help Float
  helpFloat: {
    position: 'absolute',
    zIndex: 1000,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  helpGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  helpButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});