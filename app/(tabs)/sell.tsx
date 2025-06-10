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
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';

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
      // Use window.prompt for web platform
      const code = window.prompt('Enter your discount code:', discountCode);
      if (code !== null) {
        setDiscountCode(code);
        if (code.trim()) {
          Alert.alert('Success', 'Discount code applied!');
        }
      }
    } else {
      // Use Alert.prompt for native platforms
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
      setDiscountCode('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit cards. Please try again.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
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
        numberOfLines={4}
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
      onPress={handleDiscountCodeInput}
    >
      <View style={styles.discountContent}>
        <Percent size={20} color={colors.primary} />
        <Text style={[styles.discountText, { color: colors.text }]}>
          {discountCode ? `Code: ${discountCode}` : 'Discount Code'}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderVipSection = () => (
    <View style={styles.vipSection}>
      <TouchableOpacity 
        style={[styles.vipItem, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('VIP Benefits', `You are VIP Level ${user?.vip_level || 1} with exclusive benefits!`)}
      >
        <View style={styles.vipContent}>
          <Crown size={20} color="#FFD700" />
          <Text style={styles.vipText}>VIP1 rate 0.25%</Text>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.vipItem, { backgroundColor: '#1E40AF' }]}
        onPress={() => router.push('/rates')}
      >
        <View style={styles.vipContent}>
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.vipText}>Rate 0%</Text>
        </View>
        <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
    </View>
  );

  const renderCompensationSection = () => (
    <View style={styles.compensationSection}>
      <TouchableOpacity 
        style={styles.compensationItem}
        onPress={() => Alert.alert('Overdue Compensation', 'Learn about our overdue compensation policy.')}
      >
        <View style={styles.compensationContent}>
          <View style={[styles.compensationIcon, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.compensationEmoji}>🔶</Text>
          </View>
          <Text style={[styles.compensationText, { color: colors.text }]}>
            Overdue Compensation
          </Text>
          <Text style={[styles.compensationSubtext, { color: colors.textSecondary }]}>
            Timeout Compensation...
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.compensationItem}
        onPress={() => Alert.alert('Trading Rankings', 'View current trading rankings and leaderboard.')}
      >
        <View style={styles.compensationContent}>
          <View style={[styles.compensationIcon, { backgroundColor: '#10B981' }]}>
            <Trophy size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.compensationText, { color: colors.text }]}>
            Trading Rankings
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
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
          {renderHeader()}
          {renderCardUploadSection()}
          {renderWalletSelection()}
          {renderDiscountSection()}
          {renderVipSection()}
          {renderCompensationSection()}
          
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

        {/* Floating Action Buttons */}
        <View style={styles.floatingButtons}>
          {/* Calculator Button */}
          <TouchableOpacity
            style={[styles.calculatorButton, { backgroundColor: colors.primary }]}
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
              <Text style={styles.customerServiceText}>?</Text>
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

  // Header
  header: {
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
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
    minHeight: 100,
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
  },
  cardPreviewImage: {
    width: '100%',
    height: '100%',
  },

  // Wallet Section
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
    marginBottom: Spacing.lg,
  },
  discountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  discountText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },

  // VIP Section
  vipSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
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

  // Compensation Section
  compensationSection: {
    marginBottom: Spacing.xl,
  },
  compensationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  compensationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compensationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  compensationEmoji: {
    fontSize: 16,
  },
  compensationText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  compensationSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: Spacing.sm,
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
  customerServiceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    position: 'absolute',
  },
});