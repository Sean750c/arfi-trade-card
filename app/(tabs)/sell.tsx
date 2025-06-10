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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Upload, 
  Camera, 
  ArrowRight, 
  CircleCheck, 
  Calculator,
  MessageCircle,
  Star,
  Gift,
  Zap,
  Crown,
  Trophy,
  Percent,
  Tag,
  Wallet,
  DollarSign,
  X,
  Plus,
  Info
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';

const { width } = Dimensions.get('window');

// Sample gift card types with enhanced data
const giftCardTypes = [
  { 
    id: '1', 
    name: 'Amazon', 
    rate: '₦620/$1', 
    image: 'https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg',
    category: 'E-commerce',
    trending: true
  },
  { 
    id: '2', 
    name: 'iTunes', 
    rate: '₦600/$1', 
    image: 'https://images.pexels.com/photos/1038628/pexels-photo-1038628.jpeg',
    category: 'Entertainment',
    trending: false
  },
  { 
    id: '3', 
    name: 'Steam', 
    rate: '₦625/$1', 
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category: 'Gaming',
    trending: true
  },
  { 
    id: '4', 
    name: 'Google Play', 
    rate: '₦590/$1', 
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
    category: 'Apps',
    trending: false
  },
  { 
    id: '5', 
    name: 'Visa', 
    rate: '₦615/$1', 
    image: 'https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg',
    category: 'Payment',
    trending: true
  },
];

// Sample promotions data
const activePromotions = [
  {
    id: '1',
    title: 'Weekend Bonus',
    description: 'Get 5% extra on all Steam cards',
    type: 'bonus',
    value: '5%',
    endTime: '2024-02-25T23:59:59Z',
  },
  {
    id: '2',
    title: 'Trading Competition',
    description: 'Top 10 traders win cash prizes',
    type: 'competition',
    value: '$500',
    endTime: '2024-02-28T23:59:59Z',
  },
];

interface SelectedCard {
  id: string;
  type: string;
  image?: string;
  amount?: string;
  password?: string;
}

function SellScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  
  const [selectedCardType, setSelectedCardType] = useState('');
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardPassword, setCardPassword] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('NGN');
  const [promoCode, setPromoCode] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const customerServiceAnim = useRef(new Animated.Value(1)).current;

  // Pulse animations
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

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

    return () => {
      pulse.stop();
      customerPulse.stop();
    };
  }, []);

  const addCardImage = async (method: 'camera' | 'gallery') => {
    if (selectedCards.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 cards per transaction.');
      return;
    }

    try {
      let result;
      
      if (method === 'camera') {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
          aspect: [4, 3],
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Photo library permission is required.');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          aspect: [4, 3],
        });
      }
      
      if (!result.canceled && result.assets[0]) {
        const newCard: SelectedCard = {
          id: Date.now().toString(),
          type: selectedCardType || 'Unknown',
          image: result.assets[0].uri,
        };
        setSelectedCards([...selectedCards, newCard]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add image. Please try again.');
    }
  };

  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(card => card.id !== cardId));
  };

  const updateCardDetails = (cardId: string, field: 'amount' | 'password', value: string) => {
    setSelectedCards(selectedCards.map(card => 
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const calculateEstimatedPayout = () => {
    const totalAmount = selectedCards.reduce((sum, card) => {
      return sum + (parseFloat(card.amount || '0') || 0);
    }, 0);
    
    const selectedType = giftCardTypes.find(type => type.id === selectedCardType);
    const rate = selectedType ? parseFloat(selectedType.rate.replace('₦', '').replace('/$1', '')) : 620;
    
    return totalAmount * rate;
  };

  const isFormValid = () => {
    return (
      selectedCardType !== '' && 
      selectedCards.length > 0 &&
      selectedCards.every(card => card.amount && parseFloat(card.amount) > 0) &&
      cardPassword.trim() !== ''
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      // Navigate to confirmation screen
      router.push('/sell-confirmation' as any);
    } else {
      Alert.alert('Incomplete Form', 'Please fill in all required fields and add at least one card.');
    }
  };

  const renderVIPSection = () => (
    <Card style={[styles.vipCard, { backgroundColor: colors.primary }]}>
      <View style={styles.vipHeader}>
        <View style={styles.vipBadge}>
          <Crown size={20} color="#FFD700" />
          <Text style={styles.vipLevel}>VIP {user?.vip_level || 1}</Text>
        </View>
        <Text style={styles.vipBalance}>
          Balance: {user?.currency_symbol}{user?.money || '0'}
        </Text>
      </View>
      
      <Text style={styles.vipBenefits}>
        • {user?.vip_level === 1 ? '2%' : user?.vip_level === 2 ? '3%' : '5%'} bonus on all trades
        • Priority customer support
        • Exclusive rate previews
      </Text>
    </Card>
  );

  const renderPromotionsSection = () => (
    <View style={styles.promotionsSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Promotions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {activePromotions.map((promo) => (
          <Card key={promo.id} style={[styles.promoCard, { backgroundColor: '#FF6B6B' }]}>
            <View style={styles.promoHeader}>
              <Trophy size={16} color="#FFFFFF" />
              <Text style={styles.promoTitle}>{promo.title}</Text>
            </View>
            <Text style={styles.promoDescription}>{promo.description}</Text>
            <View style={styles.promoValue}>
              <Text style={styles.promoValueText}>{promo.value}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderCardTypeSelection = () => (
    <View style={styles.cardTypeContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Card Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {giftCardTypes.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.cardTypeItem,
              {
                backgroundColor: selectedCardType === card.id
                  ? `${colors.primary}20`
                  : colorScheme === 'dark' ? colors.card : '#F9FAFB',
                borderColor: selectedCardType === card.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedCardType(card.id)}
          >
            <Image source={{ uri: card.image }} style={styles.cardTypeImage} />
            {card.trending && (
              <View style={styles.trendingBadge}>
                <Zap size={10} color="#FFFFFF" />
              </View>
            )}
            <Text style={[
              styles.cardTypeName,
              { color: selectedCardType === card.id ? colors.primary : colors.text }
            ]}>
              {card.name}
            </Text>
            <Text style={[
              styles.cardTypeRate,
              { color: selectedCardType === card.id ? colors.primary : colors.textSecondary }
            ]}>
              {card.rate}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCardGallery = () => (
    <View style={styles.cardGallerySection}>
      <View style={styles.galleryHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Card Images ({selectedCards.length}/10)
        </Text>
        <View style={styles.galleryActions}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => addCardImage('gallery')}
          >
            <Upload size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.secondary }]}
            onPress={() => addCardImage('camera')}
          >
            <Camera size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedCards.map((card) => (
          <View key={card.id} style={styles.cardImageContainer}>
            <Image source={{ uri: card.image }} style={styles.cardImage} />
            <TouchableOpacity
              style={styles.removeCardButton}
              onPress={() => removeCard(card.id)}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.cardDetailsOverlay}>
              <Input
                placeholder="Amount ($)"
                value={card.amount || ''}
                onChangeText={(value) => updateCardDetails(card.id, 'amount', value)}
                keyboardType="numeric"
                containerStyle={styles.cardDetailInput}
                inputStyle={styles.cardDetailInputText}
              />
            </View>
          </View>
        ))}
        
        {selectedCards.length < 10 && (
          <TouchableOpacity
            style={styles.addCardPlaceholder}
            onPress={() => addCardImage('gallery')}
          >
            <Plus size={32} color={colors.textSecondary} />
            <Text style={[styles.addCardText, { color: colors.textSecondary }]}>
              Add Card
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  const renderTransactionDetails = () => (
    <View style={styles.transactionSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction Details</Text>
      
      {/* Wallet Selection */}
      <View style={styles.walletSelector}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Select Wallet</Text>
        <View style={styles.walletOptions}>
          <TouchableOpacity
            style={[
              styles.walletOption,
              {
                backgroundColor: selectedWallet === 'NGN' ? `${colors.primary}20` : 'transparent',
                borderColor: selectedWallet === 'NGN' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedWallet('NGN')}
          >
            <Wallet size={20} color={selectedWallet === 'NGN' ? colors.primary : colors.text} />
            <Text style={[
              styles.walletOptionText,
              { color: selectedWallet === 'NGN' ? colors.primary : colors.text }
            ]}>
              {user?.currency_symbol || '₦'} Wallet
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.walletOption,
              {
                backgroundColor: selectedWallet === 'USDT' ? `${colors.primary}20` : 'transparent',
                borderColor: selectedWallet === 'USDT' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedWallet('USDT')}
          >
            <DollarSign size={20} color={selectedWallet === 'USDT' ? colors.primary : colors.text} />
            <Text style={[
              styles.walletOptionText,
              { color: selectedWallet === 'USDT' ? colors.primary : colors.text }
            ]}>
              USDT Wallet
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Password */}
      <Input
        label="Card Password/PIN *"
        placeholder="Enter card password or PIN"
        value={cardPassword}
        onChangeText={setCardPassword}
        secureTextEntry
      />

      {/* Remarks */}
      <Input
        label="Remarks (Optional)"
        placeholder="Add any additional notes..."
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={3}
        inputStyle={styles.remarksInput}
      />
    </View>
  );

  const renderPromoSection = () => (
    <View style={styles.promoSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo & Discount Codes</Text>
      
      <View style={styles.promoInputs}>
        <Input
          label="Promotion Code"
          placeholder="Enter promo code"
          value={promoCode}
          onChangeText={setPromoCode}
          rightElement={
            <TouchableOpacity style={styles.verifyButton}>
              <Percent size={16} color={colors.primary} />
            </TouchableOpacity>
          }
        />
        
        <Input
          label="Discount Code"
          placeholder="Enter discount code"
          value={discountCode}
          onChangeText={setDiscountCode}
          rightElement={
            <TouchableOpacity style={styles.verifyButton}>
              <Tag size={16} color={colors.primary} />
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );

  const renderEstimateCard = () => (
    <Card style={[styles.estimateCard, { backgroundColor: colors.card }]}>
      <View style={styles.estimateHeader}>
        <Text style={[styles.estimateTitle, { color: colors.text }]}>
          Estimated Payout
        </Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert('Rate Info', 'Rates are updated in real-time and may vary based on market conditions.')}
        >
          <Info size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.estimateAmount}>
        <Text style={[styles.estimateValue, { color: colors.primary }]}>
          {user?.currency_symbol || '₦'}{calculateEstimatedPayout().toLocaleString()}
        </Text>
        <Text style={[styles.estimateRate, { color: colors.textSecondary }]}>
          {selectedCards.length} card(s) • Total: ${selectedCards.reduce((sum, card) => sum + (parseFloat(card.amount || '0') || 0), 0)}
        </Text>
      </View>
    </Card>
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sell Gift Cards</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Trade your gift cards for instant cash
            </Text>
          </View>

          {/* VIP Section */}
          {renderVIPSection()}
          
          {/* Promotions Section */}
          {renderPromotionsSection()}
          
          {/* Card Type Selection */}
          {renderCardTypeSelection()}
          
          {/* Card Gallery */}
          {renderCardGallery()}
          
          {/* Transaction Details */}
          {renderTransactionDetails()}
          
          {/* Promo Section */}
          {renderPromoSection()}
          
          {/* Estimate Card */}
          {renderEstimateCard()}
          
          {/* Submit Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Button
              title="Submit Cards for Review"
              onPress={handleSubmit}
              disabled={!isFormValid()}
              style={[
                styles.submitButton,
                { backgroundColor: isFormValid() ? colors.primary : colors.border }
              ]}
              fullWidth
            />
          </Animated.View>
        </ScrollView>

        {/* Floating Action Buttons */}
        <View style={styles.floatingButtons}>
          {/* Calculator Button */}
          <TouchableOpacity
            style={[styles.calculatorButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/calculator' as any)}
          >
            <Calculator size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Customer Service Button */}
          <Animated.View style={{ transform: [{ scale: customerServiceAnim }] }}>
            <TouchableOpacity
              style={[styles.customerServiceButton, { backgroundColor: '#25D366' }]}
              onPress={() => Alert.alert('Customer Service', '24/7 support available via WhatsApp, Email, or Live Chat.')}
            >
              <MessageCircle size={24} color="#FFFFFF" />
              <Text style={styles.customerServiceText}>24/7</Text>
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
    padding: Spacing.lg,
    paddingBottom: 120, // Space for floating buttons
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },

  // VIP Section
  vipCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  vipLevel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: Spacing.xs,
  },
  vipBalance: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  vipBenefits: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },

  // Promotions Section
  promotionsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  promoCard: {
    width: 200,
    marginRight: Spacing.md,
    padding: Spacing.md,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: Spacing.xs,
  },
  promoDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  promoValue: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  promoValueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },

  // Card Type Selection
  cardTypeContainer: {
    marginBottom: Spacing.lg,
  },
  cardTypeItem: {
    width: 120,
    padding: Spacing.md,
    borderRadius: 12,
    marginRight: Spacing.md,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  cardTypeImage: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  trendingBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTypeName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  cardTypeRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // Card Gallery
  cardGallerySection: {
    marginBottom: Spacing.lg,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  galleryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageContainer: {
    width: 150,
    height: 120,
    marginRight: Spacing.md,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeCardButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: Spacing.xs,
  },
  cardDetailInput: {
    marginBottom: 0,
  },
  cardDetailInputText: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 32,
  },
  addCardPlaceholder: {
    width: 150,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: Spacing.xs,
  },

  // Transaction Section
  transactionSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.sm,
  },
  walletSelector: {
    marginBottom: Spacing.md,
  },
  walletOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  walletOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  walletOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  remarksInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },

  // Promo Section
  promoSection: {
    marginBottom: Spacing.lg,
  },
  promoInputs: {
    gap: Spacing.sm,
  },
  verifyButton: {
    padding: Spacing.sm,
  },

  // Estimate Card
  estimateCard: {
    marginBottom: Spacing.lg,
  },
  estimateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  estimateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  infoButton: {
    padding: Spacing.xs,
  },
  estimateAmount: {
    alignItems: 'center',
  },
  estimateValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  estimateRate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // Submit Button
  submitButton: {
    height: 56,
    marginBottom: Spacing.xl,
  },

  // Floating Buttons
  floatingButtons: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    gap: Spacing.md,
  },
  calculatorButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  customerServiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  customerServiceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
});