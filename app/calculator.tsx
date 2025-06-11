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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, RefreshCw, ArrowRight } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import QuickCalculator from '@/components/calculator/QuickCalculator';
import CardSelector from '@/components/calculator/CardSelector';
import VIPBenefits from '@/components/calculator/VIPBenefits';
import BonusInfo from '@/components/calculator/BonusInfo';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { CalculatorService } from '@/services/calculator';
import type { CalculatorData, CardItem } from '@/types/api';

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

        {/* Quick Calculator - Fixed at top */}
        <QuickCalculator
          calculatedAmount={calculatedAmount}
          selectedCurrency={selectedCurrency}
          currencies={currencies}
        />

        <View style={styles.content}>
          {/* Card Selection */}
          {calculatorData && (
            <CardSelector
              categories={calculatorData.card_list}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
            />
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

          {/* VIP Benefits */}
          {calculatorData && (
            <VIPBenefits
              vipDetail={calculatorData.vip_detail}
              vipLevels={calculatorData.vip}
            />
          )}

          {/* Bonus Information */}
          {calculatorData && (
            <BonusInfo
              firstOrderBonus={calculatorData.first_order_bonus}
              amountOrderBonus={calculatorData.amount_order_bonus}
              currencySymbol={user?.currency_symbol || '₦'}
            />
          )}

          {/* Rate Information */}
          {selectedCard && (
            <Card style={styles.rateInfoCard}>
              <View style={styles.rateInfoHeader}>
                <Text style={[styles.rateInfoTitle, { color: colors.text }]}>
                  Rate Details
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
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
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
    gap: Spacing.md,
  },
  tradeButton: {
    height: 56,
  },
  ratesButton: {
    height: 48,
  },
});