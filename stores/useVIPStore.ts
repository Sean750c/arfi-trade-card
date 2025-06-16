import { create } from 'zustand';
import { VIPData, VIPLogEntry } from '@/types';
import { VIPService } from '@/services/vip';

interface VIPState {
  // VIP data
  vipData: VIPData | null;
  vipLogs: VIPLogEntry[];
  vipDefault: any;
  
  // UI state
  isLoadingVIP: boolean;
  isLoadingLogs: boolean;
  isLoadingDefault: boolean;
  isLoadingMore: boolean;
  vipError: string | null;
  logsError: string | null;
  defaultError: string | null;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  
  // Actions
  fetchVIPInfo: (token: string) => Promise<void>;
  fetchVIPLogs: (token: string, refresh?: boolean) => Promise<void>;
  fetchVIPDefault: () => Promise<void>;
  loadMoreLogs: (token: string) => Promise<void>;
  clearVIPData: () => void;
}

export const useVIPStore = create<VIPState>((set, get) => ({
  // Initial state
  vipData: null,
  vipLogs: [],
  vipDefault: null,
  isLoadingVIP: false,
  isLoadingLogs: false,
  isLoadingDefault: false,
  isLoadingMore: false,
  vipError: null,
  logsError: null,
  defaultError: null,
  currentPage: 0,
  hasMore: true,

  fetchVIPInfo: async (token: string) => {
    set({ isLoadingVIP: true, vipError: null });
    
    try {
      const vipData = await VIPService.getVIPInfo(token);
      set({ vipData, isLoadingVIP: false });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingVIP: false });
        return;
      }
      
      set({
        vipError: error instanceof Error ? error.message : 'Failed to fetch VIP info',
        isLoadingVIP: false,
      });
    }
  },

  fetchVIPLogs: async (token: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingLogs: true, 
        logsError: null,
        vipLogs: [],
        currentPage: 0,
        hasMore: true,
      });
    } else {
      set({ isLoadingLogs: true, logsError: null });
    }

    try {
      const logs = await VIPService.getVIPLogs({
        token,
        page: 0,
        page_size: 20,
      });

      set({
        vipLogs: logs,
        currentPage: 0,
        hasMore: logs.length >= 20,
        isLoadingLogs: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingLogs: false });
        return;
      }
      
      set({
        logsError: error instanceof Error ? error.message : 'Failed to fetch VIP logs',
        isLoadingLogs: false,
      });
    }
  },

  fetchVIPDefault: async () => {
    set({ isLoadingDefault: true, defaultError: null });
    
    try {
      const defaultData = await VIPService.getVIPDefault();
      set({ vipDefault: defaultData, isLoadingDefault: false });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingDefault: false });
        return;
      }
      
      set({
        defaultError: error instanceof Error ? error.message : 'Failed to fetch VIP default info',
        isLoadingDefault: false,
      });
    }
  },

  loadMoreLogs: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMore || !state.hasMore) return;
    
    const nextPage = state.currentPage + 1;
    
    set({ isLoadingMore: true, logsError: null });

    try {
      const newLogs = await VIPService.getVIPLogs({
        token,
        page: nextPage,
        page_size: 20,
      });

      if (newLogs.length === 0) {
        set({ isLoadingMore: false, hasMore: false });
        return;
      }

      set({
        vipLogs: [...state.vipLogs, ...newLogs],
        currentPage: nextPage,
        hasMore: newLogs.length >= 20,
        isLoadingMore: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMore: false });
        return;
      }
      
      set({
        logsError: error instanceof Error ? error.message : 'Failed to load more VIP logs',
        isLoadingMore: false,
      });
    }
  },

  clearVIPData: () => {
    set({
      vipData: null,
      vipLogs: [],
      vipDefault: null,
      isLoadingVIP: false,
      isLoadingLogs: false,
      isLoadingDefault: false,
      isLoadingMore: false,
      vipError: null,
      logsError: null,
      defaultError: null,
      currentPage: 0,
      hasMore: true,
    });
  },
}));