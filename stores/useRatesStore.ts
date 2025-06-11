import { create } from 'zustand';
import { CardCategory, Currency, RatesData, CategoryData } from '@/types/api';
import { RatesService } from '@/services/rates';

interface RatesState {
  // Data
  categories: CardCategory[];
  currencies: Currency[];
  allRatesData: RatesData | null; // Store all data for frontend filtering
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  
  // Filters
  selectedCategory: number | null;
  selectedCurrency: string | null;
  searchQuery: string;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchCurrencies: () => Promise<void>;
  fetchAllRatesData: (countryId: number, refresh?: boolean) => Promise<void>;
  setSelectedCategory: (categoryId: number | null) => void;
  setSelectedCurrency: (currency: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  getFilteredData: () => CategoryData[];
  reset: () => void;
}

export const useRatesStore = create<RatesState>((set, get) => ({
  // Initial state
  categories: [],
  currencies: [],
  allRatesData: null,
  isLoading: false,
  error: null,
  lastFetchTime: 0,
  selectedCategory: null,
  selectedCurrency: null,
  searchQuery: '',

  fetchCategories: async () => {
    const state = get();
    
    // Avoid repeated calls - cache for 5 minutes
    if (state.categories.length > 0 && Date.now() - state.lastFetchTime < 300000) {
      return;
    }

    try {
      console.log('Fetching categories...');
      const categories = await RatesService.getCardCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch categories' });
    }
  },

  fetchCurrencies: async () => {
    const state = get();
    
    // Avoid repeated calls - cache for 5 minutes
    if (state.currencies.length > 0 && Date.now() - state.lastFetchTime < 300000) {
      return;
    }

    try {
      console.log('Fetching currencies...');
      const currencies = await RatesService.getCurrencies();
      set({ currencies });
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch currencies' });
    }
  },

  fetchAllRatesData: async (countryId: number, refresh = false) => {
    const state = get();
    
    // Avoid repeated calls unless refresh is explicitly requested
    if (!refresh && state.allRatesData && Date.now() - state.lastFetchTime < 60000) {
      console.log('Using cached rates data');
      return;
    }

    console.log('Fetching all rates data, refresh:', refresh, 'countryId:', countryId);
    
    set({ isLoading: true, error: null });

    try {
      // Fetch all data at once with a large page size to reduce backend calls
      const params = {
        country_id: countryId,
        page: 0, // Start from page 0 as specified
        page_size: 1000, // Large page size to get all data at once
      };

      console.log('Fetching all rates with params:', params);

      const allRatesData = await RatesService.getRatesData(params);
      console.log('All rates data received:', allRatesData);
      
      set({
        allRatesData,
        isLoading: false,
        lastFetchTime: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching all rates data:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch rates data',
        isLoading: false,
      });
    }
  },

  setSelectedCategory: (categoryId: number | null) => {
    console.log('Setting selected category:', categoryId);
    set({ selectedCategory: categoryId });
  },

  setSelectedCurrency: (currency: string | null) => {
    console.log('Setting selected currency:', currency);
    set({ selectedCurrency: currency });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    console.log('Clearing all filters');
    set({
      selectedCategory: null,
      selectedCurrency: null,
      searchQuery: '',
    });
  },

  getFilteredData: () => {
    const state = get();
    
    if (!state.allRatesData) return [];
    
    let filteredData = [...state.allRatesData.card_list];
    
    // Apply category filter
    if (state.selectedCategory) {
      filteredData = filteredData.filter(category => 
        category.category_id === state.selectedCategory
      );
    }
    
    // Apply currency filter
    if (state.selectedCurrency) {
      filteredData = filteredData.map(category => ({
        ...category,
        list: category.list.filter(currencyGroup => 
          currencyGroup.currency === state.selectedCurrency
        )
      })).filter(category => category.list.length > 0);
    }
    
    // Apply search filter
    if (state.searchQuery.trim()) {
      const searchLower = state.searchQuery.toLowerCase();
      filteredData = filteredData.filter(category =>
        category.category_name.toLowerCase().includes(searchLower) ||
        category.list.some(currencyGroup =>
          currencyGroup.list.some(card =>
            card.name.toLowerCase().includes(searchLower)
          )
        )
      );
    }
    
    return filteredData;
  },

  reset: () => {
    set({
      categories: [],
      currencies: [],
      allRatesData: null,
      isLoading: false,
      error: null,
      lastFetchTime: 0,
      selectedCategory: null,
      selectedCurrency: null,
      searchQuery: '',
    });
  },
}));