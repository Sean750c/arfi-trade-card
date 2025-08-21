import { create } from 'zustand';
import { CheckinConfig, CheckinLogEntry } from '@/types';
import { CheckinService } from '@/services/checkin';

interface CheckinState {
  // Checkin data
  checkinConfig: CheckinConfig | null;
  checkinLogs: CheckinLogEntry[];
  
  // UI state
  isLoadingConfig: boolean;
  isCheckingIn: boolean;
  isLoadingLogs: boolean;
  isLoadingMoreLogs: boolean;
  configError: string | null;
  checkinError: string | null;
  logsError: string | null;
  
  // Pagination for logs
  currentLogPage: number;
  hasMoreLogs: boolean;
  
  // Actions
  fetchCheckinConfig: (token: string, date: string) => Promise<void>;
  performCheckin: (token: string, ruleId: number, currentDisplayDate: string) => Promise<void>;
  fetchCheckinLogs: (token: string, refresh?: boolean) => Promise<void>;
  loadMoreCheckinLogs: (token: string) => Promise<void>;
  clearCheckinData: () => void;
}

export const useCheckinStore = create<CheckinState>((set, get) => ({
  // Initial state
  checkinConfig: null,
  checkinLogs: [],
  isLoadingConfig: false,
  isCheckingIn: false,
  isLoadingLogs: false,
  isLoadingMoreLogs: false,
  configError: null,
  checkinError: null,
  logsError: null,
  currentLogPage: 0,
  hasMoreLogs: true,

  fetchCheckinConfig: async (token: string, date: string) => {
    set({ isLoadingConfig: true, configError: null });
    
    try {
      const config = await CheckinService.getCheckinConfig(token, date);
      set({ checkinConfig: config, isLoadingConfig: false });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingConfig: false });
        return;
      }
      
      set({
        configError: error instanceof Error ? error.message : 'Failed to fetch checkin config',
        isLoadingConfig: false,
      });
    }
  },

  performCheckin: async (token: string, ruleId: number, currentDisplayDate: string) => {
    set({ isCheckingIn: true, checkinError: null });
    
    try {
      await CheckinService.performCheckin(token, ruleId);
      
      // Refresh checkin config after successful checkin
      await get().fetchCheckinConfig(token, currentDisplayDate);
      
      set({ isCheckingIn: false });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isCheckingIn: false });
        return;
      }
      
      set({
        checkinError: error instanceof Error ? error.message : 'Failed to perform checkin',
        isCheckingIn: false,
      });
      throw error; // Re-throw to allow component to handle success/error
    }
  },

  fetchCheckinLogs: async (token: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingLogs: true, 
        logsError: null,
        checkinLogs: [],
        currentLogPage: 0,
        hasMoreLogs: true,
      });
    } else {
      set({ isLoadingLogs: true, logsError: null });
    }

    try {
      const logs = await CheckinService.getCheckinLogs(token, 0, 20);
      set({
        checkinLogs: logs,
        currentLogPage: 0,
        hasMoreLogs: logs.length >= 20,
        isLoadingLogs: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingLogs: false });
        return;
      }
      
      set({
        logsError: error instanceof Error ? error.message : 'Failed to fetch checkin logs',
        isLoadingLogs: false,
      });
    }
  },

  loadMoreCheckinLogs: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMoreLogs || !state.hasMoreLogs) return;
    
    const nextPage = state.currentLogPage + 1;
    
    set({ isLoadingMoreLogs: true, logsError: null });

    try {
      const newLogs = await CheckinService.getCheckinLogs(token, nextPage, 20);

      if (newLogs.length === 0) {
        set({ isLoadingMoreLogs: false, hasMoreLogs: false });
        return;
      }

      set({
        checkinLogs: [...state.checkinLogs, ...newLogs],
        currentLogPage: nextPage,
        hasMoreLogs: newLogs.length >= 20,
        isLoadingMoreLogs: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMoreLogs: false });
        return;
      }
      
      set({
        logsError: error instanceof Error ? error.message : 'Failed to load more checkin logs',
        isLoadingMoreLogs: false,
      });
    }
  },

  clearCheckinData: () => {
    set({
      checkinConfig: null,
      checkinLogs: [],
      isLoadingConfig: false,
      isCheckingIn: false,
      isLoadingLogs: false,
      isLoadingMoreLogs: false,
      configError: null,
      checkinError: null,
      logsError: null,
      currentLogPage: 0,
      hasMoreLogs: true,
    });
  },
}));