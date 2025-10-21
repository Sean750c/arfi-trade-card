import { create } from 'zustand';

interface ReviewState {
  showRatingPrompt: boolean;
  setShowRatingPrompt: (show: boolean) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  showRatingPrompt: false,
  setShowRatingPrompt: (show) => set({ showRatingPrompt: show }),
}));
