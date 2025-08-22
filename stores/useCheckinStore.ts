import { create } from 'zustand';
import { CheckinConfig, CheckinLogEntry } from '@/types';
import { CheckinService } from '@/services/checkin';

interface CheckinState {
  // Checkin data
  checkinConfig: CheckinConfig | null;
  
  // UI state
  isLoadingConfig: boolean;
  isCheckingIn: boolean;
  configError: string | null;
  checkinError: string | null;
  
  // Pagination for logs
  
  // Actions
  fetchCheckinConfig: (token: string, date: string) => Promise<void>;
  performCheckin: (token: string, ruleId: number, currentDisplayDate: string) => Promise<void>;
  clearCheckinData: () => void;
}

export const useCheckinStore = create<CheckinState>((set, get) => ({
  // Initial state
  checkinConfig: null,
  isLoadingConfig: false,
  isCheckingIn: false,
  configError: null,
  checkinError: null,

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

  clearCheckinData: () => {
    set({
      checkinConfig: null,
      isLoadingConfig: false,
      isCheckingIn: false,
      configError: null,
      checkinError: null,
    });
  },
}));