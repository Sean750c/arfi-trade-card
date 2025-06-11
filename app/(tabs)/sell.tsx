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
} from 'react-native';
import { router } from 'expo-router';
import { 
  Plus, 
  Calculator,
  Crown,
  ChevronRight,
  ChevronDown,
  Trophy,
  Phone,
  Camera,
  X,
  ArrowLeft,
  Zap,
  CircleHelp as HelpCircle,
  Wallet,
  CircleCheck as CheckCircle,
  Tag,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import DiscountCodeModal from '@/components/sell/DiscountCodeModal';
import VIPModal from '@/components/sell/VIPModal';
import ActivityModal from '@/components/sell/ActivityModal';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';

interface SelectedCard {
  id: string;
  image?: string;
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardInfo, setCardInfo] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<'NGN' | 'USDT'>('NGN');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

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

  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(card => card.id !== cardId));
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
      Alert.alert(
        'Cards Submitted Successfully!', 
        'Your cards have been submitted for review. You will receive a notification once processed.',
        [
          { text: 'View Status', onPress: () => router.push('/(tabs)/wallet') },
          { text: 'OK', style: 'default' },
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

  const formatCouponDisplay = (coupon: Coupon) => {
    const discount = coupon.discount_type === 1 
      ? `${(parseFloat(coupon.discount_value) * 100).toFixed(1)}%`
      : `${coupon.symbol}${coupon.discount_value}`;
    return `${coupon.code} (${discount})`;
  };

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
              <Plus size={24} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
                Add Card Images (Max 10)
              </Text>
            </TouchableOpacity>
            
            {/* Card Previews */}
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

          {/* Wallet Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Wallet</Text>
            
            <View style={styles.walletGrid}>
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  {
                    backgroundColor: selectedWallet === 'NGN' ? colors.primary : colorScheme === 'dark' ? colors.card : '#F9FAFB',
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
                    backgroundColor: selectedWallet === 'USDT' ? colors.primary : colorScheme === 'dark' ? colors.card : '#F9FAFB',
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
            style={[styles.section, styles.discountSection, { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }]}
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
              { backgroundColor: isFormValid() ? colors.primary : colors.border }
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.sellText}>Sell Cards</Text>
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
    paddingBottom: 120, // Space for bottom buttons
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  cardPreviewContainer: {
    marginTop: Spacing.sm,
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
    bottom: 140,
    right: Spacing.lg,
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
});