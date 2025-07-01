import { create } from 'zustand';
import { RebateService } from '@/services/rebate';
import type {
    RebateInfo,
    RebateItem,
} from '@/types';

interface RebateState {
    // Rebate List
    isInitialLoad: boolean;
    rebateInfo: RebateInfo | null;
    rebateList: RebateItem[];
    currentPage: number;
    hasMore: boolean;

    // 加载状态
    isLoadingRebateList: boolean;
    isLoadingMore: boolean;

    // 错误处理
    rebateListError: string | null;

    // Filters
    activeWalletType: '1' | '2'; // 1: NGN, 2: USDT
    activeRebateType: number;

    // 方法
    fetchRebateList: (token: string, params: any) => Promise<void>;
    loadMoreRebateList: (token: string) => Promise<void>;
    setActiveWalletType: (type: '1' | '2') => void;
    clearRebateInfo: () => void;
}

export const useRebateStore = create<RebateState>((set, get) => ({
    // 初始状态
    isInitialLoad: true, // 初始加载完成
    rebateInfo: null,
    rebateList: [],
    currentPage: 0,
    hasMore: true,
    isLoadingRebateList: false,
    isLoadingMore: false,
    rebateListError: null,
    activeWalletType: '1',
    activeRebateType: 0,

    fetchRebateList: async (token: string, refresh = false) => {
        const state = get();

        if (refresh) {
            set({
                isLoadingRebateList: true,
                rebateListError: null,
                rebateList: [],
                currentPage: 0,
                hasMore: true,
                isInitialLoad: true, // 标记为初始加载
            });
        } else {
            set({ isLoadingRebateList: true, rebateListError: null });
        }

        try {
            const response = await RebateService.getRebateList({
                token,
                type: state.activeRebateType,
                wallet_type: state.activeWalletType,
                page: 0,
                page_size: 20,
            });

            const rebateInfo = response.data || null;
            const rebateList = rebateInfo.user_rebate_list || [];

            set({
                rebateInfo: rebateInfo,
                rebateList,
                currentPage: 0,
                hasMore: rebateList.length >= 20,
                isLoadingRebateList: false,
                isInitialLoad: false, // 初始加载完成
            });
        } catch (error) {
            // Handle token expiration errors specifically
            if (error instanceof Error && error.message.includes('Session expired')) {
                set({ isLoadingRebateList: false });
                return;
            }

            set({
                rebateListError: error instanceof Error ? error.message : 'Failed to rebate list',
                isLoadingRebateList: false,
            });
        }
    },

    loadMoreRebateList: async (token: string) => {
        const state = get();

        if (state.isLoadingMore || !state.hasMore || state.isInitialLoad) return;

        const nextPage = state.currentPage + 1;

        set({ isLoadingMore: true, rebateListError: null });

        try {
            const response = await RebateService.getRebateList({
                token,
                type: state.activeRebateType,
                wallet_type: state.activeWalletType,
                page: nextPage,
                page_size: 20,
            });

            const newRebateInfo = response.data || null;
            const newRebateList = newRebateInfo.user_rebate_list || [];

            if (newRebateList.length === 0) {
                set({ isLoadingMore: false, hasMore: false });
                return;
            }

            set({
                rebateInfo: newRebateInfo,
                rebateList: [...state.rebateList, ...newRebateList],
                currentPage: nextPage,
                hasMore: newRebateList.length >= 20,
                isLoadingMore: false,
            });
        } catch (error) {
            // Handle token expiration errors specifically
            if (error instanceof Error && error.message.includes('Session expired')) {
                set({ isLoadingMore: false });
                return;
            }

            set({
                rebateListError: error instanceof Error ? error.message : 'Failed to load more rebate list',
                isLoadingMore: false,
            });
        }
    },

    setActiveWalletType: (type: '1' | '2') => {
        set({ 
          activeWalletType: type,
          // Reset transactions when changing wallet type
          rebateInfo: null,
          rebateList: [],
          currentPage: 0,
          hasMore: true,
        });
      },

    clearRebateInfo: () => {
        set({
            currentPage: 0,
            hasMore: true,
            isInitialLoad: true,
            rebateInfo: null,
            rebateList: [],
            isLoadingRebateList: false,
            isLoadingMore: false,
            rebateListError: null,
        });
    },
}));