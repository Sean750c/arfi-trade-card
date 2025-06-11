import { create } from 'zustand';
import { Currency, RatesData, CategoryData } from '@/types/api';
import { RatesService } from '@/services/rates';

interface RatesState {
  // Data
  currencies: Currency[];
  allRatesData: RatesData | null; // Store all data for frontend filtering
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  
  // Filters
  selectedCurrency: string | null;
  searchQuery: string;
  
  // Actions
  fetchAllRatesData: (countryId: number, refresh?: boolean) => Promise<void>;
  setSelectedCurrency: (currency: string | null) => void;
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
  selectedCurrency: 'USD', // Default to USD as specified
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
        page: 0, // Pagination starts from 0
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
      selectedCurrency: 'USD', // Reset to default USD
      searchQuery: '',
    });
  },

  getFilteredData: () => {
    const state = get();
    
    if (!state.allRatesData) return [];
    
    let filteredData = [...state.allRatesData.card_list];
    
    // Apply currency filter (frontend filtering for better UX)
    // Only filter by currency type within each category, not remove categories
    if (state.selectedCurrency) {
      filteredData = filteredData.map(category => ({
        ...category,
        list: category.list.filter(currencyGroup => 
          currencyGroup.currency === state.selectedCurrency
        )
      })).filter(category => category.list.length > 0);
    }
    
    // Apply search filter (frontend filtering for instant results)
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
      currencies: [],
      allRatesData: null,
      isLoading: false,
      error: null,
      lastFetchTime: 0,
      selectedCurrency: 'USD', // Reset to default USD
      searchQuery: '',
    });
  },
}));