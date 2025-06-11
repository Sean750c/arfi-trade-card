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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  TrendingUp,
  Zap,
  X,
} from 'lucide-react-native';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useRatesStore } from '@/stores/useRatesStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import CategoryCard from '@/components/rates/CategoryCard';
import FilterModal from '@/components/rates/FilterModal';
import type { CategoryData } from '@/types/api';

export default function RatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { selectedCountry } = useCountryStore();
  const { user } = useAuthStore();
  
  const {
    currencies,
    allRatesData,
    isLoading,
    error,
    selectedCurrency,
    searchQuery,
    fetchAllRatesData,
    setSelectedCurrency,
    setSearchQuery,
    clearFilters,
    getFilteredData,
  } = useRatesStore();

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Get country ID from user or selected country
  const countryId = user?.country_id || selectedCountry?.id || 1;

  // Single initialization effect to prevent repeated calls
  useEffect(() => {
    if (!initialized) {
      console.log('Initializing rates page data (single call)...');
      const initializeData = async () => {
        try {
          // Fetch all data in one call
          await fetchAllRatesData(countryId, true);
          setInitialized(true);
        } catch (error) {
          console.error('Failed to initialize rates data:', error);
        }
      };

      initializeData();
    }
  }, [initialized, fetchAllRatesData, countryId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAllRatesData(countryId, true);
    } finally {
      setRefreshing(false);
    }
  }, [countryId, fetchAllRatesData]);

  const handleCurrencyFilter = (currency: string | null) => {
    setSelectedCurrency(currency);
    setShowFilters(false);
  };

  // Get filtered data using the store's filtering logic
  const filteredData = getFilteredData();

  const renderCategoryCard = ({ item }: { item: CategoryData }) => (
    <CategoryCard 
      category={item} 
      selectedCurrency={selectedCurrency}
      onCurrencyFilter={setSelectedCurrency}
      onCardPress={(cardId, categoryId) => {
        router.push({
          pathname: '/calculator',
          params: { 
            cardId: cardId,
            categoryId: categoryId 
          }
        } as any);
      }}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <TrendingUp size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No exchange rates found
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Try adjusting your search terms to find more rates
      </Text>
      <Button
        title="Clear Search"
        variant="outline"
        onPress={() => setSearchQuery('')}
        style={styles.clearFiltersButton}
      />
    </View>
  );

  if (error && !allRatesData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <Button
            title="Retry"
            onPress={() => fetchAllRatesData(countryId, true)}
            style={styles.retryButton}
          />
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
            {allRatesData ? `${filteredData.length} categories available` : 'Loading rates...'}
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
              backgroundColor: selectedCurrency ? colors.primary : (colorScheme === 'dark' ? colors.card : '#F9FAFB'),
            },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={selectedCurrency ? '#FFFFFF' : colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Active Currency Filter Display */}
      {selectedCurrency && (
        <View style={styles.activeFilters}>
          <View style={[styles.activeFilter, { backgroundColor: colors.primary }]}>
            <Text style={styles.activeFilterText}>
              {currencies.find(c => c.currency_code === selectedCurrency)?.currency_name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedCurrency(null)}>
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Rates List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.category_id.toString()}
        renderItem={renderCategoryCard}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredData.length === 0 && !isLoading && styles.emptyListContainer,
        ]}
      />

      {/* Loading overlay for initial load */}
      {isLoading && !allRatesData && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading exchange rates...
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        onClose={() => setShowFilters(false)}
        onCurrencySelect={handleCurrencyFilter}
        onClearFilters={() => {
          clearFilters();
          setShowFilters(false);
        }}
      />
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