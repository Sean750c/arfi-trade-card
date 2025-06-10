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
  Dimensions,
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
  CircleCheck as CheckCircle, 
  X,
  ArrowLeft,
  Star,
  Medal,
  Award,
  Zap,
  Gift,
  Percent,
  Sparkles,
  Clock,
  DollarSign
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { APIRequest } from '@/utils/api';

const { width: screenWidth } = Dimensions.get('window');

interface SelectedCard {
  id: string;
  image?: string;
}

interface Coupon {
  id: number;
  name: string;
  discount: string;
  description: string;
  isHighlight?: boolean;
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
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  
  const customerServiceAnim = useRef(new Animated.Value(1)).current;
  const sellButtonAnim = useRef(new Animated.Value(0)).current;
  const highlightAnim = useRef(new Animated.Value(1)).current;

  // Mock VIP data with enhanced information
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

  // Enhanced animations
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

    // Floating sell button entrance animation
    Animated.spring(sellButtonAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Highlight animation for special offers
    const highlightPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    highlightPulse.start();

    return () => {
      customerPulse.stop();
      highlightPulse.stop();
    };
  }, []);

  // Fetch available coupons with enhanced data
  const fetchAvailableCoupons = async () => {
    if (!user?.token) return;
    
    setLoadingCoupons(true);
    try {
      const response = await APIRequest.request(
        '/gc/order/getAvailableCoupon',
        'POST',
        { token: user.token }
      );
      
      // Enhanced mock data with highlights
      const mockCoupons: Coupon[] = [
        { id: 1, name: 'WEEKEND25', discount: '25%', description: 'Limited weekend special offer', isHighlight: true },
        { id: 2, name: 'VIP15', discount: '15%', description: 'VIP member exclusive discount', isHighlight: false },
        { id: 3, name: 'BULK20', discount: '20%', description: 'Bulk transaction bonus (5+ cards)', isHighlight: false },
        { id: 4, name: 'NEWUSER10', discount: '10%', description: 'Welcome bonus for new users', isHighlight: false },
        { id: 5, name: 'FLASH30', discount: '30%', description: 'Flash sale - Limited time only!', isHighlight: true },
      ];
      
      setAvailableCoupons(mockCoupons);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      setAvailableCoupons([
        { id: 1, name: 'WEEKEND25', discount: '25%', description: 'Limited weekend special offer', isHighlight: true },
        { id: 2, name: 'VIP15', discount: '15%', description: 'VIP member exclusive discount', isHighlight: false },
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

  const renderCompactHeader = () => (
    <View style={styles.compactHeader}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: `${colors.primary}15` }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/calculator' as any)}
        >
          <Calculator size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sell Cards</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Get instant cash for your gift cards
        </Text>
      </View>

      <TouchableOpacity 
        onPress={() => Alert.alert('Contact Us', 'Get help via WhatsApp, Email, or Live Chat.')}
        style={[styles.contactButton, { backgroundColor: colors.primary }]}
      >
        <Phone size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderCardUploadGrid = () => (
    <View style={styles.uploadGrid}>
      <View style={styles.uploadLeft}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Details</Text>
        
        <TextInput
          style={[
            styles.compactInput,
            {
              color: colors.text,
              backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
              borderColor: colors.border,
            },
          ]}
          placeholder="Enter card codes or details (optional)"
          placeholderTextColor={colors.textSecondary}
          value={cardInfo}
          onChangeText={setCardInfo}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />

        <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
          Upload up to 10 card images
        </Text>
      </View>

      <View style={styles.uploadRight}>
        <TouchableOpacity
          style={[
            styles.compactUploadButton,
            { 
              backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
              borderColor: colors.border,
            },
          ]}
          onPress={addCardImage}
        >
          <Plus size={24} color={colors.primary} />
          <Text style={[styles.uploadButtonText, { color: colors.primary }]}>Add Cards</Text>
        </TouchableOpacity>

        {selectedCards.length > 0 && (
          <View style={styles.cardGrid}>
            {selectedCards.slice(0, 4).map((card, index) => (
              <View key={card.id} style={styles.miniCardPreview}>
                <Image source={{ uri: card.image }} style={styles.miniCardImage} />
                <TouchableOpacity
                  style={[styles.miniRemoveButton, { backgroundColor: colors.error }]}
                  onPress={() => removeCard(card.id)}
                >
                  <X size={8} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedCards.length > 4 && (
              <View style={[styles.moreCardsIndicator, { backgroundColor: colors.primary }]}>
                <Text style={styles.moreCardsText}>+{selectedCards.length - 4}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderCompactOptions = () => (
    <View style={styles.optionsGrid}>
      {/* Wallet Selection */}
      <View style={styles.optionCard}>
        <View style={styles.optionHeader}>
          <DollarSign size={16} color={colors.primary} />
          <Text style={[styles.optionTitle, { color: colors.text }]}>Wallet</Text>
        </View>
        <View style={styles.walletToggle}>
          <TouchableOpacity
            style={[
              styles.walletToggleOption,
              {
                backgroundColor: selectedWallet === 'NGN' ? colors.primary : 'transparent',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedWallet('NGN')}
          >
            <Text style={[
              styles.walletToggleText,
              { color: selectedWallet === 'NGN' ? '#FFFFFF' : colors.text }
            ]}>
              NGN
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.walletToggleOption,
              {
                backgroundColor: selectedWallet === 'USDT' ? colors.primary : 'transparent',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedWallet('USDT')}
          >
            <Text style={[
              styles.walletToggleText,
              { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.text }
            ]}>
              USDT
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Discount Code */}
      <TouchableOpacity 
        style={[styles.optionCard, styles.discountCard]}
        onPress={() => {
          fetchAvailableCoupons();
          setShowCouponModal(true);
        }}
      >
        <View style={styles.optionHeader}>
          <Percent size={16} color={colors.primary} />
          <Text style={[styles.optionTitle, { color: colors.text }]}>Discount</Text>
          {selectedCoupon?.isHighlight && (
            <Animated.View style={{ transform: [{ scale: highlightAnim }] }}>
              <Sparkles size={14} color="#FFD700" />
            </Animated.View>
          )}
        </View>
        <Text style={[styles.discountValue, { color: selectedCoupon ? colors.primary : colors.textSecondary }]}>
          {selectedCoupon ? `${selectedCoupon.discount} OFF` : 'Select Code'}
        </Text>
        <ChevronDown size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderEnhancedVipRanking = () => (
    <View style={styles.vipRankingGrid}>
      {/* VIP Section */}
      <TouchableOpacity 
        style={[styles.vipCard, { backgroundColor: colors.primary }]}
        onPress={() => setShowVIPModal(true)}
      >
        <View style={styles.vipCardHeader}>
          <Crown size={20} color="#FFD700" />
          <Text style={styles.vipLevel}>VIP {user?.vip_level || 1}</Text>
        </View>
        <Text style={styles.vipBonus}>
          +{vipLevels.find(v => v.level === (user?.vip_level || 1))?.bonus || '0.25%'} Bonus
        </Text>
        <Text style={styles.vipDescription}>Exclusive rate boost</Text>
        <View style={styles.vipProgress}>
          <View style={[styles.vipProgressBar, { width: `${(user?.vip_level || 1) * 25}%` }]} />
        </View>
      </TouchableOpacity>

      {/* Ranking Section */}
      <TouchableOpacity 
        style={[styles.rankingCard, { backgroundColor: '#1E40AF' }]}
        onPress={() => setShowRankingModal(true)}
      >
        <View style={styles.rankingCardHeader}>
          <Trophy size={20} color="#FFFFFF" />
          <Text style={styles.rankingPosition}>#15</Text>
        </View>
        <Text style={styles.rankingTitle}>Your Rank</Text>
        <Text style={styles.rankingDescription}>Top trader this month</Text>
        <View style={styles.rankingBadge}>
          <Medal size={14} color="#D1D5DB" />
          <Text style={styles.rankingBadgeText}>Silver</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEnhancedCouponModal = () => (
    <Modal
      visible={showCouponModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCouponModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Discount Codes</Text>
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
                    styles.enhancedCouponItem,
                    { 
                      borderBottomColor: colors.border,
                      backgroundColor: item.isHighlight ? `${colors.secondary}10` : 'transparent'
                    },
                    selectedCoupon?.id === item.id && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }
                  ]}
                  onPress={() => handleCouponSelect(item)}
                >
                  <View style={styles.couponItemLeft}>
                    <View style={styles.couponHeader}>
                      <Text style={[styles.couponName, { color: colors.text }]}>{item.name}</Text>
                      {item.isHighlight && (
                        <View style={[styles.highlightBadge, { backgroundColor: colors.secondary }]}>
                          <Sparkles size={12} color="#FFFFFF" />
                          <Text style={styles.highlightText}>HOT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.couponDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                    {item.isHighlight && (
                      <View style={styles.urgencyIndicator}>
                        <Clock size={12} color={colors.warning} />
                        <Text style={[styles.urgencyText, { color: colors.warning }]}>Limited time</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.couponItemRight}>
                    <Text style={[styles.couponDiscount, { color: colors.primary }]}>{item.discount}</Text>
                    <Text style={[styles.couponOffText, { color: colors.textSecondary }]}>OFF</Text>
                    {selectedCoupon?.id === item.id && (
                      <CheckCircle size={20} color={colors.primary} />
                    )}
                  </View>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>VIP Benefits</Text>
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
                      +{level.bonus} Bonus
                    </Text>
                  </View>
                  {level.level === (user?.vip_level || 1) && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.vipRequirements, { color: colors.textSecondary }]}>
                  {level.requirements}
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Trading Rankings</Text>
            <TouchableOpacity onPress={() => setShowRankingModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.rankingStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>#15</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Your Rank</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>$12,450</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Volume</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>Silver</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Badge</Text>
            </View>
          </View>
          
          <FlatList
            data={rankingData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View 
                style={[
                  styles.rankingItem,
                  { 
                    backgroundColor: item.username === (user?.username || 'You') ? `${colors.primary}10` : 'transparent',
                    borderBottomColor: colors.border 
                  }
                ]}
              >
                <View style={styles.rankPosition}>
                  <Text style={[styles.rankNumber, { color: colors.text }]}>#{item.rank}</Text>
                </View>
                
                <Image source={{ uri: item.avatar }} style={styles.rankAvatar} />
                
                <View style={styles.rankInfo}>
                  <Text style={[styles.rankUsername, { color: colors.text }]}>{item.username}</Text>
                  <Text style={[styles.rankVolume, { color: colors.textSecondary }]}>{item.volume}</Text>
                </View>
                
                <View style={styles.rankBadge}>
                  {getBadgeIcon(item.badge)}
                  <Text style={[styles.rankBadgeText, { color: colors.textSecondary }]}>{item.badge}</Text>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
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
          contentContainerStyle={styles.optimizedScrollContent}
        >
          {renderCompactHeader()}
          {renderCardUploadGrid()}
          {renderCompactOptions()}
          {renderEnhancedVipRanking()}
        </ScrollView>

        {/* Enhanced Floating Sell Button */}
        <Animated.View 
          style={[
            styles.enhancedFloatingSellButton,
            {
              transform: [
                { scale: sellButtonAnim },
                { translateY: sellButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })}
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.enhancedSellButton,
              { 
                backgroundColor: isFormValid() ? colors.primary : colors.border,
                shadowColor: colors.primary,
              }
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
            activeOpacity={0.8}
          >
            <View style={styles.sellButtonContent}>
              <Zap size={20} color="#FFFFFF" />
              <Text style={styles.enhancedSellButtonText}>Sell Now</Text>
            </View>
            {selectedCards.length > 0 && (
              <View style={styles.cardCountBadge}>
                <Text style={styles.cardCountText}>{selectedCards.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Floating Customer Service Button */}
        <View style={styles.floatingCustomerService}>
          <Animated.View style={{ transform: [{ scale: customerServiceAnim }] }}>
            <TouchableOpacity
              style={[styles.customerServiceButton, { backgroundColor: '#25D366' }]}
              onPress={() => Alert.alert('Customer Service', '24/7 support available via WhatsApp, Email, or Live Chat.')}
            >
              <MessageCircle size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {renderEnhancedCouponModal()}
        {renderVIPModal()}
        {renderRankingModal()}
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
  optimizedScrollContent: {
    padding: Spacing.md,
    paddingBottom: 100, // Space for floating button
  },

  // Compact Header Design
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grid-based Upload Section
  uploadGrid: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  uploadLeft: {
    flex: 2,
  },
  uploadRight: {
    flex: 1,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  compactInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    minHeight: 50,
    marginBottom: Spacing.sm,
  },
  uploadHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  compactUploadButton: {
    width: 80,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  miniCardPreview: {
    width: 32,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  miniCardImage: {
    width: '100%',
    height: '100%',
  },
  miniRemoveButton: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCardsIndicator: {
    width: 32,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCardsText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },

  // Compact Options Grid
  optionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  discountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  walletToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  walletToggleOption: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  walletToggleText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  discountValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },

  // Enhanced VIP & Ranking Grid
  vipRankingGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  vipCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  vipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  vipLevel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  vipBonus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  vipDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  vipProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  vipProgressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  rankingCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.lg,
    position: 'relative',
  },
  rankingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  rankingPosition: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  rankingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  rankingDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  rankingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankingBadgeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  // Enhanced Floating Sell Button
  enhancedFloatingSellButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  enhancedSellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  sellButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  enhancedSellButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  cardCountBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },

  // Floating Customer Service
  floatingCustomerService: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.lg,
  },
  customerServiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // Enhanced Modal Styles
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

  // Enhanced Coupon Modal
  enhancedCouponItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  couponItemLeft: {
    flex: 1,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  couponName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  highlightText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  couponDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  couponItemRight: {
    alignItems: 'center',
    gap: 2,
  },
  couponDiscount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  couponOffText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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

  // Ranking Modal Styles
  rankingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  rankPosition: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  rankAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: Spacing.md,
  },
  rankInfo: {
    flex: 1,
  },
  rankUsername: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  rankVolume: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});