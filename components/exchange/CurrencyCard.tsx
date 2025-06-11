import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus, DollarSign, ChartBar as BarChart3, Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { ExchangeMetric, Currency } from '@/types/exchange';

interface CurrencyCardProps {
  metric: ExchangeMetric;
  availableCurrencies: Currency[];
  style?: any;
}

export default function CurrencyCard({ 
  metric, 
  availableCurrencies,
  style 
}: CurrencyCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // State for selected currencies for this specific card
  const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(
    new Set(['USD']) // Default to USD
  );

  // Ensure USD is always selected on mount
  useEffect(() => {
    if (!selectedCurrencies.has('USD')) {
      setSelectedCurrencies(new Set(['USD']));
    }
  }, []);

  const toggleCurrency = (currencyCode: string) => {
    setSelectedCurrencies(prev => {
      const newSet = new Set(prev);
      
      // Prevent deselecting the last currency
      if (newSet.has(currencyCode) && newSet.size === 1) {
        return prev;
      }
      
      if (newSet.has(currencyCode)) {
        newSet.delete(currencyCode);
      } else {
        newSet.add(currencyCode);
      }
      
      return newSet;
    });
  };

  const getDisplayData = () => {
    // Get data for selected currencies only
    return metric.rates.filter(rate => 
      selectedCurrencies.has(rate.currency_code)
    );
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} color={colors.success} />;
    if (change < 0) return <TrendingDown size={16} color={colors.error} />;
    return <Minus size={16} color={colors.textSecondary} />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return colors.success;
    if (change < 0) return colors.error;
    return colors.textSecondary;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const displayData = getDisplayData();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.metricInfo}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <BarChart3 size={20} color={colors.primary} />
          </View>
          <View style={styles.metricDetails}>
            <Text style={[styles.metricName, { color: colors.text }]}>
              {metric.name}
            </Text>
            <Text style={[styles.metricDescription, { color: colors.textSecondary }]}>
              {metric.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.updateIndicator}>
          <Clock size={12} color={colors.textSecondary} />
          <Text style={[styles.updateTime, { color: colors.textSecondary }]}>
            Live
          </Text>
        </View>
      </View>

      {/* Currency Type Labels */}
      <View style={styles.currencyLabels}>
        <Text style={[styles.labelsTitle, { color: colors.text }]}>
          Available Currencies:
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.labelsContainer}
        >
          {availableCurrencies.map((currency) => {
            const isSelected = selectedCurrencies.has(currency.code);
            const isLastSelected = selectedCurrencies.size === 1 && isSelected;
            
            return (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyLabel,
                  {
                    backgroundColor: isSelected ? colors.primary : `${colors.primary}10`,
                    borderColor: isSelected ? colors.primary : 'transparent',
                    opacity: isLastSelected ? 0.7 : 1, // Visual hint for last selected
                  }
                ]}
                onPress={() => toggleCurrency(currency.code)}
                disabled={isLastSelected}
              >
                <Text style={[
                  styles.currencyLabelText,
                  { color: isSelected ? '#FFFFFF' : colors.primary }
                ]}>
                  {currency.symbol} {currency.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Exchange Rate Data */}
      <View style={styles.ratesContainer}>
        {displayData.map((rate, index) => (
          <View 
            key={rate.currency_code}
            style={[
              styles.rateItem,
              { borderBottomColor: colors.border },
              index === displayData.length - 1 && styles.lastRateItem,
            ]}
          >
            <View style={styles.rateHeader}>
              <View style={styles.currencyInfo}>
                <DollarSign size={16} color={colors.primary} />
                <Text style={[styles.currencyCode, { color: colors.text }]}>
                  {rate.currency_code}
                </Text>
                <Text style={[styles.currencyName, { color: colors.textSecondary }]}>
                  {rate.currency_name}
                </Text>
              </View>
              
              <View style={styles.changeIndicator}>
                {getTrendIcon(rate.change_24h)}
                <Text style={[
                  styles.changeText,
                  { color: getTrendColor(rate.change_24h) }
                ]}>
                  {formatChange(rate.change_24h)}
                </Text>
              </View>
            </View>
            
            <View style={styles.rateDetails}>
              <View style={styles.rateValue}>
                <Text style={[styles.currentRate, { color: colors.text }]}>
                  {rate.symbol}{rate.current_rate.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </Text>
                <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>
                  Current Rate
                </Text>
              </View>
              
              <View style={styles.rateMetrics}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.success }]}>
                    {rate.symbol}{rate.high_24h.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    24h High
                  </Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.error }]}>
                    {rate.symbol}{rate.low_24h.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    24h Low
                  </Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.primary }]}>
                    {rate.symbol}{rate.volume_24h.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    24h Volume
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Card Footer */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {selectedCurrencies.size} of {availableCurrencies.length} currencies displayed
        </Text>
        <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
          Tap currencies to toggle display
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  metricInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  metricDetails: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  metricDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updateTime: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  
  // Currency Labels
  currencyLabels: {
    marginBottom: Spacing.lg,
  },
  labelsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  labelsContainer: {
    gap: Spacing.sm,
  },
  currencyLabel: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  currencyLabelText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Rates Container
  ratesContainer: {
    marginBottom: Spacing.md,
  },
  rateItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  lastRateItem: {
    borderBottomWidth: 0,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currencyCode: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  currencyName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Rate Details
  rateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rateValue: {
    flex: 1,
  },
  currentRate: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  rateLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  rateMetrics: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metricItem: {
    alignItems: 'flex-end',
  },
  metricValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
  },
  
  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  footerNote: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
});