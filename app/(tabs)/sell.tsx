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
} from 'react-native';
import { router } from 'expo-router';
import { Image, Upload, Camera, ArrowRight, CircleCheck } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

// Sample gift card types
const giftCardTypes = [
  { id: '1', name: 'Amazon', rate: '₦620/$1' },
  { id: '2', name: 'iTunes', rate: '₦600/$1' },
  { id: '3', name: 'Steam', rate: '₦625/$1' },
  { id: '4', name: 'Google Play', rate: '₦590/$1' },
  { id: '5', name: 'Other', rate: 'Varies' },
];

export default function SellScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [selectedCardType, setSelectedCardType] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('NGN');
  const [hasImage, setHasImage] = useState(false);
  
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      // Handle image
      setHasImage(true);
    }
  };
  
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access photos is required!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      // Handle image
      setHasImage(true);
    }
  };
  
  const isFormValid = () => {
    return (
      selectedCardType !== '' && 
      ((cardCode !== '') || hasImage) && 
      cardAmount !== ''
    );
  };
  
  const handleSubmit = () => {
    if (isFormValid()) {
      // In a real app, we'd send the card data to the server
      router.push('/sell-confirmation' as any);
    }
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
          <Text style={[styles.title, { color: colors.text }]}>Sell Gift Card</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Trade your gift cards for instant cash
          </Text>
          
          <View style={styles.cardTypeContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Card Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardTypesScroll}
            >
              {giftCardTypes.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardTypeItem,
                    {
                      backgroundColor:
                        selectedCardType === card.id
                          ? `${colors.primary}20`
                          : colorScheme === 'dark'
                          ? colors.card
                          : '#F9FAFB',
                      borderColor:
                        selectedCardType === card.id ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedCardType(card.id)}
                >
                  <Text
                    style={[
                      styles.cardTypeName,
                      {
                        color:
                          selectedCardType === card.id ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    {card.name}
                  </Text>
                  <Text
                    style={[
                      styles.cardTypeRate,
                      {
                        color:
                          selectedCardType === card.id
                            ? colors.primary
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {card.rate}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Details</Text>
            
            <Input
              label="Card Amount ($)"
              placeholder="Enter card amount"
              keyboardType="numeric"
              value={cardAmount}
              onChangeText={setCardAmount}
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Card Code</Text>
            <Input
              placeholder="Enter gift card code here"
              multiline
              numberOfLines={3}
              value={cardCode}
              onChangeText={setCardCode}
              inputStyle={styles.codeInput}
            />
            
            <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
            
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                    borderColor: colors.border,
                  },
                ]}
                onPress={pickImage}
              >
                <Image size={24} color={colors.text} />
                <Text style={[styles.uploadButtonText, { color: colors.text }]}>
                  Gallery
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                    borderColor: colors.border,
                  },
                ]}
                onPress={openCamera}
              >
                <Camera size={24} color={colors.text} />
                <Text style={[styles.uploadButtonText, { color: colors.text }]}>
                  Camera
                </Text>
              </TouchableOpacity>
            </View>
            
            {hasImage && (
              <View
                style={[
                  styles.uploadedImageIndicator,
                  { backgroundColor: `${colors.success}20` },
                ]}
              >
                <CircleCheck size={16} color={colors.success} />
                <Text style={[styles.uploadedImageText, { color: colors.success }]}>
                  Image uploaded successfully
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>
            
            <View style={styles.walletSelector}>
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  {
                    backgroundColor:
                      selectedWallet === 'NGN'
                        ? `${colors.primary}20`
                        : 'transparent',
                    borderColor:
                      selectedWallet === 'NGN' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedWallet('NGN')}
              >
                <Text
                  style={[
                    styles.walletOptionText,
                    {
                      color: selectedWallet === 'NGN' ? colors.primary : colors.text,
                    },
                  ]}
                >
                  NGN Wallet 🇳🇬
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  {
                    backgroundColor:
                      selectedWallet === 'USDT'
                        ? `${colors.primary}20`
                        : 'transparent',
                    borderColor:
                      selectedWallet === 'USDT' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedWallet('USDT')}
              >
                <Text
                  style={[
                    styles.walletOptionText,
                    {
                      color: selectedWallet === 'USDT' ? colors.primary : colors.text,
                    },
                  ]}
                >
                  USDT Wallet
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.promoCodeContainer}>
              <Input
                label="Promo Code (Optional)"
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={setPromoCode}
                rightElement={
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      { backgroundColor: promoCode ? colors.primary : colors.border },
                    ]}
                    disabled={!promoCode}
                  >
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  </TouchableOpacity>
                }
              />
            </View>
          </View>
          
          <Card style={styles.estimateCard}>
            <View style={styles.estimateHeader}>
              <Text style={[styles.estimateTitle, { color: colors.text }]}>
                Estimated Payout
              </Text>
              <TouchableOpacity style={styles.rateLink}>
                <Text style={[styles.rateLinkText, { color: colors.primary }]}>
                  View Rates
                </Text>
                <ArrowRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.estimateAmount}>
              <Text style={[styles.estimateValue, { color: colors.text }]}>
                ₦{cardAmount ? parseInt(cardAmount) * 620 : 0}
              </Text>
              <Text style={[styles.estimateRate, { color: colors.textSecondary }]}>
                at ₦620/$1
              </Text>
            </View>
          </Card>
          
          <Button
            title="Submit Card"
            onPress={handleSubmit}
            disabled={!isFormValid()}
            style={styles.submitButton}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  cardTypeContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  cardTypesScroll: {
    paddingRight: Spacing.lg,
  },
  cardTypeItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginRight: Spacing.sm,
    borderWidth: 1,
    minWidth: 100,
  },
  cardTypeName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  cardTypeRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  codeInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginVertical: Spacing.md,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.xs,
  },
  uploadedImageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  uploadedImageText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.xs,
  },
  walletSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  walletOption: {
    width: '48%',
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  walletOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  promoCodeContainer: {
    position: 'relative',
  },
  verifyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
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
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  rateLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateLinkText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  estimateAmount: {
    alignItems: 'center',
  },
  estimateValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  estimateRate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  submitButton: {
    marginBottom: Spacing.xxl,
  },
});