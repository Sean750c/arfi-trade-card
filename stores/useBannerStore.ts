import { create } from 'zustand';
import { Banner, BannerListResponse } from '@/types';
import { APIRequest } from '@/utils/api';

interface BannerState {
  banners: Banner[];
  isLoading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  isLoading: false,
  error: null,
  fetchBanners: async () => {
    // Don't fetch if we already have banners and they're fresh
    if (get().banners.length > 0) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await APIRequest.request<BannerListResponse>('/gc/public/homebanner', 'POST');
      
      // Extract banners from the nested structure
      const banners = response.data.banner || [];
      
      set({ 
        banners,
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
        error: error instanceof Error ? error.message : 'Failed to fetch banners',
        isLoading: false 
      });
    }
  },
}));