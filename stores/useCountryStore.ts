import { create } from 'zustand';
import { Country } from '@/types';
import { APIRequest } from '@/utils/api';
import { CountryListResponse } from '@/types';

interface CountryState {
  countries: Country[];
  selectedCountry: Country | null;
  isLoading: boolean;
  error: string | null;
  fetchCountries: () => Promise<void>;
  setSelectedCountry: (country: Country) => void;
}

export const useCountryStore = create<CountryState>((set, get) => ({
  countries: [],
  selectedCountry: null,
  isLoading: false,
  error: null,
  fetchCountries: async () => {
    // Don't fetch if we already have countries
    if (get().countries.length > 0) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await APIRequest.request<CountryListResponse>('/gc/public/countrylist', 'POST');
      set({ 
        countries: response.data,
        selectedCountry: response.data[0] || null,
        isLoading: false 
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Don't set error state for token expiration, as it's handled by redirect
        set({ isLoading: false });
        return;
      }
      
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch countries',
        isLoading: false 
      });
    }
  },
  setSelectedCountry: (country) => set({ selectedCountry: country }),
}));