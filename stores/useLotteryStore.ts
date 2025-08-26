import { create } from 'zustand';
import { LotteryActivity, LotteryDrawResult, LotteryLogEntry, LotteryLogsData } from '@/types';
import { LotteryService } from '@/services/lottery';

interface LotteryState {
  // Lottery data
  lotteryActivity: LotteryActivity | null;
  lastDrawResult: LotteryDrawResult | null;
  lotteryLogs: LotteryLogEntry[];
  logsTotal: number;
  
  // UI state
  isLoadingActivity: boolean;
  isDrawing: boolean;
  isLoadingLogs: boolean;
  isLoadingMoreLogs: boolean;
  activityError: string | null;
  drawError: string | null;
  logsError: string | null;
  
  // Pagination
  currentLogsPage: number;
  hasMoreLogs: boolean;
  
  // Actions
  fetchLotteryActivity: (token: string) => Promise<void>;
  drawLottery: (token: string, activityId: number) => Promise<LotteryDrawResult>;
  fetchLotteryLogs: (token: string, refresh?: boolean) => Promise<void>;
  loadMoreLotteryLogs: (token: string) => Promise<void>;
  clearLotteryData: () => void;
  clearLastDrawResult: () => void;
}

export const useLotteryStore = create<LotteryState>((set, get) => ({
  // Initial state
  lotteryActivity: null,
  lastDrawResult: null,
  lotteryLogs: [],
  logsTotal: 0,
  isLoadingActivity: false,
  isDrawing: false,
  isLoadingLogs: false,
  isLoadingMoreLogs: false,
  activityError: null,
  drawError: null,
  logsError: null,
  currentLogsPage: 0,
  hasMoreLogs: true,

  fetchLotteryActivity: async (token: string) => {
    set({ isLoadingActivity: true, activityError: null });
    
    try {
      const activity = await LotteryService.getLotteryActivity(token);
      set({ lotteryActivity: activity, isLoadingActivity: false });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingActivity: false });
        return;
      }
      
      set({
        activityError: error instanceof Error ? error.message : 'Failed to fetch lottery activity',
        isLoadingActivity: false,
      });
    }
  },

  drawLottery: async (token: string, activityId: number): Promise<LotteryDrawResult> => {
    set({ isDrawing: true, drawError: null });
    
    try {
      const result = await LotteryService.drawLottery(token, activityId);
      
      // Store the draw result
      set({ lastDrawResult: result, isDrawing: false });
      
      // Refresh activity data to update user points
      // await get().fetchLotteryActivity(token);
      
      return result;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isDrawing: false });
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to draw lottery';
      set({
        drawError: errorMessage,
        isDrawing: false,
      });
      throw new Error(errorMessage);
    }
  },

  fetchLotteryLogs: async (token: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingLogs: true, 
        logsError: null,
        lotteryLogs: [],
        currentLogsPage: 0,
        hasMoreLogs: true,
      });
    } else {
      set({ isLoadingLogs: true, logsError: null });
    }

    try {
      const logsData = await LotteryService.getLotteryLogs({
        token,
        page: 0,
        page_size: 20,
      });

      set({
        lotteryLogs: logsData.list,
        logsTotal: logsData.total,
        currentLogsPage: 0,
        hasMoreLogs: logsData.list.length >= 20,
        isLoadingLogs: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingLogs: false });
        return;
      }
      
      set({
        logsError: error instanceof Error ? error.message : 'Failed to fetch lottery logs',
        isLoadingLogs: false,
      });
    }
  },

  loadMoreLotteryLogs: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMoreLogs || !state.hasMoreLogs) return;
    
    const nextPage = state.currentLogsPage + 1;
    
    set({ isLoadingMoreLogs: true, logsError: null });

    try {
      const logsData = await LotteryService.getLotteryLogs({
        token,
        page: nextPage,
        page_size: 20,
      });

      if (logsData.list.length === 0) {
        set({ isLoadingMoreLogs: false, hasMoreLogs: false });
        return;
      }

      set({
        lotteryLogs: [...state.lotteryLogs, ...logsData.list],
        currentLogsPage: nextPage,
        hasMoreLogs: logsData.list.length >= 20,
        isLoadingMoreLogs: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMoreLogs: false });
        return;
      }
      
      set({
        logsError: error instanceof Error ? error.message : 'Failed to load more lottery logs',
        isLoadingMoreLogs: false,
      });
    }
  },

  clearLastDrawResult: () => {
    set({ lastDrawResult: null });
  },

  clearLotteryData: () => {
    set({
      lotteryActivity: null,
      lastDrawResult: null,
      lotteryLogs: [],
      logsTotal: 0,
      isLoadingActivity: false,
      isDrawing: false,
      isLoadingLogs: false,
      isLoadingMoreLogs: false,
      activityError: null,
      drawError: null,
      logsError: null,
      currentLogsPage: 0,
      hasMoreLogs: true,
    });
  },
}));