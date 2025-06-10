import React, { useState, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Plus, 
  Calculator,
  MessageCircle,
  Crown,
  ChevronRight,
  Percent,
  Trophy,
  TrendingUp,
  Phone,
  Star,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  Gift,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';

const { width } = Dimensions.get('window');

interface SelectedCard {
  id: string;
  image?: string;
}

function SellScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardInfo, setCardInfo] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<'NGN' | 'USDT'>('NGN');
  const [discountCode, setDiscountCode] = useState('');
  
  const customerServiceAnim = useRef(new Animated.Value(1)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const benefitsAnim = useRef(new Animated.Value(0)).current;

  // Animations
  React.useEffect(() => {
    // Hero section animation
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Benefits animation with delay
    Animated.timing(benefitsAnim, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Customer service pulse animation
    const customerPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(customerServiceAnim, {
          toValue: 1.1,
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

  const handleDiscountCodeInput = () => {
    if (Platform.OS === 'web') {
      const code = window.prompt('Enter your discount code:', discountCode);
      if (code !== null) {
        setDiscountCode(code);
        if (code.trim()) {
          Alert.alert('Success', 'Discount code applied!');
        }
      }
    } else {
      Alert.prompt(
        'Discount Code',
        'Enter your discount code:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Apply', 
            onPress: (code) => {
              if (code) {
                setDiscountCode(code);
                Alert.alert('Success', 'Discount code applied!');
              }
            }
          },
        ],
        'plain-text',
        discountCode
      );
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
      
      setSelectedCards([]);
      setCardInfo('');
      setDiscountCode('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit cards. Please try again.');
    }
  };

  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(card => card.id !== cardId));
  };

  // Hero Section Component
  const renderHeroSection = () => (
    <Animated.View 
      style={[
        styles.heroSection,
        {
          backgroundColor: colors.primary,
          opacity: heroAnim,
          transform: [{
            translateY: heroAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      <View style={styles.heroContent}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Sell Your Gift Cards</Text>
          <Text style={styles.heroSubtitle}>
            Get the best rates instantly with our secure platform
          </Text>
          <View style={styles.heroFeatures}>
            <View style={styles.heroFeature}>
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.heroFeatureText}>Instant Processing</Text>
            </View>
            <View style={styles.heroFeature}>
              <Shield size={16} color="#FFFFFF" />
              <Text style={styles.heroFeatureText}>100% Secure</Text>
            </View>
            <View style={styles.heroFeature}>
              <Zap size={16} color="#FFFFFF" />
              <Text style={styles.heroFeatureText}>Best Rates</Text>
            </View>
          </View>
        </View>
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </Animated.View>
  );

  // Benefits Section Component
  const renderBenefitsSection = () => (
    <Animated.View 
      style={[
        styles.benefitsSection,
        {
          opacity: benefitsAnim,
          transform: [{
            translateY: benefitsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          }],
        }
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Choose AfriTrade?</Text>
      <View style={styles.benefitsGrid}>
        <View style={[styles.benefitCard, { backgroundColor: colors.card }]}>
          <View style={[styles.benefitIcon, { backgroundColor: `${colors.primary}15` }]}>
            <TrendingUp size={24} color={colors.primary} />
          </View>
          <Text style={[styles.benefitTitle, { color: colors.text }]}>Best Rates</Text>
          <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
            Competitive exchange rates updated in real-time
          </Text>
        </View>
        
        <View style={[styles.benefitCard, { backgroundColor: colors.card }]}>
          <View style={[styles.benefitIcon, { backgroundColor: `${colors.success}15` }]}>
            <Clock size={24} color={colors.success} />
          </View>
          <Text style={[styles.benefitTitle, { color: colors.text }]}>Fast Processing</Text>
          <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
            Get paid within 5-15 minutes of verification
          </Text>
        </View>
        
        <View style={[styles.benefitCard, { backgroundColor: colors.card }]}>
          <View style={[styles.benefitIcon, { backgroundColor: `${colors.secondary}15` }]}>
            <Shield size={24} color={colors.secondary} />
          </View>
          <Text style={[styles.benefitTitle, { color: colors.text }]}>Secure Platform</Text>
          <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
            Bank-level security for all transactions
          </Text>
        </View>
        
        <View style={[styles.benefitCard, { backgroundColor: colors.card }]}>
          <View style={[styles.benefitIcon, { backgroundColor: `${colors.warning}15` }]}>
            <Star size={24} color={colors.warning} />
          </View>
          <Text style={[styles.benefitTitle, { color: colors.text }]}>VIP Benefits</Text>
          <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
            Exclusive rates and priority support
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  // Card Upload Section Component
  const renderCardUploadSection = () => (
    <View style={styles.uploadSection}>
      <View style={styles.sectionHeader}>
        <Gift size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upload Your Cards</Text>
      </View>
      
      <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
        Add up to 10 gift cards per transaction. You can also enter card details manually.
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
        numberOfLines={4}
        textAlignVertical="top"
      />
      
      <View style={styles.uploadButtonContainer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            { 
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={addCardImage}
        >
          <Camera size={24} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.uploadButton,
            styles.uploadButtonSecondary,
            { 
              backgroundColor: 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={addCardImage}
        >
          <ImageIcon size={24} color={colors.primary} />
          <Text style={[styles.uploadButtonText, { color: colors.primary }]}>Choose Image</Text>
        </TouchableOpacity>
      </View>
      
      {/* Display uploaded cards */}
      {selectedCards.length > 0 && (
        <View style={styles.cardPreviewSection}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>
            Selected Cards ({selectedCards.length}/10)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardPreviewContainer}>
            {selectedCards.map((card) => (
              <View key={card.id} style={styles.cardPreview}>
                <Image source={{ uri: card.image }} style={styles.cardPreviewImage} />
                <TouchableOpacity
                  style={[styles.removeCardButton, { backgroundColor: colors.error }]}
                  onPress={() => removeCard(card.id)}
                >
                  <Text style={styles.removeCardText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  // Wallet Selection Component
  const renderWalletSelection = () => (
    <View style={styles.walletSection}>
      <View style={styles.sectionHeader}>
        <Crown size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Wallet</Text>
      </View>
      
      <View style={styles.walletOptions}>
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
          <View style={styles.walletOptionContent}>
            <Text style={[
              styles.walletOptionTitle,
              { color: selectedWallet === 'NGN' ? '#FFFFFF' : colors.text }
            ]}>
              NGN Wallet
            </Text>
            <Text style={[
              styles.walletOptionSubtitle,
              { color: selectedWallet === 'NGN' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
            ]}>
              Nigerian Naira
            </Text>
          </View>
          {selectedWallet === 'NGN' && (
            <CheckCircle size={20} color="#FFFFFF" />
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
          <View style={styles.walletOptionContent}>
            <Text style={[
              styles.walletOptionTitle,
              { color: selectedWallet === 'USDT' ? '#FFFFFF' : colors.text }
            ]}>
              USDT Wallet
            </Text>
            <Text style={[
              styles.walletOptionSubtitle,
              { color: selectedWallet === 'USDT' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
            ]}>
              Tether USD
            </Text>
          </View>
          {selectedWallet === 'USDT' && (
            <CheckCircle size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Discount Section Component
  const renderDiscountSection = () => (
    <TouchableOpacity 
      style={[
        styles.discountSection,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={handleDiscountCodeInput}
    >
      <View style={styles.discountContent}>
        <View style={[styles.discountIcon, { backgroundColor: `${colors.warning}15` }]}>
          <Percent size={20} color={colors.warning} />
        </View>
        <View style={styles.discountTextContainer}>
          <Text style={[styles.discountTitle, { color: colors.text }]}>
            {discountCode ? `Code: ${discountCode}` : 'Have a Discount Code?'}
          </Text>
          <Text style={[styles.discountSubtitle, { color: colors.textSecondary }]}>
            Tap to enter your promo code
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  // VIP Section Component
  const renderVipSection = () => (
    <View style={styles.vipSection}>
      <TouchableOpacity 
        style={[styles.vipItem, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('VIP Benefits', `You are VIP Level ${user?.vip_level || 1} with exclusive benefits!`)}
      >
        <View style={styles.vipContent}>
          <Crown size={20} color="#FFD700" />
          <Text style={styles.vipText}>VIP{user?.vip_level || 1} Rate Bonus: 0.25%</Text>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.vipItem, { backgroundColor: colors.success }]}
        onPress={() => router.push('/rates')}
      >
        <View style={styles.vipContent}>
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.vipText}>View Live Rates</Text>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
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
          {/* Contact Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => Alert.alert('Contact Us', 'Get help via WhatsApp, Email, or Live Chat.')}
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.contactText}>Contact Us</Text>
            </TouchableOpacity>
          </View>

          {renderHeroSection()}
          {renderBenefitsSection()}
          {renderCardUploadSection()}
          {renderWalletSelection()}
          {renderDiscountSection()}
          {renderVipSection()}
          
          {/* Submit Button */}
          <Button
            title="Sell Cards Now"
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

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <Text style={[styles.trustTitle, { color: colors.textSecondary }]}>
              Trusted by 50,000+ users across Africa
            </Text>
            <View style={styles.trustIndicators}>
              <View style={styles.trustItem}>
                <Shield size={16} color={colors.success} />
                <Text style={[styles.trustText, { color: colors.textSecondary }]}>SSL Secured</Text>
              </View>
              <View style={styles.trustItem}>
                <CheckCircle size={16} color={colors.success} />
                <Text style={[styles.trustText, { color: colors.textSecondary }]}>Verified Platform</Text>
              </View>
              <View style={styles.trustItem}>
                <Star size={16} color={colors.warning} />
                <Text style={[styles.trustText, { color: colors.textSecondary }]}>4.8/5 Rating</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Floating Action Buttons */}
        <View style={styles.floatingButtons}>
          <TouchableOpacity
            style={[styles.calculatorButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/calculator' as any)}
          >
            <Calculator size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: customerServiceAnim }] }}>
            <TouchableOpacity
              style={[styles.customerServiceButton, { backgroundColor: '#25D366' }]}
              onPress={() => Alert.alert('Customer Service', '24/7 support available via WhatsApp, Email, or Live Chat.')}
            >
              <MessageCircle size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    paddingBottom: 120,
  },

  // Header
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
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

  // Hero Section
  heroSection: {
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: Spacing.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  heroFeatures: {
    gap: Spacing.sm,
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroFeatureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  heroImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Benefits Section
  benefitsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  benefitCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },

  // Upload Section
  uploadSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  uploadHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardInfoInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.lg,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 100,
    marginBottom: Spacing.lg,
  },
  uploadButtonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  uploadButtonSecondary: {
    backgroundColor: 'transparent',
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cardPreviewSection: {
    marginTop: Spacing.lg,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
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
  removeCardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },

  // Wallet Section
  walletSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  walletOptions: {
    gap: Spacing.md,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
  },
  walletOptionContent: {
    flex: 1,
  },
  walletOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  walletOptionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // Discount Section
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 12,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  discountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  discountTextContainer: {
    flex: 1,
  },
  discountTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  discountSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // VIP Section
  vipSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  vipItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
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
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: 12,
  },

  // Trust Section
  trustSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  trustTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trustText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // Floating Buttons
  floatingButtons: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  calculatorButton: {
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
  },
});