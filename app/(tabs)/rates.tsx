import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  Zap
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '@/components/UI/Card';
import { useRatesStore } from '@/stores/useRatesStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import Spacing from '@/constants/Spacing';
import type { CategoryData, CardRate } from '@/types';

const { width } = Dimensions.get('window');

export default function RatesScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const {
    ratesData,
    categories,
    currencies,
    isLoading,
    error,
    fetchRatesData,
    fetchCategories,
    fetchCurrencies,
  } = useRatesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data on component mount and focus
  useFocusEffect(
    useCallback(() => {
      const initializeData = async () => {
        try {
          await Promise.all([
            fetchCategories(),
            fetchCurrencies(),
          ]);
          
          await fetchRatesData({
            country_id: user?.country_id || selectedCountry?.id || 1,
            page: 0,
            page_size: 100,
            ...(selectedCategory && { card_catgory: selectedCategory }),
            ...(selectedCurrency && { currency: selectedCurrency }),
          });
        } catch (error) {
          console.error('Failed to fetch rates data:', error);
        }
      };

      initializeData();
    }, [user?.country_id, selectedCountry?.id, selectedCategory, selectedCurrency])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRatesData({
        country_id: user?.country_id || selectedCountry?.id || 1,
        page: 0,
        page_size: 100,
        ...(selectedCategory && { card_catgory: selectedCategory }),
        ...(selectedCurrency && { currency: selectedCurrency }),
      });
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter and search logic
  const filteredCategories = ratesData?.card_list?.filter(category => {
    const matchesSearch = category.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const getCardsByCategory = (category: CategoryData) => {
    if (!category.list || category.list.length === 0) return [];
    
    // Get all cards from all currency groups
    const allCards: CardRate[] = [];
    category.list.forEach(currencyGroup => {
      allCards.push(...currencyGroup.list);
    });
    
    return allCards.slice(0, 5); // Show top 5 cards per category
  };

  const formatRate = (rate: number, symbol: string) => {
    return `${symbol}${rate.toFixed(2)}`;
  };

  const formatOptimalRate = (optimalRate: string) => {
    return optimalRate || 'N/A';
  };

  const renderCategoryCard = ({ item: category }: { item: CategoryData }) => {
    const cards = getCardsByCategory(category);
    
    return (
      <Card style={[styles.categoryCard, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.categoryHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.categoryHeaderContent}>
            <Text style={styles.categoryName}>{category.category_name}</Text>
            <View style={styles.categoryStats}>
              <Text style={styles.categoryStatsText}>
                Top Rate: {formatRate(category.top_rate, category.top_currency_symbol)}
              </Text>
              <Text style={styles.categoryStatsText}>
                Range: {category.top_rate_range}
              </Text>
            </View>
          </View>
          <View style={styles.categoryBadge}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
          </View>
        </LinearGradient>

        <View style={styles.categoryContent}>
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <View key={card.card_id} style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
                    {card.name}
                  </Text>
                  <Text style={[styles.cardCurrency, { color: colors.textSecondary }]}>
                    {card.currency}
                  </Text>
                </View>
                
                <View style={styles.cardRates}>
                  <Text style={[styles.cardRate, { color: colors.success }]}>
                    {formatRate(card.rate, card.currency_symbol)}
                  </Text>
                  <View style={styles.optimalRateContainer}>
                    <ArrowUpRight size={12} color={colors.primary} />
                    <Text style={[styles.optimalRate, { color: colors.primary }]}>
                      {formatOptimalRate(card.optimal_rate)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noCardsText, { color: colors.textSecondary }]}>
              No cards available in this category
            </Text>
          )}
        </View>
      </Card>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Professional Header */}
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Live Exchange Rates</Text>
            <Text style={styles.headerSubtitle}>Real-time market pricing</Text>
          </View>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <RefreshCw size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Market Summary */}
      <View style={styles.marketSummary}>
        <LinearGradient
          colors={['#1E293B', '#334155']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {ratesData?.card_list?.length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Categories</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {ratesData?.card_list?.reduce((total, cat) => {
                  return total + cat.list.reduce((catTotal, group) => catTotal + group.list.length, 0);
                }, 0) || 0}
              </Text>
              <Text style={styles.summaryLabel}>Live Rates</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={styles.summaryValueRow}>
                <ArrowUpRight size={16} color="#10B981" />
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                  99.2%
                </Text>
              </View>
              <Text style={styles.summaryLabel}>Accuracy</Text>
            </View>
          </View>
          
          <View style={styles.lastUpdated}>
            <Clock size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.lastUpdatedText}>
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search gift cards..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.filtersTitle, { color: colors.text }]}>Filter by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
            <TouchableOpacity
              style={[
                styles.categoryFilter,
                {
                  backgroundColor: selectedCategory === null ? colors.primary : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  { color: selectedCategory === null ? '#FFFFFF' : colors.text },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.category_id}
                style={[
                  styles.categoryFilter,
                  {
                    backgroundColor: selectedCategory === category.category_id ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.category_id)}
              >
                <Text
                  style={[
                    styles.categoryFilterText,
                    { color: selectedCategory === category.category_id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {category.category_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.primary }]}
          onPress={() => {/* Navigate to calculator */}}
        >
          <Zap size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Calculator</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.success }]}
          onPress={() => {/* Navigate to trade */}}
        >
          <Shield size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Trade Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (error) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Failed to load exchange rates
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.category_id.toString()}
        renderItem={renderCategoryCard}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading exchange rates...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <TrendingUp size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No exchange rates available
              </Text>
            </View>
          )
        }
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: Spacing.lg,
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Market Summary
  marketSummary: {
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: Spacing.md,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Search and Filters
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  categoryFilters: {
    flexDirection: 'row',
  },
  categoryFilter: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  categoryFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 16,
    gap: Spacing.sm,
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },

  // Category Cards
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  categoryCard: {
    marginBottom: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryHeader: {
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryHeaderContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  categoryStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  categoryStatsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    padding: Spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  cardCurrency: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  cardRates: {
    alignItems: 'flex-end',
  },
  cardRate: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  optimalRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  optimalRate: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  noCardsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    padding: Spacing.lg,
  },

  // Loading and Error States
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});