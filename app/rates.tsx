import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Search, 
  Filter, 
  Star, 
  ChevronLeft, 
  ChevronDown, 
  TrendingUp,
  Clock,
  Zap,
  Crown,
  X,
  Gift,
  DollarSign,
  Percent
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useRatesStore } from '@/stores/useRatesStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CategoryData, CardRate, CurrencyGroup, RateDetail } from '@/types/api';

export default function RatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { selectedCountry } = useCountryStore();
  const { user } = useAuthStore();
  
  const {
    categories,
    currencies,
    ratesData,
    isLoading,
    isLoadingMore,
    error,
    selectedCategory,
    selectedCurrency,
    searchQuery,
    hasMore,
    fetchCategories,
    fetchCurrencies,
    fetchRatesData,
    loadMoreRates,
    setSelectedCategory,
    setSelectedCurrency,
    setSearchQuery,
    clearFilters,
  } = useRatesStore();

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get country ID from user or selected country
  const countryId = user?.country_id || selectedCountry?.id || 1;

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing rates page data...');
      try {
        await Promise.all([
          fetchCategories(),
          fetchCurrencies(),
          fetchRatesData(countryId, true),
        ]);
      } catch (error) {
        console.error('Failed to initialize rates data:', error);
      }
    };

    initializeData();
  }, [fetchCategories, fetchCurrencies, fetchRatesData, countryId]);

  // Refresh data when filters change
  useEffect(() => {
    if (categories.length > 0) {
      console.log('Filters changed, refreshing data...');
      fetchRatesData(countryId, true);
    }
  }, [selectedCategory, selectedCurrency, countryId, fetchRatesData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRatesData(countryId, true);
    } finally {
      setRefreshing(false);
    }
  }, [countryId, fetchRatesData]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadMoreRates(countryId);
    }
  }, [isLoadingMore, hasMore, loadMoreRates, countryId]);

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setShowFilters(false);
  };

  const handleCurrencyFilter = (currency: string | null) => {
    setSelectedCurrency(currency);
    setShowFilters(false);
  };

  const getFilteredData = () => {
    if (!ratesData) return [];
    
    let filteredData = ratesData.card_list;
    
    // Apply search filter
    if (searchQuery.trim()) {
      filteredData = filteredData.filter(category =>
        category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.list.some(currencyGroup =>
          currencyGroup.list.some(card =>
            card.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      );
    }
    
    return filteredData;
  };

  // Calculate VIP and coupon bonuses for display
  const calculateBonuses = (rateDetails: RateDetail[]) => {
    const vipBonus = rateDetails.find(detail => detail.type === 'vip');
    const couponBonus = rateDetails.find(detail => detail.type === 'coupon');
    
    return {
      vipBonus: vipBonus ? parseFloat(vipBonus.per || '0') : 0,
      couponBonus: couponBonus ? parseFloat(couponBonus.per || '0') : 0,
      vipAmount: vipBonus ? vipBonus.rate : 0,
      couponAmount: couponBonus ? couponBonus.rate : 0,
    };
  };

  const renderCategoryCard = ({ item }: { item: CategoryData }) => (
    <Card style={styles.categoryCard}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <Image 
            source={{ uri: item.category_logo_img }} 
            style={styles.categoryImage}
            resizeMode="contain"
          />
          <View style={styles.categoryDetails}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {item.category_name}
            </Text>
            <Text style={[styles.categoryIntro, { color: colors.textSecondary }]}>
              {item.category_introduction}
            </Text>
            {item.timeout_seconds !== '0min' && (
              <View style={styles.timeoutBadge}>
                <Clock size={12} color={colors.warning} />
                <Text style={[styles.timeoutText, { color: colors.warning }]}>
                  {item.timeout_seconds}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Top Rate Display */}
        <View style={styles.topRateContainer}>
          <View style={[styles.topRateBadge, { backgroundColor: colors.primary }]}>
            <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.topRateLabel}>Best Rate</Text>
          </View>
          <Text style={[styles.topRate, { color: colors.primary }]}>
            {item.top_currency_symbol}{item.top_optimal_rate}
          </Text>
          <Text style={[styles.topCurrency, { color: colors.textSecondary }]}>
            per {item.top_currency}
          </Text>
        </View>
      </View>

      {/* Currency Groups */}
      <View style={styles.currencyGroups}>
        {item.list.map((currencyGroup, index) => (
          <View key={`${currencyGroup.currency}-${index}`} style={styles.currencyGroup}>
            <View style={styles.currencyHeader}>
              <Text style={[styles.currencyTitle, { color: colors.text }]}>
                {currencyGroup.currency} Cards
              </Text>
              <Text style={[styles.cardCount, { color: colors.textSecondary }]}>
                {currencyGroup.list.length} options
              </Text>
            </View>
            
            {currencyGroup.list.slice(0, 3).map((card, cardIndex) => {
              const bonuses = calculateBonuses(card.rate_detail);
              
              return (
                <TouchableOpacity
                  key={card.card_id}
                  style={[
                    styles.cardItem,
                    { borderBottomColor: colors.border },
                    cardIndex === currencyGroup.list.length - 1 && styles.lastCardItem,
                  ]}
                  onPress={() => {
                    // Navigate to calculator with pre-filled data
                    router.push({
                      pathname: '/calculator',
                      params: { 
                        cardId: card.card_id,
                        categoryId: item.category_id 
                      }
                    } as any);
                  }}
                >
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
                      {card.name}
                    </Text>
                    
                    {/* Rate Breakdown */}
                    <View style={styles.rateBreakdown}>
                      <View style={styles.baseRateContainer}>
                        <Text style={[styles.baseRateLabel, { color: colors.textSecondary }]}>
                          Base:
                        </Text>
                        <Text style={[styles.baseRate, { color: colors.text }]}>
                          {card.currency_symbol}{card.rate.toFixed(2)}
                        </Text>
                      </View>
                      
                      {/* VIP Bonus */}
                      {bonuses.vipBonus > 0 && (
                        <View style={styles.bonusContainer}>
                          <Crown size={12} color={colors.secondary} />
                          <Text style={[styles.bonusText, { color: colors.secondary }]}>
                            VIP +{bonuses.vipBonus}%
                          </Text>
                          <Text style={[styles.bonusAmount, { color: colors.secondary }]}>
                            (+{card.currency_symbol}{bonuses.vipAmount.toFixed(2)})
                          </Text>
                        </View>
                      )}
                      
                      {/* Coupon Bonus */}
                      {bonuses.couponBonus > 0 && (
                        <View style={styles.bonusContainer}>
                          <Gift size={12} color={colors.success} />
                          <Text style={[styles.bonusText, { color: colors.success }]}>
                            Coupon +{bonuses.couponBonus}%
                          </Text>
                          <Text style={[styles.bonusAmount, { color: colors.success }]}>
                            (+{card.currency_symbol}{bonuses.couponAmount.toFixed(2)})
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.optimalRateContainer}>
                    <Text style={[styles.optimalRate, { color: colors.primary }]}>
                      {card.currency_symbol}{card.optimal_rate}
                    </Text>
                    <View style={styles.rateIndicator}>
                      <TrendingUp size={12} color={colors.success} />
                      <Text style={[styles.rateLabel, { color: colors.success }]}>
                        Final Rate
                      </Text>
                    </View>
                    
                    {/* Total Bonus Percentage */}
                    {parseFloat(card.all_per) > 0 && (
                      <View style={[styles.totalBonusBadge, { backgroundColor: `${colors.primary}15` }]}>
                        <Percent size={10} color={colors.primary} />
                        <Text style={[styles.totalBonusText, { color: colors.primary }]}>
                          +{card.all_per}%
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {currencyGroup.list.length > 3 && (
              <TouchableOpacity 
                style={styles.showMoreButton}
                onPress={() => {
                  // Show all cards for this currency group
                  Alert.alert(
                    'More Cards', 
                    `View all ${currencyGroup.list.length} ${currencyGroup.currency} cards for ${item.category_name}`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'View All', 
                        onPress: () => {
                          // Navigate to filtered view
                          setSelectedCategory(item.category_id);
                          setSelectedCurrency(currencyGroup.currency);
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  +{currencyGroup.list.length - 3} more {currencyGroup.currency} cards
                </Text>
                <ChevronDown size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </Card>
  );

  const renderFilterModal = () => (
    showFilters && (
      <View style={styles.filterOverlay}>
        <View style={[styles.filterModal, { backgroundColor: colors.card }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              Filter Exchange Rates
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
                Card Category
              </Text>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  { 
                    backgroundColor: !selectedCategory ? colors.primary : 'transparent',
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleCategoryFilter(null)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: !selectedCategory ? '#FFFFFF' : colors.text }
                ]}>
                  All Categories
                </Text>
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.category_id}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: selectedCategory === category.category_id ? colors.primary : 'transparent',
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleCategoryFilter(category.category_id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedCategory === category.category_id ? '#FFFFFF' : colors.text }
                  ]}>
                    {category.category_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Currency Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
                Currency Type
              </Text>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  { 
                    backgroundColor: !selectedCurrency ? colors.primary : 'transparent',
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleCurrencyFilter(null)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: !selectedCurrency ? '#FFFFFF' : colors.text }
                ]}>
                  All Currencies
                </Text>
              </TouchableOpacity>
              
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.currency_id}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: selectedCurrency === currency.currency_code ? colors.primary : 'transparent',
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleCurrencyFilter(currency.currency_code)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedCurrency === currency.currency_code ? '#FFFFFF' : colors.text }
                  ]}>
                    {currency.currency_symbol} {currency.currency_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Clear Filters */}
          <Button
            title="Clear All Filters"
            variant="outline"
            onPress={() => {
              clearFilters();
              setShowFilters(false);
            }}
            style={styles.clearFiltersButton}
            fullWidth
          />
        </View>
      </View>
    )
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more rates...
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <TrendingUp size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No exchange rates found
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Try adjusting your filters or search terms to find more rates
      </Text>
      <Button
        title="Clear Filters"
        variant="outline"
        onPress={clearFilters}
        style={styles.clearFiltersButton}
      />
    </View>
  );

  // Debug information
  console.log('Render state:', {
    isLoading,
    error,
    categoriesCount: categories.length,
    currenciesCount: currencies.length,
    ratesData: ratesData ? `${ratesData.card_list.length} categories` : 'null',
    selectedCategory,
    selectedCurrency,
  });

  if (error && !ratesData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <Button
            title="Retry"
            onPress={() => fetchRatesData(countryId, true)}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const filteredData = getFilteredData();

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
            {ratesData ? `${filteredData.length} categories available` : 'Loading rates...'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.calculatorButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/calculator')}
        >
          <Zap size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' },
          ]}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search gift cards and rates..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { 
              backgroundColor: (selectedCategory || selectedCurrency) ? colors.primary : (colorScheme === 'dark' ? colors.card : '#F9FAFB'),
            },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={(selectedCategory || selectedCurrency) ? '#FFFFFF' : colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Active Filters Display */}
      {(selectedCategory || selectedCurrency) && (
        <View style={styles.activeFilters}>
          {selectedCategory && (
            <View style={[styles.activeFilter, { backgroundColor: colors.primary }]}>
              <Text style={styles.activeFilterText}>
                {categories.find(c => c.category_id === selectedCategory)?.category_name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          {selectedCurrency && (
            <View style={[styles.activeFilter, { backgroundColor: colors.secondary }]}>
              <Text style={styles.activeFilterText}>
                {currencies.find(c => c.currency_code === selectedCurrency)?.currency_name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedCurrency(null)}>
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Rates List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.category_id.toString()}
        renderItem={renderCategoryCard}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredData.length === 0 && !isLoading && styles.emptyListContainer,
        ]}
      />

      {/* Loading overlay for initial load */}
      {isLoading && !ratesData && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading exchange rates...
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: Spacing.sm,
    height: '100%',
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    gap: Spacing.xs,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  
  // Category Card Styles
  categoryCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Spacing.md,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  categoryIntro: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },
  timeoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeoutText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  topRateContainer: {
    alignItems: 'flex-end',
  },
  topRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: Spacing.xs,
    gap: 2,
  },
  topRateLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  topRate: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  topCurrency: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  
  // Currency Groups
  currencyGroups: {
    gap: Spacing.md,
  },
  currencyGroup: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  currencyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cardCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  
  // Card Items
  cardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  lastCardItem: {
    borderBottomWidth: 0,
  },
  cardInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  
  // Rate Breakdown
  rateBreakdown: {
    gap: Spacing.xs,
  },
  baseRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  baseRateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  baseRate: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bonusText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  bonusAmount: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Optimal Rate
  optimalRateContainer: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  optimalRate: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  rateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rateLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  totalBonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  totalBonusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  showMoreText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  
  // Filter Modal
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
  },
  filterOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  clearFiltersButton: {
    marginTop: Spacing.md,
  },
  
  // Loading and Error States
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
});