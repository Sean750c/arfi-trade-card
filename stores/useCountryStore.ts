import { create } from 'zustand';
import { Country } from '@/types/api';
import { APIRequest } from '@/utils/api';

interface CountryState {
  countries: Country[];
  selectedCountry: Country | null;
  isLoading: boolean;
  error: string | null;
  fetchCountries: () => Promise<void>;
  setSelectedCountry: (country: Country) => void;
}

export const useCountryStore = create<CountryState>((set) => ({
  countries: [],
  selectedCountry: null,
  isLoading: false,
  error: null,
  fetchCountries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await APIRequest.request<CountryListResponse>('/gc/public/countrylist');
      set({ 
        countries: response.data,
        selectedCountry: response.data[0] || null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch countries',
        isLoading: false 
      });
    }
  },
  setSelectedCountry: (country) => set({ selectedCountry: country }),
}));