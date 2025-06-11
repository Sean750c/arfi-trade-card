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
import { Plus, Calculator, Crown, ChevronRight, ChevronDown, Trophy, TrendingUp, Phone, Camera, Image as ImageIcon, CircleCheck as CheckCircle, X, ArrowLeft, Star, Medal, Award, Zap, CircleHelp as HelpCircle, Wallet } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { APIRequest } from '@/utils/api';

// Platform-specific imports for gesture handling
let State: any;

if (Platform.OS !== 'web') {
  const gestureHandler = require('react-native-gesture-handler');
  State = gestureHandler.State;
} else {
  // Web fallback - use regular View
  State = { END: 'END' }; // Mock State object for web
}

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
  rank: number;
  volume: string;
  badge: string;
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
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  
  // Draggable help button position
  const [helpButtonPosition, setHelpButtonPosition] = useState({ x: 20, y: 200 });
  const helpButtonAnim = useRef(new Animated.ValueXY(helpButtonPosition)).current;

  // Mock VIP data
  const vipLevels: VIPLevel[] = [
    {
      level: 1,
      bonus: '0.25%',
      requirements: 'Default level',
      benefits: ['Basic support', 'Standard rates', 'Email notifications']
    },
    {
      level: 2,
      bonus: '0.5%',
      requirements: '$5,000+ monthly volume',
      benefits: ['Priority support', 'Enhanced rates', 'SMS notifications', 'Exclusive promotions']
    },
    {
      level: 3,
      bonus: '0.75%',
      requirements: '$15,000+ monthly volume',
      benefits: ['VIP support', 'Premium rates', 'Phone support', 'Early access to features']
    },
    {
      level: 4,
      bonus: '1.0%',
      requirements: '$50,000+ monthly volume',
      benefits: ['Dedicated manager', 'Best rates', '24/7 priority', 'Custom solutions']
    }
  ];

  // Mock ranking data
  const rankingData: RankingUser[] = [
    { id: 1, username: 'TradeMaster', rank: 1, volume: '$125,000', badge: 'Diamond', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
    { id: 2, username: 'CardKing', rank: 2, volume: '$98,500', badge: 'Platinum', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
    { id: 3, username: 'GiftCardPro', rank: 3, volume: '$87,200', badge: 'Gold', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
    { id: 4, username: user?.username || 'You', rank: 15, volume: '$12,450', badge: 'Silver', avatar: user?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' },
  ];

  // FAQ data
  const faqData = [
    {
      question: 'How long does it take to process my card?',
      answer: 'Most cards are processed within 5-15 minutes during business hours.'
    },
    {
      question: 'What types of gift cards do you accept?',
      answer: 'We accept iTunes, Amazon, Steam, Google Play, and many other popular gift cards.'
    },
    {
      question: 'How do I get better rates?',
      answer: 'Upgrade your VIP level by increasing your monthly trading volume to get better rates.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes, we use bank-level encryption to protect all your personal and transaction data.'
    }
  ];

  // Initialize help button position
  useEffect(() => {
    helpButtonAnim.setValue(helpButtonPosition);
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

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Diamond':
        return <Award size={16} color="#B9F2FF" />;
      case 'Platinum':
        return <Medal size={16} color="#E5E7EB" />;
      case 'Gold':
        return <Trophy size={16} color="#FCD34D" />;
      case 'Silver':
        return <Star size={16} color="#D1D5DB" />;
      default:
        return <Star size={16} color="#9CA3AF" />;
    }
  };

  // Handle help button drag - platform specific
  const onGestureEvent = Platform.OS !== 'web' 
    ? Animated.event(
        [{ nativeEvent: { translationX: helpButtonAnim.x, translationY: helpButtonAnim.y } }],
        { useNativeDriver: false }
      )
    : undefined;

  const onHandlerStateChange = Platform.OS !== 'web' 
    ? (event: any) => {
        if (event.nativeEvent.state === State.END) {
          const { translationX, translationY } = event.nativeEvent;
          const newX = Math.max(0, Math.min(300, helpButtonPosition.x + translationX));
          const newY = Math.max(100, Math.min(600, helpButtonPosition.y + translationY));
          
          setHelpButtonPosition({ x: newX, y: newY });
          
          Animated.spring(helpButtonAnim, {
            toValue: { x: newX, y: newY },
            useNativeDriver: false,
          }).start();
        }
      }
    : undefined;

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Return button in top-left */}
      <TouchableOpacity
        style={[styles.returnButton, { backgroundColor: `${colors.primary}15` }]}
        onPress={() => router.back()}
      >
        <ArrowLeft size={20} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.headerSpacer} />

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
        <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
          Add Card Image
        </Text>
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
        <Wallet size={20} color={colors.primary} />
        <Text style={[styles.walletTitle, { color: colors.text }]}>Select Wallet</Text>
      </View>
      
      <View style={styles.walletGrid}>
        <TouchableOpacity
          style={[
            styles.walletGridOption,
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
          <Text style={[
            styles.walletGridText,
            { color: selectedWallet === 'NGN' ? '#FFFFFF' : colors.text }
          ]}>
            Nigerian Naira
          </Text>
          <Text style={[
            styles.walletGridSubtext,
            { color: selectedWallet === 'NGN' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
          ]}>
            NGN
          </Text>
          {selectedWallet === 'NGN' && (
            <View style={styles.selectedIndicator}>
              <CheckCircle size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.walletGridOption,
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
          <Text style={[
            styles.walletGridText,
            { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.text }
          ]}>
            Tether USD
          </Text>
          <Text style={[
            styles.walletGridSubtext,
            { color: selectedWallet === 'USDT' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
          ]}>
            USDT
          </Text>
          {selectedWallet === 'USDT' && (
            <View style={styles.selectedIndicator}>
              <CheckCircle size={16} color="#FFFFFF" />
            </View>
          )}
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
          {selectedCoupon ? `${selectedCoupon.name} (${selectedCoupon.discount})` : 'Select Discount Code'}
        </Text>
        {selectedCoupon && (
          <Text style={[styles.discountDescription, { color: colors.textSecondary }]}>
            {selectedCoupon.description}
          </Text>
        )}
      </View>
      <ChevronDown size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderVipSection = () => (
    <View style={styles.vipSection}>
      <TouchableOpacity 
        style={[styles.vipItem, { backgroundColor: colors.primary }]}
        onPress={() => setShowVIPModal(true)}
      >
        <View style={styles.vipContent}>
          <Crown size={20} color="#FFD700" />
          <View style={styles.vipTextContainer}>
            <Text style={styles.vipText}>VIP{user?.vip_level || 1} Exchange Rate Bonus</Text>
            <Text style={styles.vipBonus}>+{vipLevels.find(v => v.level === (user?.vip_level || 1))?.bonus || '0.25%'} Extra Rate</Text>
          </View>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.rankingItem, { backgroundColor: '#1E40AF' }]}
        onPress={() => setShowRankingModal(true)}
      >
        <View style={styles.vipContent}>
          <Trophy size={20} color="#FFFFFF" />
          <View style={styles.vipTextContainer}>
            <Text style={styles.vipText}>Activity Rebate Program</Text>
            <Text style={styles.vipBonus}>Earn up to 2% cashback</Text>
          </View>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
    </View>
  );

  const renderBottomActions = () => (
    <View style={styles.bottomActions}>
      <TouchableOpacity
        style={[styles.calculatorBottomButton, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
        onPress={() => router.push('/calculator' as any)}
      >
        <Calculator size={20} color={colors.primary} />
        <Text style={[styles.calculatorBottomText, { color: colors.primary }]}>Calculator</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sellBottomButton,
          { 
            backgroundColor: isFormValid() ? colors.primary : colors.border,
          }
        ]}
        onPress={handleSubmit}
        disabled={!isFormValid()}
        activeOpacity={0.8}
      >
        <Zap size={20} color="#FFFFFF" />
        <Text style={styles.sellBottomText}>Sell Cards</Text>
      </TouchableOpacity>
    </View>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>VIP Exchange Rate Benefits</Text>
            <TouchableOpacity onPress={() => setShowVIPModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {vipLevels.map((level) => (
              <View 
                key={level.level} 
                style={[
                  styles.vipLevelCard,
                  { 
                    backgroundColor: level.level === (user?.vip_level || 1) ? `${colors.primary}15` : 'transparent',
                    borderColor: level.level === (user?.vip_level || 1) ? colors.primary : colors.border,
                  }
                ]}
              >
                <View style={styles.vipLevelHeader}>
                  <View style={styles.vipLevelInfo}>
                    <Text style={[styles.vipLevelTitle, { color: colors.text }]}>
                      VIP Level {level.level}
                    </Text>
                    <Text style={[styles.vipLevelBonus, { color: colors.primary }]}>
                      +{level.bonus} Exchange Rate Bonus
                    </Text>
                  </View>
                  {level.level === (user?.vip_level || 1) && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.vipRequirements, { color: colors.textSecondary }]}>
                  Requirements: {level.requirements}
                </Text>
                
                <View style={styles.vipBenefits}>
                  {level.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Activity Rebate Program</Text>
            <TouchableOpacity onPress={() => setShowRankingModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.rebateInfo}>
            <Text style={[styles.rebateTitle, { color: colors.text }]}>Earn Cashback on Every Trade</Text>
            <Text style={[styles.rebateDescription, { color: colors.textSecondary }]}>
              Get up to 2% cashback based on your monthly trading volume and VIP level.
            </Text>
            
            <View style={styles.rebateTiers}>
              <View style={styles.rebateTier}>
                <Text style={[styles.rebateTierTitle, { color: colors.primary }]}>Bronze Tier</Text>
                <Text style={[styles.rebateTierAmount, { color: colors.text }]}>0.5% Cashback</Text>
                <Text style={[styles.rebateTierRequirement, { color: colors.textSecondary }]}>$1,000+ monthly</Text>
              </View>
              
              <View style={styles.rebateTier}>
                <Text style={[styles.rebateTierTitle, { color: colors.primary }]}>Silver Tier</Text>
                <Text style={[styles.rebateTierAmount, { color: colors.text }]}>1.0% Cashback</Text>
                <Text style={[styles.rebateTierRequirement, { color: colors.textSecondary }]}>$5,000+ monthly</Text>
              </View>
              
              <View style={styles.rebateTier}>
                <Text style={[styles.rebateTierTitle, { color: colors.primary }]}>Gold Tier</Text>
                <Text style={[styles.rebateTierAmount, { color: colors.text }]}>2.0% Cashback</Text>
                <Text style={[styles.rebateTierRequirement, { color: colors.textSecondary }]}>$15,000+ monthly</Text>
              </View>
            </View>
          </View>
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

  const renderFAQModal = () => (
    <Modal
      visible={showFAQModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFAQModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Card Selling FAQ</Text>
            <TouchableOpacity onPress={() => setShowFAQModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {faqData.map((faq, index) => (
              <View key={index} style={[styles.faqItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
              </View>
            ))}
          </ScrollView>
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
        </ScrollView>

        {/* Bottom Action Buttons */}
        {renderBottomActions()}

        {renderCouponModal()}
        {renderVIPModal()}
        {renderRankingModal()}
        {renderFAQModal()}
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
    paddingBottom: 100, // Space for bottom buttons
  },

  // Header with proper layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  returnButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: 20,
    gap: Spacing.xs,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Upload Section - Left aligned
  uploadSection: {
    marginBottom: Spacing.xl,
  },
  uploadHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    textAlign: 'left',
  },
  cardInfoInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 60,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  uploadLimit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    textAlign: 'left',
  },
  uploadButton: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
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

  // Wallet Section - Grid Layout
  walletSection: {
    marginBottom: Spacing.xl,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  walletTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  walletGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  walletGridOption: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
    minHeight: 120,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  walletIconText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  walletGridText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  walletGridSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },

  // Discount Section
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  discountContent: {
    flex: 1,
  },
  discountText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  discountDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // VIP Section
  vipSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  vipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
  },
  vipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  vipTextContainer: {
    flex: 1,
  },
  vipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  vipBonus: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
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
  calculatorBottomButton: {
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
  calculatorBottomText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  sellBottomButton: {
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
  sellBottomText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Draggable Help Button
  draggableHelpButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
    top: 200,
    left: 20,
  },
  helpButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },

  // VIP Modal Styles
  vipLevelCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.lg,
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
  vipRequirements: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  vipBenefits: {
    gap: Spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },

  // Rebate Modal Styles
  rebateInfo: {
    padding: Spacing.md,
  },
  rebateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  rebateDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  rebateTiers: {
    gap: Spacing.lg,
  },
  rebateTier: {
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 135, 81, 0.1)',
  },
  rebateTierTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  rebateTierAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  rebateTierRequirement: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // Coupon Modal Styles
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

  // FAQ Modal Styles
  faqItem: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});