import { create } from 'zustand';
import { CardCategory, Currency, RatesData, CategoryData } from '@/types/api';
import { RatesService } from '@/services/rates';

interface RatesState {
  // Data
  categories: CardCategory[];
  currencies: Currency[];
  ratesData: RatesData | null;
  
  // UI State
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  
  // Filters
  selectedCategory: number | null;
  selectedCurrency: string | null;
  searchQuery: string;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchCurrencies: () => Promise<void>;
  fetchRatesData: (countryId: number, refresh?: boolean) => Promise<void>;
  loadMoreRates: (countryId: number) => Promise<void>;
  setSelectedCategory: (categoryId: number | null) => void;
  setSelectedCurrency: (currency: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  reset: () => void;
}

export const useRatesStore = create<RatesState>((set, get) => ({
  // Initial state
  categories: [],
  currencies: [],
  ratesData: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  selectedCategory: null,
  selectedCurrency: null,
  searchQuery: '',
  currentPage: 1,
  hasMore: true,

  fetchCategories: async () => {
    try {
      const categories = await RatesService.getCardCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch categories' });
    }
  },

  fetchCurrencies: async () => {
    try {
      const currencies = await RatesService.getCurrencies();
      set({ currencies });
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch currencies' });
    }
  },

  fetchRatesData: async (countryId: number, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoading: true, 
        error: null, 
        currentPage: 1, 
        hasMore: true,
        ratesData: null 
      });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const params = {
        country_id: countryId,
        page: 1,
        page_size: 20,
        ...(state.selectedCategory && { card_category: state.selectedCategory }),
        ...(state.selectedCurrency && { currency: state.selectedCurrency }),
      };

      const ratesData = await RatesService.getRatesData(params);
      
      set({
        ratesData,
        currentPage: 1,
        hasMore: ratesData.card_list.length >= 20,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch rates data',
        isLoading: false,
      });
    }
  },

  loadMoreRates: async (countryId: number) => {
    const state = get();
    
    if (state.isLoadingMore || !state.hasMore) return;

    set({ isLoadingMore: true, error: null });

    try {
      const nextPage = state.currentPage + 1;
      const params = {
        country_id: countryId,
        page: nextPage,
        page_size: 20,
        ...(state.selectedCategory && { card_category: state.selectedCategory }),
        ...(state.selectedCurrency && { currency: state.selectedCurrency }),
      };

      const newRatesData = await RatesService.getRatesData(params);
      
      // Merge new data with existing data
      const updatedRatesData = state.ratesData ? {
        ...newRatesData,
        card_list: [...state.ratesData.card_list, ...newRatesData.card_list]
      } : newRatesData;

      set({
        ratesData: updatedRatesData,
        currentPage: nextPage,
        hasMore: newRatesData.card_list.length >= 20,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load more rates',
        isLoadingMore: false,
      });
    }
  },

  setSelectedCategory: (categoryId: number | null) => {
    set({ selectedCategory: categoryId });
  },

  setSelectedCurrency: (currency: string | null) => {
    set({ selectedCurrency: currency });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    set({
      selectedCategory: null,
      selectedCurrency: null,
      searchQuery: '',
    });
  },

  reset: () => {
    set({
      categories: [],
      currencies: [],
      ratesData: null,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      selectedCategory: null,
      selectedCurrency: null,
      searchQuery: '',
      currentPage: 1,
      hasMore: true,
    });
  },
}));