import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Calculator, Crown, ChevronRight, ChevronDown, Trophy, Phone, Camera, X, ArrowLeft, Zap, CircleHelp as HelpCircle, Wallet, CircleCheck as CheckCircle, Tag, Upload, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import DiscountCodeModal from '@/components/sell/DiscountCodeModal';
import VIPModal from '@/components/sell/VIPModal';
import ActivityModal from '@/components/sell/ActivityModal';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { UploadService } from '@/services/upload';
import { OrderService } from '@/services/order';
import { useTheme } from '@/theme/ThemeContext';

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

function SellScreenContent() {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardInfo, setCardInfo] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<'NGN' | 'USDT'>('NGN');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCardImage = async () => {
    if (selectedCards.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 cards per transaction.');
      return;
    }

    Alert.alert(
      'Add Card Image',
      'Choose how to add your card image',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
      // Get upload URL from server
      const uploadUrls = await UploadService.getUploadUrls({
        token: user.token,
        image_count: 1,
      });

      if (uploadUrls.length === 0) {
        throw new Error('No upload URL received');
      }

      const uploadUrl = uploadUrls[0];
      const imageUrl = uploadUrl.url.split("?")[0];

      // Update card with upload URL
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

      // Upload image to Google Storage
      await UploadService.uploadImageToGoogleStorage(
        uploadUrl.url,
        imageUri,
        (progress) => {
          setSelectedCards(prev => 
            prev.map(card => 
              card.id === newCard.id 
                ? { ...card, uploadProgress: 25 + (progress * 0.75) }
                : card
            )
          );
        }
      );

      // Mark as uploaded
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
    // Remove the failed card
    setSelectedCards(prev => prev.filter(c => c.id !== cardId));
  };

  const isFormValid = () => {
    const hasUploadedImages = selectedCards.some(card => card.isUploaded);
    const hasCardInfo = cardInfo.trim() !== '';
    const noUploadingImages = !selectedCards.some(card => card.isUploading);
    
    return (hasUploadedImages || hasCardInfo) && noUploadingImages;
  };

  const handleSubmit = async () => {
    if (!isFormValid() || !user?.token) {
      Alert.alert('Incomplete Form', 'Please add at least one card image or enter card information.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get uploaded image object names
      const uploadedImages = selectedCards
        .filter(card => card.isUploaded && card.uploadUrl)
        .map(card => card.uploadUrl!);

      // Create sell order
      const orderResult = await OrderService.sellOrder({
        token: user.token,
        images: uploadedImages,
        user_memo: cardInfo.trim(),
        wallet_type: selectedWallet === 'USDT' ? 2 : 1,
        coupon_code: selectedCoupon?.code || '',
        channel_type: '1', // Web platform
      });

      // Show success message with order details
      Alert.alert(
        'Order Created Successfully! 🎉', 
        `Order #${orderResult.order_no.slice(-14)}\n\n` +
        `${uploadedImages.length} image(s) uploaded\n` +
        `Wallet: ${selectedWallet}\n` +
        `${selectedCoupon ? `Discount: ${selectedCoupon.code}\n` : ''}` +
        'Your order is being processed. You will receive a notification once it\'s reviewed.',
        [
          { text: 'View Orders', onPress: () => router.push('/orders') },
          { text: 'OK', style: 'default' },
        ]
      );
      
      // Reset form
      setSelectedCards([]);
      setCardInfo('');
      setSelectedCoupon(null);
      
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Submission Failed', 
        error instanceof Error ? error.message : 'Failed to create order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
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

  const renderCardPreview = (card: SelectedCard) => (
    <View key={card.id} style={styles.cardPreview}>
      <Image source={{ uri: card.localUri }} style={styles.cardPreviewImage} />
      
      {/* Upload Status Overlay */}
      {card.isUploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.uploadProgressText}>
            {Math.round(card.uploadProgress || 0)}%
          </Text>
        </View>
      )}
      
      {/* Success Indicator */}
      {card.isUploaded && (
        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
          <CheckCircle size={12} color="#FFFFFF" />
        </View>
      )}
      
      {/* Error Indicator */}
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
      
      {/* Remove Button */}
      <TouchableOpacity
        style={[styles.removeCardButton, { backgroundColor: colors.error }]}
        onPress={() => removeCard(card.id)}
      >
        <X size={12} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Compact Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.returnButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.headerSpacer} />

            <TouchableOpacity 
              onPress={() => Alert.alert('Contact Us', 'Get help via WhatsApp, Email, or Live Chat.')}
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>
          </View>

          {/* Card Upload Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Information</Text>
            
            <TextInput
              style={[
                styles.cardInfoInput,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter card details, codes, or any additional information..."
              placeholderTextColor={colors.textSecondary}
              value={cardInfo}
              onChangeText={setCardInfo}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={addCardImage}
            >
              <Upload size={24} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
                Add Card Images (Max 10)
              </Text>
              <Text style={[styles.uploadButtonSubtext, { color: colors.textSecondary }]}>
                Images will be uploaded to secure cloud storage
              </Text>
            </TouchableOpacity>
            
            {/* Card Previews */}
            {selectedCards.length > 0 && (
              <View style={styles.cardPreviewContainer}>
                <View style={styles.cardPreviewHeader}>
                  <ImageIcon size={16} color={colors.primary} />
                  <Text style={[styles.cardPreviewTitle, { color: colors.text }]}>
                    Uploaded Images ({selectedCards.filter(c => c.isUploaded).length}/{selectedCards.length})
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardPreviewScroll}>
                  {selectedCards.map(renderCardPreview)}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Wallet Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Wallet</Text>
            
            <View style={styles.walletGrid}>
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  {
                    backgroundColor: selectedWallet === 'NGN' ? colors.primary : colors.card,
                    borderColor: selectedWallet === 'NGN' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedWallet('NGN')}
              >
                <View style={[styles.walletIcon, { backgroundColor: selectedWallet === 'NGN' ? 'rgba(255,255,255,0.2)' : `${colors.primary}15` }]}>
                  <Text style={[styles.walletIconText, { color: selectedWallet === 'NGN' ? '#FFFFFF' : colors.primary }]}>₦</Text>
                </View>
                <Text style={[styles.walletText, { color: selectedWallet === 'NGN' ? '#FFFFFF' : colors.text }]}>
                  Nigerian Naira
                </Text>
                {selectedWallet === 'NGN' && (
                  <CheckCircle size={16} color="#FFFFFF" style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  {
                    backgroundColor: selectedWallet === 'USDT' ? colors.primary : colors.card,
                    borderColor: selectedWallet === 'USDT' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedWallet('USDT')}
              >
                <View style={[styles.walletIcon, { backgroundColor: selectedWallet === 'USDT' ? 'rgba(255,255,255,0.2)' : `${colors.primary}15` }]}>
                  <Text style={[styles.walletIconText, { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.primary }]}>₮</Text>
                </View>
                <Text style={[styles.walletText, { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.text }]}>
                  Tether USD
                </Text>
                {selectedWallet === 'USDT' && (
                  <CheckCircle size={16} color="#FFFFFF" style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Code Section */}
          <TouchableOpacity 
            style={[styles.section, styles.discountSection, { backgroundColor: colors.card }]}
            onPress={() => setShowCouponModal(true)}
          >
            <View style={styles.discountContent}>
              <Tag size={20} color={colors.primary} />
              <View style={styles.discountTextContainer}>
                <Text style={[styles.discountText, { color: colors.text }]}>
                  {selectedCoupon ? formatCouponDisplay(selectedCoupon) : 'Select Discount Code'}
                </Text>
                {selectedCoupon && (
                  <Text style={[styles.discountDescription, { color: colors.textSecondary }]}>
                    Expires: {new Date(selectedCoupon.valid_end_time * 1000).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* VIP & Activity Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowVIPModal(true)}
            >
              <Crown size={20} color="#FFD700" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>VIP{user?.vip_level || 1} Exchange Rate Bonus</Text>
                <Text style={styles.featureSubtitle}>+0.25% Extra Rate</Text>
              </View>
              <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: '#1E40AF' }]}
              onPress={() => setShowActivityModal(true)}
            >
              <Trophy size={20} color="#FFFFFF" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Activity Rebate Program</Text>
                <Text style={styles.featureSubtitle}>Earn up to 2% cashback</Text>
              </View>
              <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.calculatorButton, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
            onPress={() => router.push('/calculator' as any)}
          >
            <Calculator size={20} color={colors.primary} />
            <Text style={[styles.calculatorText, { color: colors.primary }]}>Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sellButton,
              { 
                backgroundColor: isFormValid() && !isSubmitting ? colors.primary : colors.border,
                opacity: isSubmitting ? 0.7 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size={20} color="#FFFFFF" />
            ) : (
              <Zap size={20} color="#FFFFFF" />
            )}
            <Text style={styles.sellText}>
              {isSubmitting ? 'Creating Order...' : 'Sell Cards'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating Help Button */}
        <TouchableOpacity
          style={[styles.helpButton, { backgroundColor: '#25D366' }]}
          onPress={() => Alert.alert('Help', 'Card selling FAQ and support information.')}
        >
          <HelpCircle size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Modals */}
        <DiscountCodeModal
          visible={showCouponModal}
          onClose={() => setShowCouponModal(false)}
          onSelect={(coupon) => {
            setSelectedCoupon(coupon);
            setShowCouponModal(false);
          }}
          selectedCoupon={selectedCoupon}
          userToken={user?.token || ''}
          walletType={selectedWallet}
        />

        <VIPModal
          visible={showVIPModal}
          onClose={() => setShowVIPModal(false)}
          currentLevel={user?.vip_level || 1}
        />

        <ActivityModal
          visible={showActivityModal}
          onClose={() => setShowActivityModal(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  returnButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 18,
    gap: Spacing.xs,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },

  // Card Upload
  cardInfoInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 60,
    marginBottom: Spacing.md,
  },
  uploadButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  cardPreviewContainer: {
    marginTop: Spacing.sm,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardPreviewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  cardPreviewScroll: {
    marginTop: Spacing.sm,
  },
  cardPreview: {
    width: 80,
    height: 60,
    marginRight: Spacing.sm,
    borderRadius: 8,
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
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Inter-Medium',
  },
  removeCardButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Wallet Selection
  walletGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  walletOption: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
    minHeight: 100,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  walletIconText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  walletText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  selectedIcon: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },

  // Discount Section
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
  },
  discountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  discountTextContainer: {
    flex: 1,
  },
  discountText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  discountDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },

  // Feature Buttons
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  featureSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: 'transparent',
  },
  calculatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    gap: Spacing.sm,
    flex: 0.4,
  },
  calculatorText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
    flex: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sellText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Help Button
  helpButton: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});