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
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Calculator, RefreshCw, TrendingUp, ArrowRight } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

// Sample exchange rates data
const exchangeRates = {
  'Amazon': { rate: 620, trending: 'up' },
  'iTunes': { rate: 600, trending: 'down' },
  'Steam': { rate: 625, trending: 'up' },
  'Google Play': { rate: 590, trending: 'stable' },
  'Visa': { rate: 615, trending: 'up' },
  'Mastercard': { rate: 610, trending: 'stable' },
  'Walmart': { rate: 580, trending: 'down' },
  'Target': { rate: 575, trending: 'stable' },
};

const denominations = ['$25', '$50', '$100', '$200', '$500'];
const currencies = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'USDT', symbol: 'USDT', name: 'Tether' },
];

export default function CalculatorScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [selectedCard, setSelectedCard] = useState('Amazon');
  const [selectedDenomination, setSelectedDenomination] = useState('$100');
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [customAmount, setCustomAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    calculateAmount();
  }, [selectedCard, selectedDenomination, customAmount, selectedCurrency]);

  const calculateAmount = () => {
    const amount = customAmount ? parseFloat(customAmount) : parseFloat(selectedDenomination.replace('$', ''));
    const rate = exchangeRates[selectedCard as keyof typeof exchangeRates]?.rate || 620;
    
    if (selectedCurrency === 'NGN') {
      setCalculatedAmount(amount * rate);
    } else if (selectedCurrency === 'USDT') {
      setCalculatedAmount(amount * 0.98); // Assuming 2% fee for USDT
    } else {
      setCalculatedAmount(amount);
    }
  };

  const refreshRates = () => {
    setLastUpdated(new Date());
    Alert.alert('Rates Updated', 'Exchange rates have been refreshed with the latest market data.');
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

        {/* Card Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Card Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(exchangeRates).map(([cardName, data]) => (
              <TouchableOpacity
                key={cardName}
                style={[
                  styles.cardOption,
                  {
                    backgroundColor: selectedCard === cardName 
                      ? `${colors.primary}20` 
                      : colorScheme === 'dark' ? colors.card : '#F9FAFB',
                    borderColor: selectedCard === cardName ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCard(cardName)}
              >
                <View style={styles.cardOptionHeader}>
                  <Text style={[
                    styles.cardOptionName,
                    { color: selectedCard === cardName ? colors.primary : colors.text }
                  ]}>
                    {cardName}
                  </Text>
                  {getTrendingIcon(data.trending)}
                </View>
                <Text style={[
                  styles.cardOptionRate,
                  { color: selectedCard === cardName ? colors.primary : colors.textSecondary }
                ]}>
                  ₦{data.rate}/$1
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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
                ₦{exchangeRates[selectedCard as keyof typeof exchangeRates]?.rate || 620}/$1
              </Text>
            </View>
            
            <View style={styles.rateDetailRow}>
              <Text style={[styles.rateDetailLabel, { color: colors.textSecondary }]}>
                Platform Fee:
              </Text>
              <Text style={[styles.rateDetailValue, { color: colors.text }]}>
                2.5%
              </Text>
            </View>
            
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

  // Card Options
  cardOption: {
    width: 120,
    padding: Spacing.md,
    borderRadius: 12,
    marginRight: Spacing.md,
    borderWidth: 2,
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
  },
  cardOptionRate: {
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