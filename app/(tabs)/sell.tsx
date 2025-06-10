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
  ArrowLeft, 
  Plus, 
  Calculator, 
  MessageCircle, 
  Crown, 
  ChevronRight, 
  ChevronDown, 
  Trophy, 
  TrendingUp, 
  Phone, 
  X,
  Star,
  Award,
  Zap,
  Gift
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

interface VIPLevel {
  level: number;
  bonus: string;
  requirements: string;
  benefits: string[];
}

interface RankingUser {
  id: number;
  username: string;
  position: number;
  volume: string;
  avatar: string;
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
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  
  const sellButtonAnim = useRef(new Animated.Value(1)).current;

  // Sell button pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(sellButtonAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sellButtonAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  // Mock VIP levels data
  const vipLevels: VIPLevel[] = [
    {
      level: 1,
      bonus: '0.25%',
      requirements: 'Complete registration',
      benefits: ['Basic support', 'Standard rates', 'Email notifications']
    },
    {
      level: 2,
      bonus: '0.5%',
      requirements: '$1,000 trading volume',
      benefits: ['Priority support', 'Enhanced rates', 'SMS notifications', 'Weekly bonuses']
    },
    {
      level: 3,
      bonus: '0.75%',
      requirements: '$5,000 trading volume',
      benefits: ['VIP support', 'Premium rates', 'Phone support', 'Daily bonuses', 'Exclusive offers']
    },
    {
      level: 4,
      bonus: '1%',
      requirements: '$10,000 trading volume',
      benefits: ['Dedicated manager', 'Best rates', '24/7 support', 'Instant processing', 'Custom limits']
    }
  ];

