import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, RefreshCw, ArrowRight } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import TwoLevelCardSelector from '@/components/calculator/TwoLevelCardSelector';
import CompactAmountSelector from '@/components/calculator/CompactAmountSelector';
import CompactCurrencySelector from '@/components/calculator/CompactCurrencySelector';
import VIPBenefits from '@/components/calculator/VIPBenefits';
import BonusInfo from '@/components/calculator/BonusInfo';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAppStore } from '@/stores/useAppStore';
import { CalculatorService } from '@/services/calculator';
import type { CalculatorData, CardItem } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

export default function CalculatorScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const { initData } = useAppStore();
  
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency_name || 'NGN');
  const [customAmount, setCustomAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [amountVisible, setAmountVisible] = useState(true);

  const denominations = ['25', '50', '100', '200', '500'];
  const currencies = [
    { code: user?.currency_name || 'NGN', symbol: user?.currency_symbol || '₦', name: user?.currency_name || 'Nigerian Naira' },
    { code: 'USDT', symbol: 'USDT', name: 'Tether' },
  ];

  // 判断是否隐藏钱包类型tab
  const hideWalletTabs = initData?.hidden_flag === '1';

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

    const amount = customAmount ? parseFloat(customAmount) : parseFloat(selectedDenomination);
    if (isNaN(amount)) return;

    let baseRate = selectedCurrency === user?.currency_name ? selectedCard.rate : selectedCard.usdt_rate;
    
    // Apply VIP bonus
    const vipBonus = calculatorData.vip_detail.rate ? parseFloat(calculatorData.vip_detail.rate) / 100 : 0;
    const finalRate = baseRate * (1 + vipBonus);
    
    setCalculatedAmount(amount * finalRate);
  };

  const refreshRates = () => {
    fetchCalculatorData();
  };

  const formatCalculatedAmount = () => {
    if (!amountVisible) return '****';
    return `${user?.currency_symbol}${calculatedAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading calculator data...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

        {/* Calculation Result Card */}
        <Card style={[styles.resultCard, { backgroundColor: colors.primary }]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>You will receive</Text>
            <TouchableOpacity 
              onPress={() => setAmountVisible(!amountVisible)}
              style={styles.visibilityButton}
            >
              <Text style={styles.visibilityText}>
                {amountVisible ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.resultAmount}>
            {formatCalculatedAmount()}
          </Text>
          <Text style={styles.resultCurrency}>
            {user?.country_name || '₦'} {user?.currency_name || '₦'}
          </Text>
        </Card>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Card Selection - Two Level */}
          {calculatorData && (
            <TwoLevelCardSelector
              currencySymbol={user?.currency_symbol || '₦'}
              categories={calculatorData.card_list}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
            />
          )}

          {/* Compact Amount Selection */}
          <CompactAmountSelector
            denominations={denominations}
            selectedDenomination={selectedDenomination}
            customAmount={customAmount}
            onSelectDenomination={setSelectedDenomination}
            onCustomAmountChange={setCustomAmount}
          />

          {/* Compact Currency Selection */}
          {!hideWalletTabs && (
            <CompactCurrencySelector
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onSelectCurrency={setSelectedCurrency}
            />
          )}

          {/* VIP Benefits - Collapsible */}
          {calculatorData && (
            <VIPBenefits
              vipDetail={calculatorData.vip_detail}
              vipLevels={calculatorData.vip}
            />
          )}

          {/* Bonus Information - Collapsible */}
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
                  {lastUpdated.toLocaleTimeString()}
                </Text>
              </View>
              
              <View style={styles.rateDetails}>
                <View style={styles.rateDetailRow}>
                  <Text style={[styles.rateDetailLabel, { color: colors.textSecondary }]}>
                    Base Rate:
                  </Text>
                  <Text style={[styles.rateDetailValue, { color: colors.text }]}>
                    {selectedCurrency === user?.currency_name 
                      ? `${user?.currency_symbol}${selectedCard.rate.toFixed(2)}`
                      : `USDT ${selectedCard.usdt_rate.toFixed(4)}`
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
                    Processing:
                  </Text>
                  <Text style={[styles.rateDetailValue, { color: colors.success }]}>
                    5-15 min
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
    </SafeAreaWrapper>
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
  scrollContent: {
    paddingBottom: Spacing.xl,
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

  // Result Card
  resultCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.sm,
  },
  resultLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  visibilityButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  visibilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  resultAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  resultCurrency: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  content: {
    paddingHorizontal: Spacing.lg,
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