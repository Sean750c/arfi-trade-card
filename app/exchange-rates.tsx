import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, TrendingUp, DollarSign, RefreshCw, ChartBar as BarChart3, Zap } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import CurrencyCard from '@/components/exchange/CurrencyCard';
import { useExchangeRatesStore } from '@/stores/useExchangeRatesStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ExchangeRatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { selectedCountry } = useCountryStore();
  const { user } = useAuthStore();
  
  const {
    exchangeData,
    isLoading,
    error,
    lastUpdateTime,
    fetchExchangeRates,
  } = useExchangeRatesStore();

  const [refreshing, setRefreshing] = useState(false);

  // Get country ID from user or selected country
  const countryId = user?.country_id || selectedCountry?.id || 1;

  // Initialize data on component mount
  useEffect(() => {
    fetchExchangeRates(countryId);
  }, [countryId, fetchExchangeRates]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchExchangeRates(countryId, true);
    } finally {
      setRefreshing(false);
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdateTime) / 1000);
    
    if (diff < 60) return 'Just updated';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(lastUpdateTime).toLocaleDateString();
  };

  if (error && !exchangeData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <BarChart3 size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.error }]}>
            Failed to Load Exchange Rates
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchExchangeRates(countryId, true)}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Exchange Rates</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {exchangeData ? `${exchangeData.metrics.length} financial metrics` : 'Loading...'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.calculatorButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/calculator')}
        >
          <Zap size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Last Update Info */}
      {lastUpdateTime && (
        <View style={[styles.updateInfo, { backgroundColor: `${colors.primary}10` }]}>
          <TrendingUp size={16} color={colors.primary} />
          <Text style={[styles.updateText, { color: colors.primary }]}>
            Last updated: {formatLastUpdate()}
          </Text>
          <TouchableOpacity
            onPress={() => fetchExchangeRates(countryId, true)}
            disabled={isLoading}
            style={styles.refreshButton}
          >
            <RefreshCw 
              size={16} 
              color={colors.primary} 
              style={[isLoading && styles.spinning]}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Exchange Rate Cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading && !exchangeData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading exchange rates...
            </Text>
          </View>
        ) : exchangeData ? (
          <View style={styles.cardsContainer}>
            {exchangeData.metrics.map((metric, index) => (
              <CurrencyCard
                key={metric.id}
                metric={metric}
                availableCurrencies={exchangeData.currencies}
                style={index === exchangeData.metrics.length - 1 ? styles.lastCard : undefined}
              />
            ))}
          </View>
        ) : null}

        {/* Market Summary */}
        {exchangeData && (
          <View style={[styles.marketSummary, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Market Summary
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {exchangeData.currencies.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Currencies
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {exchangeData.metrics.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Metrics
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>
                  Live
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Updates
                </Text>
              </View>
            </View>
          </View>
        )}
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
  calculatorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  updateText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  refreshButton: {
    padding: Spacing.xs,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  cardsContainer: {
    gap: Spacing.lg,
  },
  lastCard: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  marketSummary: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
});