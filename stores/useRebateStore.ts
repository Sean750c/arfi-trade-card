import { create } from 'zustand';
import { RebateService } from '@/services/rebate';
import type {
    InviteInfoResponse,
    RebateInfo,
    RebateItem,
    InviteRankResponse
} from '@/types';

interface RebateState {
    // 返利数据
    inviteInfo: InviteInfoResponse | null;
    inviteRank: InviteRankResponse | null;

    // Rebate List
    isInitialLoad: boolean;
    rebateInfo: RebateInfo | null;
    rebateList: RebateItem[];
    currentPage: number;
    hasMore: boolean;

    // 加载状态
    isLoadingInfo: boolean;
    isLoadingRebateList: boolean;
    isLoadingMore: boolean;
    isLoadingRank: boolean;

    // 错误处理
    infoError: string | null;
    rebateListError: string | null;
    rankError: string | null;

    // Filters
    activeWalletType: '1' | '2'; // 1: NGN, 2: USDT
    activeRebateType: number;

    // 方法
    fetchInviteInfo: (token: string) => Promise<void>;
    fetchRebateList: (token: string, params: any) => Promise<void>;
    loadMoreRebateList: (token: string) => Promise<void>;
    fetchInviteRank: (token: string) => Promise<void>;
    setActiveWalletType: (type: '1' | '2') => void;
    clearRebateInfo: () => void;
}

export const useRebateStore = create<RebateState>((set, get) => ({
    // 初始状态
    inviteInfo: null,
    inviteRank: null,
    isInitialLoad: true, // 初始加载完成
    rebateInfo: null,
    rebateList: [],
    currentPage: 0,
    hasMore: true,
    isLoadingInfo: false,
    isLoadingRebateList: false,
    isLoadingMore: false,
    isLoadingRank: false,
    infoError: null,
    rebateListError: null,
    rankError: null,
    activeWalletType: '1',
    activeRebateType: 0,

    fetchInviteInfo: async (token: string) => {
        set({ isLoadingInfo: true, infoError: null });

        try {
            const rebateInfo = await RebateService.getInviteInfo({ token });
            set({ inviteInfo: rebateInfo, isLoadingInfo: false });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Session expired')) {
                set({ isLoadingInfo: false });
                return;
            }

            set({
                infoError: error instanceof Error ? error.message : 'Failed to fetch rebate info',
                isLoadingInfo: false,
            });
        }
    },

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

    fetchInviteRank: async (token: string) => {
        set({ isLoadingRank: true, rankError: null });

        try {
            const inviteRank = await RebateService.getInviteRankList({ token });
            set({ inviteRank, isLoadingRank: false });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Session expired')) {
                set({ isLoadingRank: false });
                return;
            }

            set({
                rankError: error instanceof Error ? error.message : 'Failed to fetch invite rank',
                isLoadingRank: false,
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
            inviteInfo: null,
            inviteRank: null,
            rebateInfo: null,
            rebateList: [],
            isLoadingRebateList: false,
            isLoadingMore: false,
            isLoadingInfo: false,
            isLoadingRank: false,
            infoError: null,
            rebateListError: null,
            rankError: null,
        });
    },
}));