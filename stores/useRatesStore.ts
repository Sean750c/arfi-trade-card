import { create } from 'zustand';
import { Currency, RatesData, CategoryData } from '@/types/api';
import { RatesService } from '@/services/rates';

interface RatesState {
  // Data
  currencies: Currency[];
  allRatesData: RatesData | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  
  // Filters
  selectedCategory: number | null;
  searchQuery: string;
  
  // Actions
  fetchAllRatesData: (countryId: number, refresh?: boolean) => Promise<void>;
  setSelectedCategory: (categoryId: number | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  getFilteredData: () => CategoryData[];
  reset: () => void;
}

export const useRatesStore = create<RatesState>((set, get) => ({
  // Initial state
  currencies: [],
  allRatesData: null,
  isLoading: false,
  error: null,
  lastFetchTime: 0,
  selectedCategory: null,
  searchQuery: '',

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
        page: 0, // Pagination starts from 0 as specified
        page_size: 1000, // Large page size to get all data at once
      };

      console.log('Fetching all rates with params:', params);

      // Fetch rates data and currencies in parallel
      const [allRatesData, currencies] = await Promise.all([
        RatesService.getRatesData(params),
        state.currencies.length > 0 ? Promise.resolve(state.currencies) : RatesService.getCurrencies(),
      ]);
      
      set({
        allRatesData,
        currencies,
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

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    console.log('Clearing all filters');
    set({
      selectedCategory: null,
      searchQuery: '',
    });
  },

  getFilteredData: () => {
    const state = get();
    
    if (!state.allRatesData) return [];
    
    let filteredData = [...state.allRatesData.card_list];
    
    // Apply category filter (frontend filtering for better UX)
    if (state.selectedCategory) {
      filteredData = filteredData.filter(category => 
        category.category_id === state.selectedCategory
      );
    }
    
    // Apply search filter (frontend filtering for instant results)
    if (state.searchQuery.trim()) {
      const searchLower = state.searchQuery.toLowerCase();
      filteredData = filteredData.filter(category =>
        category.category_name.toLowerCase().includes(searchLower) ||
        category.category_introduction.toLowerCase().includes(searchLower) ||
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
      currencies: [],
      allRatesData: null,
      isLoading: false,
      error: null,
      lastFetchTime: 0,
      selectedCategory: null,
      searchQuery: '',
    });
  },
}));