  // Mock ranking data
  const rankingUsers: RankingUser[] = [
    { id: 1, username: 'TradeMaster', position: 1, volume: '$25,000', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
    { id: 2, username: 'CardKing', position: 2, volume: '$22,500', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
    { id: 3, username: 'GiftCardPro', position: 3, volume: '$20,000', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
    { id: 4, username: user?.username || 'You', position: 4, volume: '$18,750', avatar: user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
    { id: 5, username: 'SwiftTrader', position: 5, volume: '$17,200', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg' },
  ];

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
        { id: 4, name: 'WEEKEND15', discount: '15%', description: 'Weekend special offer' },
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
      {/* Return button in top-left */}
      <TouchableOpacity
        style={[styles.returnButton, { backgroundColor: `${colors.primary}15` }]}
        onPress={() => router.back()}
      >
        <ArrowLeft size={20} color={colors.primary} />
      </TouchableOpacity>

      {/* Wallet balance display */}
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          {selectedWallet} Balance
        </Text>
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          {user?.currency_symbol}{user?.money || '0.00'}
        </Text>
      </View>

      {/* Contact us button */}
      <TouchableOpacity 
        onPress={() => Alert.alert('Contact Us', 'Get help via WhatsApp, Email, or Live Chat.')}
        style={[styles.contactButton, { backgroundColor: colors.primary }]}
      >
        <Phone size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderCardUploadSection = () => (
    <View style={styles.uploadSection}>
      <View style={styles.sectionHeader}>
        <Gift size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Details</Text>
      </View>
      
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
        Upload gift cards (max 10 per transaction)
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
        <Plus size={24} color={colors.primary} />
        <Text style={[styles.uploadButtonText, { color: colors.primary }]}>Add Card Image</Text>
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
      <View style={styles.sectionHeader}>
        <Crown size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Wallet</Text>
      </View>
      
      <View style={styles.walletOptions}>
        <TouchableOpacity
          style={[
            styles.walletOption,
            {
              backgroundColor: selectedWallet === 'NGN' ? colors.primary : 'transparent',
              borderColor: selectedWallet === 'NGN' ? colors.primary : colors.border,
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
              borderColor: selectedWallet === 'USDT' ? colors.primary : colors.border,
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
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
          borderColor: colors.border,
        }
      ]}
      onPress={() => {
        fetchAvailableCoupons();
        setShowCouponModal(true);
      }}
    >
      <View style={styles.discountContent}>
        <Text style={[styles.discountLabel, { color: colors.textSecondary }]}>Discount Code</Text>
        <Text style={[styles.discountText, { color: colors.text }]}>
          {selectedCoupon ? `${selectedCoupon.name} (${selectedCoupon.discount})` : 'Select discount code'}
        </Text>
      </View>
      <ChevronDown size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderVIPSection = () => (
    <TouchableOpacity 
      style={[styles.vipSection, { backgroundColor: colors.primary }]}
      onPress={() => setShowVIPModal(true)}
    >
      <View style={styles.vipContent}>
        <Crown size={24} color="#FFD700" />
        <View style={styles.vipInfo}>
          <Text style={styles.vipTitle}>VIP Level {user?.vip_level || 1}</Text>
          <Text style={styles.vipBonus}>Exchange Rate Bonus: +0.25%</Text>
        </View>
      </View>
      <View style={styles.vipAction}>
        <Text style={styles.vipActionText}>View Levels</Text>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </View>
    </TouchableOpacity>
  );

  const renderRankingSection = () => (
    <TouchableOpacity 
      style={[styles.rankingSection, { backgroundColor: colors.secondary }]}
      onPress={() => setShowRankingModal(true)}
    >
      <View style={styles.rankingContent}>
        <Trophy size={24} color="#FFD700" />
        <View style={styles.rankingInfo}>
          <Text style={styles.rankingTitle}>Current Ranking: #4</Text>
          <Text style={styles.rankingSubtitle}>Trading Competition</Text>
        </View>
      </View>
      <View style={styles.rankingAction}>
        <Text style={styles.rankingActionText}>View Full Rankings</Text>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </View>
    </TouchableOpacity>
  );

  const renderVIPModal = () => (
    <Modal
      visible={showVIPModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowVIPModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>VIP Levels</Text>
            <TouchableOpacity onPress={() => setShowVIPModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={vipLevels}
            keyExtractor={(item) => item.level.toString()}
            renderItem={({ item }) => (
              <View style={[
                styles.vipLevelItem,
                { 
                  borderColor: colors.border,
                  backgroundColor: item.level === (user?.vip_level || 1) ? `${colors.primary}10` : 'transparent'
                }
              ]}>
                <View style={styles.vipLevelHeader}>
                  <View style={styles.vipLevelInfo}>
                    <Text style={[styles.vipLevelTitle, { color: colors.text }]}>
                      VIP Level {item.level}
                    </Text>
                    <Text style={[styles.vipLevelBonus, { color: colors.primary }]}>
                      +{item.bonus} Bonus
                    </Text>
                  </View>
                  {item.level === (user?.vip_level || 1) && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.vipLevelRequirements, { color: colors.textSecondary }]}>
                  Requirements: {item.requirements}
                </Text>
                <View style={styles.vipBenefits}>
                  {item.benefits.map((benefit, index) => (
                    <Text key={index} style={[styles.vipBenefit, { color: colors.textSecondary }]}>
                      • {benefit}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderRankingModal = () => (
    <Modal
      visible={showRankingModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRankingModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Trading Rankings</Text>
            <TouchableOpacity onPress={() => setShowRankingModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.competitionInfo, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={[styles.competitionTitle, { color: colors.primary }]}>
              Weekly Trading Competition
            </Text>
            <Text style={[styles.competitionPrize, { color: colors.text }]}>
              Prize Pool: $5,000
            </Text>
          </View>
          
          <FlatList
            data={rankingUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[
                styles.rankingItem,
                { 
                  borderBottomColor: colors.border,
                  backgroundColor: item.username === (user?.username || 'You') ? `${colors.primary}10` : 'transparent'
                }
              ]}>
                <View style={styles.rankingPosition}>
                  <Text style={[styles.positionNumber, { color: colors.primary }]}>
                    #{item.position}
                  </Text>
                  {item.position <= 3 && (
                    <Trophy size={16} color="#FFD700" />
                  )}
                </View>
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={[styles.username, { color: colors.text }]}>
                    {item.username}
                  </Text>
                  <Text style={[styles.userVolume, { color: colors.textSecondary }]}>
                    Volume: {item.volume}
                  </Text>
                </View>
                {item.username === (user?.username || 'You') && (
                  <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.youBadgeText}>You</Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
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
          {renderVIPSection()}
          {renderRankingSection()}
        </ScrollView>

        {/* Floating Sell Button */}
        <Animated.View 
          style={[
            styles.floatingSellButton,
            { transform: [{ scale: sellButtonAnim }] }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.sellButton,
              { 
                backgroundColor: isFormValid() ? colors.primary : colors.border,
                opacity: isFormValid() ? 1 : 0.6,
              }
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
            activeOpacity={0.8}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.sellButtonText}>Sell Card</Text>
          </TouchableOpacity>
        </Animated.View>

        {renderVIPModal()}
        {renderRankingModal()}
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
    paddingBottom: 120, // Space for floating button
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  returnButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  balanceAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },

  // Upload Section
  uploadSection: {
    marginBottom: Spacing.xl,
  },
  cardInfoInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 60,
    marginBottom: Spacing.md,
  },
  uploadLimit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cardPreviewContainer: {
    marginTop: Spacing.md,
  },
  cardPreview: {
    width: 80,
    height: 50,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Wallet Section
  walletSection: {
    marginBottom: Spacing.xl,
  },
  walletOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  walletOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  walletOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  // Discount Section
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  discountContent: {
    flex: 1,
  },
  discountLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  discountText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  // VIP Section
  vipSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  vipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  vipInfo: {
    flex: 1,
  },
  vipTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  vipBonus: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  vipAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vipActionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Ranking Section
  rankingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.xl,
  },
  rankingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  rankingSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  rankingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rankingActionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Floating Sell Button
  floatingSellButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sellButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },

  // VIP Modal
  vipLevelItem: {
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  vipLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  vipLevelInfo: {
    flex: 1,
  },
  vipLevelTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  vipLevelBonus: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  vipLevelRequirements: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.sm,
  },
  vipBenefits: {
    gap: 2,
  },
  vipBenefit: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },

  // Ranking Modal
  competitionInfo: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  competitionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  competitionPrize: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  rankingPosition: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    gap: 4,
  },
  positionNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  userVolume: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  youBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },

  // Coupon Modal
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