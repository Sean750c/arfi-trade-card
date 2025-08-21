import { create } from 'zustand';
import { LotteryActivity, LotteryDrawResult } from '@/types';
import { LotteryService } from '@/services/lottery';

interface LotteryState {
  // Lottery data
  lotteryActivity: LotteryActivity | null;
  lastDrawResult: LotteryDrawResult | null;
  
  // UI state
  isLoadingActivity: boolean;
  isDrawing: boolean;
  activityError: string | null;
  drawError: string | null;
  
  // Actions
  fetchLotteryActivity: (token: string) => Promise<void>;
  drawLottery: (token: string, activityId: number) => Promise<LotteryDrawResult>;
  clearLotteryData: () => void;
  clearLastDrawResult: () => void;
}

export const useLotteryStore = create<LotteryState>((set, get) => ({
  // Initial state
  lotteryActivity: null,
  lastDrawResult: null,
  isLoadingActivity: false,
  isDrawing: false,
  activityError: null,
  drawError: null,

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
      await get().fetchLotteryActivity(token);
      
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

  clearLastDrawResult: () => {
    set({ lastDrawResult: null });
  },

  clearLotteryData: () => {
    set({
      lotteryActivity: null,
      lastDrawResult: null,
      isLoadingActivity: false,
      isDrawing: false,
      activityError: null,
      drawError: null,
    });
  },
}));