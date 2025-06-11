import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Calculator, RefreshCw, TrendingUp, ArrowRight, Crown, Star, Gift } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { CalculatorService } from '@/services/calculator';
import type { CalculatorData, CardCategory, CardItem } from '@/types/api';

const denominations = ['$25', '$50', '$100', '$200', '$500'];
const currencies = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USDT', symbol: 'USDT', name: 'Tether' },
];

export default function CalculatorScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, isAuthenticated } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState('$100');
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [customAmount, setCustomAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch calculator data on component mount
  useEffect(() => {
    fetchCalculatorData();
  }, [user, selectedCountry]);

  // Calculate amount when inputs change
  useEffect(() => {
    if (selectedCard) {
      calculateAmount();
    }
  }, [selectedCard, selectedDenomination, customAmount, selectedCurrency, calculatorData]);

  const fetchCalculatorData = async () => {
    setLoading(true);
    try {
      const countryId = user?.country_id || selectedCountry?.id || 1;
      const params = {
        country_id: countryId,
        ...(isAuthenticated && user?.token && { token: user.token }),
      };

      const data = await CalculatorService.getCalculatorData(params);
      setCalculatorData(data);
      
      // Set default card if available
      if (data.card_list.length > 0 && data.card_list[0].list.length > 0) {
        setSelectedCard(data.card_list[0].list[0]);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch calculator data:', error);
      Alert.alert('Error', 'Failed to load calculator data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    if (!selectedCard || !calculatorData) return;

    const amount = customAmount ? parseFloat(customAmount) : parseFloat(selectedDenomination.replace('$', ''));
    if (isNaN(amount)) return;

    let baseRate = selectedCurrency === 'NGN' ? selectedCard.rate : selectedCard.usdt_rate;
    
    // Apply VIP bonus
    const vipBonus = calculatorData.vip_detail.rate ? parseFloat(calculatorData.vip_detail.rate) / 100 : 0;
    const finalRate = baseRate * (1 + vipBonus);
    
    setCalculatedAmount(amount * finalRate);
  };

  const refreshRates = () => {
    fetchCalculatorData();
  };

  const getTrendingIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color="#22C55E" />;
      case 'down':
        return <TrendingUp size={16} color="#EF4444" style={{ transform: [{ rotate: '180deg' }] }} />;
      default:
        return <View style={{ width: 16, height: 16, backgroundColor: '#6B7280', borderRadius: 8 }} />;
    }
  };

  const renderVIPInfo = () => {
    if (!calculatorData) return null;

    return (
      <Card style={[styles.vipCard, { backgroundColor: colors.primary }]}>
        <View style={styles.vipHeader}>
          <Crown size={24} color="#FFD700" />
          <Text style={styles.vipTitle}>VIP Benefits</Text>
        </View>
        
        <View style={styles.vipContent}>
          <View style={styles.vipCurrentLevel}>
            <Text style={styles.vipCurrentText}>Current Level: VIP {calculatorData.vip_detail.level}</Text>
            <Text style={styles.vipCurrentRate}>+{calculatorData.vip_detail.rate}% Bonus Rate</Text>
          </View>
          
          {calculatorData.vip_detail.next_level && (
            <View style={styles.vipNextLevel}>
              <Text style={styles.vipNextText}>Next Level: VIP {calculatorData.vip_detail.next_level}</Text>
              <Text style={styles.vipNextRate}>+{calculatorData.vip_detail.next_level_rate}% Bonus Rate</Text>
              <Text style={styles.vipUpgradePoints}>
                {calculatorData.vip_detail.upgrade_point} points to upgrade
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderBonusInfo = () => {
    if (!calculatorData) return null;

    return (
      <View style={styles.bonusSection}>
        {calculatorData.first_order_bonus > 0 && (
          <Card style={[styles.bonusCard, { backgroundColor: `${colors.success}15` }]}>
            <View style={styles.bonusHeader}>
              <Gift size={20} color={colors.success} />
              <Text style={[styles.bonusTitle, { color: colors.success }]}>First Order Bonus</Text>
            </View>
            <Text style={[styles.bonusAmount, { color: colors.text }]}>
              {user?.currency_symbol || '₦'}{calculatorData.first_order_bonus}
            </Text>
          </Card>
        )}
        
        {calculatorData.amount_order_bonus.bonus_amount > 0 && (
          <Card style={[styles.bonusCard, { backgroundColor: `${colors.warning}15` }]}>
            <View style={styles.bonusHeader}>
              <Star size={20} color={colors.warning} />
              <Text style={[styles.bonusTitle, { color: colors.warning }]}>Volume Bonus</Text>
            </View>
            <Text style={[styles.bonusAmount, { color: colors.text }]}>
              {user?.currency_symbol || '₦'}{calculatorData.amount_order_bonus.bonus_amount}
            </Text>
            <Text style={[styles.bonusRequirement, { color: colors.textSecondary }]}>
              On orders ≥ {user?.currency_symbol || '₦'}{calculatorData.amount_order_bonus.order_amount}
            </Text>
          </Card>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading calculator data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Rate Calculator</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Calculate your earnings instantly
            </Text>
          </View>
          <TouchableOpacity 
            onPress={refreshRates}
            style={[styles.refreshButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <RefreshCw size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calculator Card */}
        <Card style={[styles.calculatorCard, { backgroundColor: colors.primary }]}>
          <View style={styles.calculatorHeader}>
            <Calculator size={24} color="#FFFFFF" />
            <Text style={styles.calculatorTitle}>Quick Calculator</Text>
          </View>
          
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>You will receive:</Text>
            <Text style={styles.resultAmount}>
              {currencies.find(c => c.code === selectedCurrency)?.symbol}
              {calculatedAmount.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </Text>
            <Text style={styles.resultCurrency}>
              {currencies.find(c => c.code === selectedCurrency)?.name}
            </Text>
          </View>
        </Card>

        {/* VIP Information */}
        {renderVIPInfo()}

        {/* Bonus Information */}
        {renderBonusInfo()}

        {/* Card Selection */}
        {calculatorData && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Card Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {calculatorData.card_list.map((category) => (
                <View key={category.category_name}>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>
                    {category.category_name}
                  </Text>
                  {category.list.map((card) => (
                    <TouchableOpacity
                      key={card.card_id}
                      style={[
                        styles.cardOption,
                        {
                          backgroundColor: selectedCard?.card_id === card.card_id 
                            ? `${colors.primary}20` 
                            : colorScheme === 'dark' ? colors.card : '#F9FAFB',
                          borderColor: selectedCard?.card_id === card.card_id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedCard(card)}
                    >
                      {category.category_image && (
                        <Image 
                          source={{ uri: category.category_image }} 
                          style={styles.cardImage}
                          resizeMode="contain"
                        />
                      )}
                      <View style={styles.cardOptionHeader}>
                        <Text style={[
                          styles.cardOptionName,
                          { color: selectedCard?.card_id === card.card_id ? colors.primary : colors.text }
                        ]}>
                          {card.name}
                        </Text>
                        {getTrendingIcon('stable')}
                      </View>
                      <Text style={[
                        styles.cardOptionRate,
                        { color: selectedCard?.card_id === card.card_id ? colors.primary : colors.textSecondary }
                      ]}>
                        ₦{card.rate.toFixed(2)}/$1
                      </Text>
                      <Text style={[
                        styles.cardOptionUsdtRate,
                        { color: selectedCard?.card_id === card.card_id ? colors.primary : colors.textSecondary }
                      ]}>
                        USDT {card.usdt_rate.toFixed(4)}/$1
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Amount</Text>
          
          {/* Denomination Buttons */}
          <View style={styles.denominationGrid}>
            {denominations.map((denom) => (
              <TouchableOpacity
                key={denom}
                style={[
                  styles.denominationButton,
                  {
                    backgroundColor: selectedDenomination === denom && !customAmount
                      ? colors.primary
                      : colorScheme === 'dark' ? colors.card : '#F9FAFB',
                    borderColor: selectedDenomination === denom && !customAmount 
                      ? colors.primary 
                      : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedDenomination(denom);
                  setCustomAmount('');
                }}
              >
                <Text style={[
                  styles.denominationText,
                  { 
                    color: selectedDenomination === denom && !customAmount 
                      ? '#FFFFFF' 
                      : colors.text 
                  }
                ]}>
                  {denom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount Input */}
          <View style={styles.customAmountContainer}>
            <Text style={[styles.customAmountLabel, { color: colors.text }]}>
              Or enter custom amount:
            </Text>
            <TextInput
              style={[
                styles.customAmountInput,
                {
                  color: colors.text,
                  borderColor: customAmount ? colors.primary : colors.border,
                  backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                },
              ]}
              placeholder="Enter amount in USD"
              placeholderTextColor={colors.textSecondary}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                if (text) setSelectedDenomination('');
              }}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Receive In</Text>
          <View style={styles.currencyGrid}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyOption,
                  {
                    backgroundColor: selectedCurrency === currency.code
                      ? `${colors.primary}20`
                      : colorScheme === 'dark' ? colors.card : '#F9FAFB',
                    borderColor: selectedCurrency === currency.code ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCurrency(currency.code)}
              >
                <Text style={[
                  styles.currencySymbol,
                  { color: selectedCurrency === currency.code ? colors.primary : colors.text }
                ]}>
                  {currency.symbol}
                </Text>
                <Text style={[
                  styles.currencyName,
                  { color: selectedCurrency === currency.code ? colors.primary : colors.text }
                ]}>
                  {currency.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rate Information */}
        {selectedCard && (
          <Card style={styles.rateInfoCard}>
            <View style={styles.rateInfoHeader}>
              <Text style={[styles.rateInfoTitle, { color: colors.text }]}>
                Current Rate Information
              </Text>
              <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
                Updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.rateDetails}>
              <View style={styles.rateDetailRow}>
                <Text style={[styles.rateDetailLabel, { color: colors.textSecondary }]}>
                  Base Rate:
                </Text>
                <Text style={[styles.rateDetailValue, { color: colors.text }]}>
                  {selectedCurrency === 'NGN' 
                    ? `₦${selectedCard.rate.toFixed(2)}/$1`
                    : `USDT ${selectedCard.usdt_rate.toFixed(4)}/$1`
                  }
                </Text>
              </View>
              
              {calculatorData && (
                <View style={styles.rateDetailRow}>
                  <Text style={[styles.rateDetailLabel, { color: colors.textSecondary }]}>
                    VIP Bonus:
                  </Text>
                  <Text style={[styles.rateDetailValue, { color: colors.success }]}>
                    +{calculatorData.vip_detail.rate}%
                  </Text>
                </View>
              )}
              
              <View style={styles.rateDetailRow}>
                <Text style={[styles.rateDetailLabel, { color: colors.textSecondary }]}>
                  Processing Time:
                </Text>
                <Text style={[styles.rateDetailValue, { color: colors.success }]}>
                  5-15 minutes
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Start Trading"
            onPress={() => router.push('/(tabs)/sell')}
            style={styles.tradeButton}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            fullWidth
          />
          
          <Button
            title="View All Rates"
            variant="outline"
            onPress={() => router.push('/rates')}
            style={styles.ratesButton}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Calculator Card
  calculatorCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calculatorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Spacing.sm,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  resultAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  resultCurrency: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // VIP Card
  vipCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  vipTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: Spacing.sm,
  },
  vipContent: {
    gap: Spacing.md,
  },
  vipCurrentLevel: {
    alignItems: 'center',
  },
  vipCurrentText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  vipCurrentRate: {
    color: '#FFD700',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  vipNextLevel: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  vipNextText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  vipNextRate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  vipUpgradePoints: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },

  // Bonus Section
  bonusSection: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  bonusCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  bonusTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  bonusAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  bonusRequirement: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },

  // Category and Card Options
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
  },
  cardOption: {
    width: 160,
    padding: Spacing.md,
    borderRadius: 12,
    marginRight: Spacing.md,
    borderWidth: 2,
  },
  cardImage: {
    width: '100%',
    height: 40,
    marginBottom: Spacing.sm,
  },
  cardOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardOptionName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  cardOptionRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  cardOptionUsdtRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // Denominations
  denominationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  denominationButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  denominationText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  // Custom Amount
  customAmountContainer: {
    marginTop: Spacing.md,
  },
  customAmountLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.sm,
  },
  customAmountInput: {
    height: 48,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },

  // Currency Options
  currencyGrid: {
    gap: Spacing.sm,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginRight: Spacing.md,
    minWidth: 40,
  },
  currencyName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },

  // Rate Info Card
  rateInfoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  rateInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rateInfoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  rateDetails: {
    gap: Spacing.sm,
  },
  rateDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateDetailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  rateDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  // Action Buttons
  actionButtons: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  tradeButton: {
    height: 56,
  },
  ratesButton: {
    height: 48,
  },
});