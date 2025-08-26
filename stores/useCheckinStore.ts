import { create } from 'zustand';
import { CheckinConfig, CheckinLogEntry, PointLogEntry, PointLogsData } from '@/types';
import { CheckinService } from '@/services/checkin';

interface CheckinState {
  // Checkin data
  checkinConfig: CheckinConfig | null;
  
  // Point logs data
  pointLogs: PointLogEntry[];
  pointLogsTotal: number;
  currentPointLogsPage: number;
  hasMorePointLogs: boolean;
  
  // UI state
  isLoadingConfig: boolean;
  isCheckingIn: boolean;
  isLoadingPointLogs: boolean;
  isLoadingMorePointLogs: boolean;
  configError: string | null;
  checkinError: string | null;
  pointLogsError: string | null;
  
  // Pagination for logs
  
  // Actions
  fetchCheckinConfig: (token: string, date: string) => Promise<void>;
  performCheckin: (token: string, ruleId: number, currentDisplayDate: string) => Promise<void>;
  fetchPointLogs: (token: string, refresh?: boolean) => Promise<void>;
  loadMorePointLogs: (token: string) => Promise<void>;
  clearCheckinData: () => void;
}

export const useCheckinStore = create<CheckinState>((set, get) => ({
  // Initial state
  checkinConfig: null,
  pointLogs: [],
  pointLogsTotal: 0,
  currentPointLogsPage: 1,
  hasMorePointLogs: true,
  isLoadingConfig: false,
  isCheckingIn: false,
  isLoadingPointLogs: false,
  isLoadingMorePointLogs: false,
  configError: null,
  checkinError: null,
  pointLogsError: null,

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

  fetchPointLogs: async (token: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingPointLogs: true, 
        pointLogsError: null,
        pointLogs: [],
        currentPointLogsPage: 1,
        hasMorePointLogs: true,
      });
    } else {
      set({ isLoadingPointLogs: true, pointLogsError: null });
    }

    try {
      const pointLogsData = await CheckinService.getPointLogs({
        token,
        page: 1,
        page_size: 10,
      });

      set({
        pointLogs: pointLogsData.list,
        pointLogsTotal: pointLogsData.total,
        currentPointLogsPage: 1,
        hasMorePointLogs: pointLogsData.list.length >= 10,
        isLoadingPointLogs: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingPointLogs: false });
        return;
      }
      
      set({
        pointLogsError: error instanceof Error ? error.message : 'Failed to fetch point logs',
        isLoadingPointLogs: false,
      });
    }
  },

  loadMorePointLogs: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMorePointLogs || !state.hasMorePointLogs) return;
    
    const nextPage = state.currentPointLogsPage + 1;
    
    set({ isLoadingMorePointLogs: true, pointLogsError: null });

    try {
      const pointLogsData = await CheckinService.getPointLogs({
        token,
        page: nextPage,
        page_size: 10,
      });

      if (pointLogsData.list.length === 0) {
        set({ isLoadingMorePointLogs: false, hasMorePointLogs: false });
        return;
      }

      set(state => ({
        pointLogs: [...state.pointLogs, ...pointLogsData.list],
        currentPointLogsPage: nextPage,
        hasMorePointLogs: pointLogsData.list.length >= 10,
        isLoadingMorePointLogs: false,
      }));
      
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMorePointLogs: false });
        return;
      }
      
      set({
        pointLogsError: error instanceof Error ? error.message : 'Failed to load more point logs',
        isLoadingMorePointLogs: false,
      });
    }
  },
  clearCheckinData: () => {
    set({
      checkinConfig: null,
      pointLogs: [],
      pointLogsTotal: 0,
      currentPointLogsPage: 1,
      hasMorePointLogs: true,
      isLoadingConfig: false,
      isCheckingIn: false,
      isLoadingPointLogs: false,
      isLoadingMorePointLogs: false,
      configError: null,
      checkinError: null,
      pointLogsError: null,
    });
  },
}));