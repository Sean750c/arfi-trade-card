import { create } from 'zustand';
import { RebateService } from '@/services/rebate';
import type {
    InviteInfo,
    InviteRankInfo,
    InviteDetailItem
} from '@/types';

interface InviteState {
    inviteInfo: InviteInfo | null;
    inviteRank: InviteRankInfo | null;
    isLoadingInfo: boolean;
    isLoadingRank: boolean;
    infoError: string | null;
    rankError: string | null;

    // 邀请详情
    invitingList: InviteDetailItem[];
    currentPage: number;
    hasMore: boolean;
    isLoadingInvitingList: boolean;
    invitingListError: string | null;

    // 领取邀请返利
    isReceivingInviteRebate: boolean;
    receiveInviteRebateError: string | null;

    fetchInviteInfo: (token: string) => Promise<void>;
    fetchInviteRank: (token: string) => Promise<void>;
    fetchInvitingList: (token: string, refresh?: boolean) => Promise<void>;
    loadMoreInvitingList: (token: string) => Promise<void>;
    receiveInviteRebate: (token: string, recommend_user_id: number) => Promise<void>;
    clearInviteInfo: () => void;
}

export const useInviteStore = create<InviteState>((set, get) => ({
    inviteInfo: null,
    inviteRank: null,
    isLoadingInfo: false,
    isLoadingRank: false,
    infoError: null,
    rankError: null,
    invitingList: [],
    currentPage: 0,
    hasMore: true,
    isLoadingInvitingList: false,
    invitingListError: null,
    isReceivingInviteRebate: false,
    receiveInviteRebateError: null,

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
                infoError: error instanceof Error ? error.message : 'Failed to fetch invite info',
                isLoadingInfo: false,
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

    fetchInvitingList: async (token, refresh = false) => {
        if (refresh) {
            set({
                invitingList: [],
                currentPage: 0,
                hasMore: true,
                isLoadingInvitingList: true,
                invitingListError: null,
            });
        } else {
            set({ isLoadingInvitingList: true, invitingListError: null });
        }
        try {
            const page = 0;
            const pageSize = 20;
            const details = await RebateService.getInvitingList({ token, page, page_size: pageSize }) || [];
            set({
                invitingList: details,
                currentPage: 0,
                hasMore: details.length >= pageSize,
                isLoadingInvitingList: false,
            });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Session expired')) {
                set({ isLoadingInvitingList: false });
                return;
            }
            set({
                invitingListError: error instanceof Error ? error.message : 'Failed to fetch inviting details',
                isLoadingInvitingList: false,
            });
        }
    },

    loadMoreInvitingList: async (token) => {
        const state = get();
        if (state.isLoadingInvitingList || !state.hasMore) return;
        const nextPage = state.currentPage + 1;
        const pageSize = 20;
        set({ isLoadingInvitingList: true, invitingListError: null });
        try {
            const details = await RebateService.getInvitingList({ token, page: nextPage, page_size: pageSize }) || [];
            if (details.length === 0) {
                set({ isLoadingInvitingList: false, hasMore: false });
                return;
            }
            set({
                invitingList: [...state.invitingList, ...details],
                currentPage: nextPage,
                hasMore: details.length >= pageSize,
                isLoadingInvitingList: false,
            });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Session expired')) {
                set({ isLoadingInvitingList: false });
                return;
            }
            set({
                invitingListError: error instanceof Error ? error.message : 'Failed to load more inviting details',
                isLoadingInvitingList: false,
            });
        }
    },

    receiveInviteRebate: async (token, recommend_user_id) => {
        set({ isReceivingInviteRebate: true, receiveInviteRebateError: null });
        try {
            await RebateService.receiveInviteRebate({ token, recommend_user_id });
            set({ isReceivingInviteRebate: false });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Session expired')) {
                set({ isReceivingInviteRebate: false });
                return;
            }
            set({
                receiveInviteRebateError: error instanceof Error ? error.message : 'Failed to receive invite rebate',
                isReceivingInviteRebate: false,
            });
        }
    },

    clearInviteInfo: () => {
        set({
            inviteInfo: null,
            inviteRank: null,
            isLoadingInfo: false,
            isLoadingRank: false,
            infoError: null,
            rankError: null,
            invitingList: [],
            currentPage: 0,
            hasMore: true,
            isLoadingInvitingList: false,
            invitingListError: null,
            isReceivingInviteRebate: false,
            receiveInviteRebateError: null,
        });
    },
})); 