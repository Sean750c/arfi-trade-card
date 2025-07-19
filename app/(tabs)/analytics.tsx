import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TrendingUp, BarChart3, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { CalculatorService } from '@/services/calculator';
import type { CalculatorData, CardItem } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import Spacing from '@/constants/Spacing';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const periods = [
    { id: '24h', label: '24H' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [user, selectedCountry]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const countryId = user?.country_id || selectedCountry?.id || 1;
      const params = {
        country_id: countryId,
        ...(isAuthenticated && user?.token && { token: user.token }),
      };

      const data = await CalculatorService.getCalculatorData(params);
      setCalculatorData(data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopCards = () => {
    if (!calculatorData?.card_list) return [];
    
    const allCards: CardItem[] = [];
    calculatorData.card_list.forEach(category => {
      allCards.push(...category.list);
    });
    
    return allCards
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  };

  const mockTradingStats = {
    totalVolume: 125840,
    totalTrades: 1247,
    successRate: 98.5,
    avgProfit: 15.2,
    topPerformer: 'Steam Gift Card',
    weeklyGrowth: 12.3,
  };

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading analytics...
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
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Market Analytics</Text>
              <Text style={styles.headerSubtitle}>Real-time trading insights</Text>
            </View>
            <View style={styles.headerIcon}>
              <BarChart3 size={24} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.periodButtons}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: selectedPeriod === period.id ? colors.primary : colors.card,
                      borderColor: selectedPeriod === period.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      {
                        color: selectedPeriod === period.id ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <LinearGradient
            colors={[colors.success, '#0891B2']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <TrendingUp size={24} color="#FFFFFF" />
              <Text style={styles.metricValue}>
                ${mockTradingStats.totalVolume.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Total Volume</Text>
              <View style={styles.metricChange}>
                <ArrowUpRight size={16} color="#FFFFFF" />
                <Text style={styles.metricChangeText}>+{mockTradingStats.weeklyGrowth}%</Text>
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={[colors.warning, '#EA580C']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <BarChart3 size={24} color="#FFFFFF" />
              <Text style={styles.metricValue}>
                {mockTradingStats.totalTrades.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Total Trades</Text>
              <View style={styles.metricChange}>
                <ArrowUpRight size={16} color="#FFFFFF" />
                <Text style={styles.metricChangeText}>+8.2%</Text>
              </View>
            </View>
          </LinearGradient>

          <Card style={[styles.metricCardFlat, { backgroundColor: colors.card }]}>
            <View style={styles.metricContent}>
              <PieChart size={24} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {mockTradingStats.successRate}%
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Success Rate</Text>
              <View style={styles.metricChange}>
                <ArrowUpRight size={16} color={colors.success} />
                <Text style={[styles.metricChangeText, { color: colors.success }]}>+2.1%</Text>
              </View>
            </View>
          </Card>

          <Card style={[styles.metricCardFlat, { backgroundColor: colors.card }]}>
            <View style={styles.metricContent}>
              <Calendar size={24} color={colors.accent} />
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {mockTradingStats.avgProfit}%
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Avg. Profit</Text>
              <View style={styles.metricChange}>
                <ArrowUpRight size={16} color={colors.success} />
                <Text style={[styles.metricChangeText, { color: colors.success }]}>+1.8%</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Top Performing Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Top Performing Cards
          </Text>
          <Card style={[styles.topCardsCard, { backgroundColor: colors.card }]}>
            {getTopCards().map((card, index) => (
              <View key={card.card_id} style={styles.topCardItem}>
                <View style={styles.topCardRank}>
                  <Text style={[styles.topCardRankText, { color: colors.primary }]}>
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.topCardInfo}>
                  <Text style={[styles.topCardName, { color: colors.text }]}>
                    {card.name}
                  </Text>
                  <Text style={[styles.topCardCategory, { color: colors.textSecondary }]}>
                    Category {card.category_id}
                  </Text>
                </View>
                <View style={styles.topCardRate}>
                  <Text style={[styles.topCardRateValue, { color: colors.success }]}>
                    {user?.currency_symbol}{card.rate.toFixed(2)}
                  </Text>
                  <Text style={[styles.topCardRateLabel, { color: colors.textSecondary }]}>
                    Rate
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Market Trends */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Market Trends
          </Text>
          <Card style={[styles.trendsCard, { backgroundColor: colors.card }]}>
            <View style={styles.trendItem}>
              <View style={styles.trendIcon}>
                <TrendingUp size={20} color={colors.success} />
              </View>
              <View style={styles.trendContent}>
                <Text style={[styles.trendTitle, { color: colors.text }]}>
                  Gift Card Demand
                </Text>
                <Text style={[styles.trendDescription, { color: colors.textSecondary }]}>
                  High demand for gaming cards this week
                </Text>
              </View>
              <View style={styles.trendValue}>
                <Text style={[styles.trendPercentage, { color: colors.success }]}>
                  +15.2%
                </Text>
              </View>
            </View>

            <View style={styles.trendItem}>
              <View style={styles.trendIcon}>
                <BarChart3 size={20} color={colors.warning} />
              </View>
              <View style={styles.trendContent}>
                <Text style={[styles.trendTitle, { color: colors.text }]}>
                  Trading Volume
                </Text>
                <Text style={[styles.trendDescription, { color: colors.textSecondary }]}>
                  Steady growth in daily transactions
                </Text>
              </View>
              <View style={styles.trendValue}>
                <Text style={[styles.trendPercentage, { color: colors.warning }]}>
                  +8.7%
                </Text>
              </View>
            </View>

            <View style={styles.trendItem}>
              <View style={styles.trendIcon}>
                <PieChart size={20} color={colors.primary} />
              </View>
              <View style={styles.trendContent}>
                <Text style={[styles.trendTitle, { color: colors.text }]}>
                  Market Share
                </Text>
                <Text style={[styles.trendDescription, { color: colors.textSecondary }]}>
                  Platform gaining market presence
                </Text>
              </View>
              <View style={styles.trendValue}>
                <Text style={[styles.trendPercentage, { color: colors.primary }]}>
                  +12.3%
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/calculator' as any)}
          >
            <Text style={styles.actionButtonText}>Trading Calculator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/rates')}
          >
            <Text style={styles.actionButtonText}>View All Rates</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
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
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerIcon: {
    marginLeft: Spacing.md,
  },
  periodSelector: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  periodButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  metricCardFlat: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  metricContent: {
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.sm,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  topCardsCard: {
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  topCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topCardRank: {
    width: 32,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  topCardRankText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  topCardInfo: {
    flex: 1,
  },
  topCardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  topCardCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  topCardRate: {
    alignItems: 'flex-end',
  },
  topCardRateValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  topCardRateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  trendsCard: {
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  trendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  trendContent: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  trendDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  trendValue: {
    alignItems: 'flex-end',
  },
  trendPercentage: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});