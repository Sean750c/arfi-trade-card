import { create } from 'zustand';
import { Activity } from '@/types/finder';
import { FinderService } from '@/services/finder';

interface FinderState {
  // Activities data
  activities: Activity[];
  isLoadingActivities: boolean;
  activitiesError: string | null;
  
  // Actions
  fetchActivities: (token?: string, countryId?: number) => Promise<void>;
  clearFinderData: () => void;
}

export const useFinderStore = create<FinderState>((set, get) => ({
  // Initial state
  activities: [],
  isLoadingActivities: false,
  activitiesError: null,

  fetchActivities: async (token, countryId = 1) => {
    set({ isLoadingActivities: true, activitiesError: null });
    
    try {
      const finderData = await FinderService.getFinder({
        token,
        country_id: countryId,
      });
      
      set({ 
        activities: finderData.active || [],
        isLoadingActivities: false 
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingActivities: false });
        return;
      }
      
      set({
        activitiesError: error instanceof Error ? error.message : 'Failed to fetch activities',
        isLoadingActivities: false,
      });
    }
  },

  clearFinderData: () => {
    set({
      activities: [],
      isLoadingActivities: false,
      activitiesError: null,
    });
  },
}));