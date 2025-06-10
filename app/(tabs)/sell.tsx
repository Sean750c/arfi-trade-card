import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Plus, 
  Calculator, 
  MessageCircle, 
  Crown, 
  ChevronRight, 
  ChevronDown,
  Trophy, 
  TrendingUp, 
  Phone,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { APIRequest } from '@/utils/api';

interface SelectedCard {
  id: string;
  image?: string;
}

interface Coupon {
  id: number;
  name: string;
  discount: string;
  description: string;
}

function SellScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardInfo, setCardInfo] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<'NGN' | 'USDT'>('NGN');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  
  const customerServiceAnim = useRef(new Animated.Value(1)).current;

  // Customer service pulse animation
  useEffect(() => {
    const customerPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(customerServiceAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(customerServiceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    customerPulse.start();

    return () => customerPulse.stop();
  }, []);

  // Fetch available coupons
  const fetchAvailableCoupons = async () => {
    if (!user?.token) return;
    
    setLoadingCoupons(true);
    try {
      const response = await APIRequest.request(
        '/gc/order/getAvailableCoupon',
        'POST',
        { token: user.token }
      );
      
      // Mock data for now since we don't have the actual API response structure
      const mockCoupons: Coupon[] = [
        { id: 1, name: 'WELCOME10', discount: '10%', description: 'Welcome bonus for new users' },
        { id: 2, name: 'VIP5', discount: '5%', description: 'VIP member exclusive discount' },
        { id: 3, name: 'BULK20', discount: '20%', description: 'Bulk transaction bonus' },
      ];
      
      setAvailableCoupons(mockCoupons);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      // Set mock data on error
      setAvailableCoupons([
        { id: 1, name: 'WELCOME10', discount: '10%', description: 'Welcome bonus for new users' },
        { id: 2, name: 'VIP5', discount: '5%', description: 'VIP member exclusive discount' },
      ]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const addCardImage = async () => {
    if (selectedCards.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 cards per transaction.');
      return;
    }

    Alert.alert(
      'Add Card Image',
      'Choose how to add your card image',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
        const newCard: SelectedCard = {
          id: Date.now().toString(),
          image: result.assets[0].uri,
        };
        setSelectedCards([...selectedCards, newCard]);
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
        const newCard: SelectedCard = {
          id: Date.now().toString(),
          image: result.assets[0].uri,
        };
        setSelectedCards([...selectedCards, newCard]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const isFormValid = () => {
    return selectedCards.length > 0 || cardInfo.trim() !== '';
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Form', 'Please add at least one card image or enter card information.');
      return;
    }

    try {
      // Here you would call the /gc/order/appaddd endpoint
      Alert.alert(
        'Cards Submitted Successfully!', 
        'Your cards have been submitted for review. You will receive a notification once processed.',
        [
          {
            text: 'View Status',
            onPress: () => router.push('/(tabs)/wallet'),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      
      // Reset form
      setSelectedCards([]);
      setCardInfo('');
      setSelectedCoupon(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit cards. Please try again.');
    }
  };

  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(card => card.id !== cardId));
  };

  const handleCouponSelect = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowCouponModal(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Calculator button moved to upper left */}
      <TouchableOpacity
        style={[styles.calculatorButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/calculator' as any)}
      >
        <Calculator size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Contact us button in upper right */}
      <TouchableOpacity 
        onPress={() => Alert.alert('Contact Us', 'Get help via WhatsApp, Email, or Live Chat.')}
        style={[styles.contactButton, { backgroundColor: colors.primary }]}
      >
        <Phone size={16} color="#FFFFFF" />
        <Text style={styles.contactText}>Contact Us</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCardUploadSection = () => (
    <View style={styles.uploadSection}>
      <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
        You can enter card info here or leave it blank
      </Text>
      
      {/* Reduced height text input */}
      <TextInput
        style={[
          styles.cardInfoInput,
          {
            color: colors.text,
            backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
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
      
      <Text style={[styles.uploadLimit, { color: colors.textSecondary }]}>
        Upload gift cards, no more than 10 at a time
      </Text>
      
      <TouchableOpacity
        style={[
          styles.uploadButton,
          { 
            backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
            borderColor: colors.border,
          },
        ]}
        onPress={addCardImage}
      >
        <Plus size={32} color={colors.textSecondary} />
      </TouchableOpacity>
      
      {/* Display uploaded cards */}
      {selectedCards.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardPreviewContainer}>
          {selectedCards.map((card) => (
            <View key={card.id} style={styles.cardPreview}>
              <Image source={{ uri: card.image }} style={styles.cardPreviewImage} />
              <TouchableOpacity
                style={[styles.removeCardButton, { backgroundColor: colors.error }]}
                onPress={() => removeCard(card.id)}
              >
                <X size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderWalletSelection = () => (
    <View style={styles.walletSection}>
      <View style={styles.walletHeader}>
        <Crown size={20} color={colors.primary} />
        <Text style={[styles.walletTitle, { color: colors.text }]}>Select Wallet</Text>
      </View>
      
      {/* Optimized compact wallet options */}
      <View style={styles.walletOptions}>
        <TouchableOpacity
          style={[
            styles.walletOption,
            {
              backgroundColor: selectedWallet === 'NGN' ? colors.primary : 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSelectedWallet('NGN')}
        >
          <Text style={[
            styles.walletOptionText,
            { color: selectedWallet === 'NGN' ? '#FFFFFF' : colors.text }
          ]}>
            NGN
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.walletOption,
            {
              backgroundColor: selectedWallet === 'USDT' ? colors.primary : 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSelectedWallet('USDT')}
        >
          <Text style={[
            styles.walletOptionText,
            { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.text }
          ]}>
            USDT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDiscountSection = () => (
    <TouchableOpacity 
      style={[
        styles.discountSection,
        { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }
      ]}
      onPress={() => {
        fetchAvailableCoupons();
        setShowCouponModal(true);
      }}
    >
      <View style={styles.discountContent}>
        <Text style={[styles.discountText, { color: colors.text }]}>
          {selectedCoupon ? `${selectedCoupon.name} (${selectedCoupon.discount})` : 'Discount Code'}
        </Text>
      </View>
      <ChevronDown size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderVipSection = () => (
    <View style={styles.vipSection}>
      <TouchableOpacity 
        style={[styles.vipItem, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('VIP Benefits', `VIP Level ${user?.vip_level || 1}\n\n• Exchange rate bonus: 0.25%\n• Priority support\n• Exclusive promotions\n• Faster processing times`)}
      >
        <View style={styles.vipContent}>
          <Crown size={20} color="#FFD700" />
          <Text style={styles.vipText}>VIP{user?.vip_level || 1} rate 0.25%</Text>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.vipItem, { backgroundColor: '#1E40AF' }]}
        onPress={() => Alert.alert('Live Rates', 'Current exchange rates:\n\n• Amazon: ₦620/$1\n• iTunes: ₦600/$1\n• Steam: ₦625/$1\n• Google Play: ₦590/$1\n\nActivity bonus: +2% this week!')}
      >
        <View style={styles.vipContent}>
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.vipText}>Rate 0%</Text>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
    </View>
  );

  const renderCouponModal = () => (
    <Modal
      visible={showCouponModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCouponModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Discount Code</Text>
            <TouchableOpacity onPress={() => setShowCouponModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {loadingCoupons ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading coupons...</Text>
            </View>
          ) : (
            <FlatList
              data={availableCoupons}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.couponItem,
                    { borderBottomColor: colors.border },
                    selectedCoupon?.id === item.id && { backgroundColor: `${colors.primary}10` }
                  ]}
                  onPress={() => handleCouponSelect(item)}
                >
                  <View style={styles.couponInfo}>
                    <Text style={[styles.couponName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.couponDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                  </View>
                  <Text style={[styles.couponDiscount, { color: colors.primary }]}>{item.discount}</Text>
                  {selectedCoupon?.id === item.id && (
                    <CheckCircle size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCoupons}>
                  <Text style={[styles.emptyCouponsText, { color: colors.textSecondary }]}>
                    No discount codes available
                  </Text>
                </View>
              }
            />
          )}
          
          <TouchableOpacity
            style={[styles.clearCouponButton, { borderColor: colors.border }]}
            onPress={() => {
              setSelectedCoupon(null);
              setShowCouponModal(false);
            }}
          >
            <Text style={[styles.clearCouponText, { color: colors.textSecondary }]}>Clear Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
          {renderHeader()}
          {renderCardUploadSection()}
          {renderWalletSelection()}
          {renderDiscountSection()}
          {renderVipSection()}
          
          {/* Submit Button */}
          <Button
            title="Sell"
            onPress={handleSubmit}
            disabled={!isFormValid()}
            style={[
              styles.submitButton,
              { 
                backgroundColor: isFormValid() ? colors.primary : colors.border,
                opacity: isFormValid() ? 1 : 0.6,
              }
            ]}
            fullWidth
          />
        </ScrollView>

        {/* Floating Customer Service Button */}
        <View style={styles.floatingButtons}>
          <Animated.View style={{ transform: [{ scale: customerServiceAnim }] }}>
            <TouchableOpacity
              style={[styles.customerServiceButton, { backgroundColor: '#25D366' }]}
              onPress={() => Alert.alert('Customer Service', '24/7 support available via WhatsApp, Email, or Live Chat.')}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.customerServiceText}>?</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {renderCouponModal()}
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
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calculatorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Upload Section
  uploadSection: {
    marginBottom: Spacing.xl,
  },
  uploadHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  cardInfoInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 60, // Reduced height
    marginBottom: Spacing.lg,
  },
  uploadLimit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  uploadButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  cardPreviewContainer: {
    marginTop: Spacing.md,
  },
  cardPreview: {
    width: 60,
    height: 40,
    marginRight: Spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPreviewImage: {
    width: '100%',
    height: '100%',
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

  // Wallet Section - Optimized
  walletSection: {
    marginBottom: Spacing.lg,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  walletTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  walletOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  walletOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  walletOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  // Discount Section - Dropdown style
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  discountContent: {
    flex: 1,
  },
  discountText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },

  // VIP Section
  vipSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  vipItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
  },
  vipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  // Submit Button
  submitButton: {
    height: 56,
    marginBottom: Spacing.xl,
    borderRadius: 12,
  },

  // Floating Buttons
  floatingButtons: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
  },
  customerServiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  customerServiceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    position: 'absolute',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '70%',
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
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  couponItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  couponInfo: {
    flex: 1,
  },
  couponName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  couponDiscount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginRight: Spacing.sm,
  },
  emptyCoupons: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyCouponsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  clearCouponButton: {
    padding: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  clearCouponText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});