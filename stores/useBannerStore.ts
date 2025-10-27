import { create } from 'zustand';
import { Banner, Announcement, Transaction, BannerListResponse, LiveContentResponse } from '@/types';
import { APIRequest } from '@/utils/api';

interface BannerState {
  banners: Banner[];
  announcementContent: string[];
  homeActivity: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;

  announcement: Announcement[];
  transaction: Transaction[];
  isLoadingLiveContent: boolean;
  fetchLiveContentList: (country_id: number) => Promise<void>;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  announcementContent: [],
  homeActivity: {},
  isLoading: false,
  error: null,
  announcement: [],
  transaction: [],
  isLoadingLiveContent: false,
  fetchBanners: async () => {
    // Don't fetch if we already have banners and they're fresh
    if (get().banners.length > 0) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await APIRequest.request<BannerListResponse>('/gc/public/homebanner', 'POST');
      
      // Extract banners from the nested structure
      const banners = response.data.banner || [];
      const announcementContent = response.data.announcement_content || [];
      const homeActivity = response.data.home_activity || {};
      set({ 
        banners,
        announcementContent,
        homeActivity: homeActivity,
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

  fetchLiveContentList: async (country_id: number) => {
    set({ isLoadingLiveContent: true, error: null });
    try {
      const params = {
        country_id
      }
      const response = await APIRequest.request<LiveContentResponse>('/gc/config/liveContentList', 'POST', params);
      
      const liveContent = response.data;

      set({ 
        transaction: liveContent.transaction,
        announcement: liveContent.announcement,
        isLoadingLiveContent: false 
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Don't set error state for token expiration, as it's handled by redirect
        set({ isLoadingLiveContent: false });
        return;
      }
      
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch banners',
        isLoading: false 
      });
    }
  },
}));