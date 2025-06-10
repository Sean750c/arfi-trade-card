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
  CircleCheck, 
  Calculator,
  MessageCircle,
  Crown,
  Gift,
  ChevronDown,
  ChevronUp,
  Info,
  Percent,
  X,
  Plus,
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

interface SelectedCard {
  id: string;
  image?: string;
  amount?: string;
}

function SellScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [cardPassword, setCardPassword] = useState('');
  const [remarks, setRemarks] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [showVipInfo, setShowVipInfo] = useState(false);
  
  const customerServiceAnim = useRef(new Animated.Value(1)).current;
  const vipInfoAnim = useRef(new Animated.Value(0)).current;

  // Customer service pulse animation
  React.useEffect(() => {
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

  // VIP info animation
  React.useEffect(() => {
    Animated.timing(vipInfoAnim, {
      toValue: showVipInfo ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showVipInfo]);

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

  const updateCardAmount = (cardId: string, amount: string) => {
    setSelectedCards(selectedCards.map(card => 
      card.id === cardId ? { ...card, amount } : card
    ));
  };

  const calculateTotalAmount = () => {
    return selectedCards.reduce((sum, card) => {
      return sum + (parseFloat(card.amount || '0') || 0);
    }, 0);
  };

  const isFormValid = () => {
    return (
      selectedCards.length > 0 &&
      selectedCards.every(card => card.amount && parseFloat(card.amount) > 0) &&
      cardPassword.trim() !== ''
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Form', 'Please add at least one card with amount and enter card password.');
      return;
    }

    try {
      // Here you would call the /gc/order/appaddd endpoint
      // For now, we'll show a success message
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
      setCardPassword('');
      setRemarks('');
      setDiscountCode('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit cards. Please try again.');
    }
  };

  const renderVipSection = () => (
    <Card style={[styles.vipCard, { backgroundColor: colors.primary }]}>
      <TouchableOpacity 
        style={styles.vipHeader}
        onPress={() => setShowVipInfo(!showVipInfo)}
        activeOpacity={0.8}
      >
        <View style={styles.vipBadge}>
          <Crown size={20} color="#FFD700" />
          <Text style={styles.vipLevel}>VIP {user?.vip_level || 1}</Text>
        </View>
        <View style={styles.vipMainInfo}>
          <Text style={styles.vipBalance}>
            Balance: {user?.currency_symbol}{user?.money || '0'}
          </Text>
          <Text style={styles.vipBonus}>
            +{user?.vip_level === 1 ? '2%' : user?.vip_level === 2 ? '3%' : '5%'} Bonus
          </Text>
        </View>
        {showVipInfo ? <ChevronUp size={20} color="#FFFFFF" /> : <ChevronDown size={20} color="#FFFFFF" />}
      </TouchableOpacity>
      
      <Animated.View style={[
        styles.vipExpandedInfo,
        {
          maxHeight: vipInfoAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 120],
          }),
          opacity: vipInfoAnim,
        }
      ]}>
        <View style={styles.vipBenefitsList}>
          <Text style={styles.vipBenefitItem}>• Priority customer support</Text>
          <Text style={styles.vipBenefitItem}>• Exclusive rate previews</Text>
          <Text style={styles.vipBenefitItem}>• Faster processing times</Text>
          <Text style={styles.vipBenefitItem}>• Special promotional offers</Text>
        </View>
      </Animated.View>
    </Card>
  );

  const renderCardGallery = () => (
    <View style={styles.cardGallerySection}>
      <View style={styles.galleryHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Upload Card Images ({selectedCards.length}/10)
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
            
            <View style={styles.cardAmountOverlay}>
              <Input
                placeholder="Amount ($)"
                value={card.amount || ''}
                onChangeText={(value) => updateCardAmount(card.id, value)}
                keyboardType="numeric"
                containerStyle={styles.cardAmountInput}
                inputStyle={styles.cardAmountInputText}
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
      
      {/* Card Password */}
      <Input
        label="Card Password/PIN *"
        placeholder="Enter card password or PIN"
        value={cardPassword}
        onChangeText={setCardPassword}
        secureTextEntry
      />

      {/* Remarks with PIN option */}
      <Input
        label="Remarks (Optional)"
        placeholder="Additional notes or card PIN if different..."
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={2}
        inputStyle={styles.remarksInput}
      />

      {/* Unified Discount Code */}
      <Input
        label="Discount Code (Optional)"
        placeholder="Enter discount or promo code"
        value={discountCode}
        onChangeText={setDiscountCode}
        rightElement={
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={() => Alert.alert('Code Verified', 'Discount code applied successfully!')}
          >
            <Percent size={16} color={colors.primary} />
          </TouchableOpacity>
        }
      />
    </View>
  );

  const renderSummaryCard = () => (
    <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
      <View style={styles.summaryHeader}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Transaction Summary
        </Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert('Rate Info', 'Final amount will be calculated based on current market rates at the time of processing.')}
        >
          <Info size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.summaryDetails}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Cards:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {selectedCards.length}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Amount:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${calculateTotalAmount().toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            VIP Bonus:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            +{user?.vip_level === 1 ? '2%' : user?.vip_level === 2 ? '3%' : '5%'}
          </Text>
        </View>
        
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text, fontFamily: 'Inter-SemiBold' }]}>
            Status:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.warning, fontFamily: 'Inter-SemiBold' }]}>
            Pending Review
          </Text>
        </View>
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
              Quick and secure card trading
            </Text>
          </View>

          {/* VIP Section */}
          {renderVipSection()}
          
          {/* Card Gallery */}
          {renderCardGallery()}
          
          {/* Transaction Details */}
          {renderTransactionDetails()}
          
          {/* Summary Card */}
          {renderSummaryCard()}
          
          {/* Submit Button */}
          <Button
            title="Submit Cards for Review"
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

        {/* Floating Action Buttons */}
        <View style={styles.floatingButtons}>
          {/* Calculator Button */}
          <TouchableOpacity
            style={[styles.calculatorButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/calculator' as any)}
          >
            <Calculator size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Customer Service Button */}
          <Animated.View style={{ transform: [{ scale: customerServiceAnim }] }}>
            <TouchableOpacity
              style={[styles.customerServiceButton, { backgroundColor: '#25D366' }]}
              onPress={() => Alert.alert('Customer Service', '24/7 support available via WhatsApp, Email, or Live Chat.')}
            >
              <MessageCircle size={20} color="#FFFFFF" />
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
    paddingBottom: 100, // Space for floating buttons
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
    overflow: 'hidden',
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  vipMainInfo: {
    flex: 1,
    alignItems: 'center',
  },
  vipBalance: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  vipBonus: {
    color: '#FFD700',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  vipExpandedInfo: {
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  vipBenefitsList: {
    paddingTop: Spacing.sm,
  },
  vipBenefitItem: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 2,
  },

  // Card Gallery
  cardGallerySection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
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
    width: 140,
    height: 100,
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
  cardAmountOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: Spacing.xs,
  },
  cardAmountInput: {
    marginBottom: 0,
  },
  cardAmountInputText: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 32,
  },
  addCardPlaceholder: {
    width: 140,
    height: 100,
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
  remarksInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  verifyButton: {
    padding: Spacing.sm,
  },

  // Summary Card
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  infoButton: {
    padding: Spacing.xs,
  },
  summaryDetails: {
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  summaryDivider: {
    height: 1,
    marginVertical: Spacing.sm,
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
    gap: Spacing.sm,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  customerServiceText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    marginTop: 1,
  },
});