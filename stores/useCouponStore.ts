import { create } from 'zustand';
import { Coupon } from '@/types';
import { CouponService } from '@/services/coupon';

interface CouponState {
  // Coupon data
  coupons: Coupon[];
  
  // UI state
  isLoadingCoupons: boolean;
  isLoadingMore: boolean;
  couponsError: string | null;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  
  // Wallet type for filtering
  walletType: number;
  
  // Actions
  fetchCoupons: (walletType: number, token: string, refresh?: boolean) => Promise<void>;
  loadMoreCoupons: (token: string) => Promise<void>;
  clearCouponData: () => void;
}

export const useCouponStore = create<CouponState>((set, get) => ({
  // Initial state
  coupons: [],
  isLoadingCoupons: false,
  isLoadingMore: false,
  couponsError: null,
  currentPage: 0,
  hasMore: true,
  walletType: 0,

  fetchCoupons: async (walletType: number, token: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingCoupons: true, 
        couponsError: null,
        coupons: [],
        currentPage: 0,
        hasMore: true,
        walletType,
      });
    } else {
      set({ isLoadingCoupons: true, couponsError: null, walletType });
    }

    try {
      const coupons = await CouponService.getAvailableCoupons({
        token,
        type: walletType,
        page: 0,
        page_size: 10,
      });

      set({
        coupons: coupons,
        currentPage: 0,
        hasMore: coupons.length >= 10,
        isLoadingCoupons: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingCoupons: false });
        return;
      }
      
      set({
        couponsError: error instanceof Error ? error.message : 'Failed to fetch coupons',
        isLoadingCoupons: false,
      });
    }
  },

  loadMoreCoupons: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMore || !state.hasMore) return;
    
    const nextPage = state.currentPage + 1;
    
    set({ isLoadingMore: true, couponsError: null });

    try {
      const newCoupons = await CouponService.getAvailableCoupons({
        token,
        type: state.walletType,
        page: nextPage,
        page_size: 10,
      });

      if (newCoupons.length === 0) {
        set({ isLoadingMore: false, hasMore: false });
        return;
      }

      set({
        coupons: [...state.coupons, ...newCoupons],
        currentPage: nextPage,
        hasMore: newCoupons.length >= 10,
        isLoadingMore: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMore: false });
        return;
      }
      
      set({
        couponsError: error instanceof Error ? error.message : 'Failed to load more coupons',
        isLoadingMore: false,
      });
    }
  },

  clearCouponData: () => {
    set({
      coupons: [],
      isLoadingCoupons: false,
      isLoadingMore: false,
      couponsError: null,
      currentPage: 0,
      hasMore: true,
      walletType: 0,
    });
  },
})); 