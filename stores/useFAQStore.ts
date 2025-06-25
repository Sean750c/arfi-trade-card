import { create } from 'zustand';
import { FAQItem } from '@/types';
import { FAQService } from '@/services/faq';

interface FAQState {
  // FAQ data
  faqList: FAQItem[];
  faqCategories: string[];
  
  // UI state
  isLoadingFAQList: boolean;
  isLoadingMore: boolean;
  faqsError: string | null;
  defaultError: string | null;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  
  // Actions
  fetchFAQCategories: () => Promise<void>;
  fetchFAQList: (refresh?: boolean) => Promise<void>;
  loadMoreFAQs: () => Promise<void>;
  clearFAQData: () => void;
}

export const useFAQStore = create<FAQState>((set, get) => ({
  // Initial state
  faqList: [],
  isLoadingFAQList: false,
  isLoadingMore: false,
  faqsError: null,
  defaultError: null,
  currentPage: 0,
  hasMore: true,
  faqCategories: [],

  fetchFAQCategories: async () => {
    try {
      const faqCategories = await FAQService.getFAQCategories();
      set({ faqCategories });
    } catch (error) {
      set({ defaultError: error instanceof Error ? error.message : 'Failed to fetch FAQ categories' });
    }
  },

  fetchFAQList: async (refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingFAQList: true, 
        faqsError: null,
        faqList: [],
        currentPage: 0,
        hasMore: true,
      });
    } else {
      set({ isLoadingFAQList: true, faqsError: null });
    }

    try {
      const faqList = await FAQService.getFAQList({
        page: 0,
        page_size: 20,
      });

      set({
        faqList: faqList,
        currentPage: 0,
        hasMore: faqList.length >= 20,
        isLoadingFAQList: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingFAQList: false });
        return;
      }
      
      set({
        faqsError: error instanceof Error ? error.message : 'Failed to fetch FAQ list',
        isLoadingFAQList: false,
      });
    }
  },

  loadMoreFAQs: async () => {
    const state = get();
    
    if (state.isLoadingMore || !state.hasMore) return;
    
    const nextPage = state.currentPage + 1;
    
    set({ isLoadingMore: true, faqsError: null });

    try {
      const newFaqList = await FAQService.getFAQList({
        page: nextPage,
        page_size: 20,
      });

      if (newFaqList.length === 0) {
        set({ isLoadingMore: false, hasMore: false });
        return;
      }

      set({
        faqList: [...state.faqList, ...newFaqList],
        currentPage: nextPage,
        hasMore: newFaqList.length >= 20,
        isLoadingMore: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMore: false });
        return;
      }
      
      set({
        faqsError: error instanceof Error ? error.message : 'Failed to load more FAQ list',
        isLoadingMore: false,
      });
    }
  },

  clearFAQData: () => {
    set({
      faqList: [],
      isLoadingFAQList: false,
      isLoadingMore: false,
      faqsError: null,
      defaultError: null,
      currentPage: 0,
      hasMore: true,
    });
  },
}));