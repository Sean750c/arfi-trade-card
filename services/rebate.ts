import { APIRequest } from '@/utils/api';
import type {
    EmptyReponse,
    InviteDetailRequest,
    InviteDetailResponse,
    InviteInfoRequest,
    InviteInfoResponse,
    InviteRankRequest,
    InviteRankResponse,
    RebateListRequest,
    RebateListResponse,
    ReceiveInviteRebateRequest
} from '@/types';

export class WalletService {

    static async getInviteInfo(params: InviteInfoRequest): Promise<InviteInfoResponse> {
        try {
            const response = await APIRequest.request<InviteInfoResponse>(
                '/gc/rebate/inviteinfo',
                'POST',
                params
            );

            if (!response.success) {
                throw new Error(response.msg || 'Failed to fetch invite information');
            }

            return response;
        } catch (error) {
            // Handle token expiration errors specifically
            if (error instanceof Error && error.message.includes('Session expired')) {
                throw error; // Re-throw token expiration errors
            }

            if (error instanceof Error) {
                throw new Error(`Failed to fetch invite information: ${error.message}`);
            }
            throw new Error('Failed to fetch invite information');
        }
    }

    static async getRebateList(params: RebateListRequest): Promise<RebateListResponse> {
        try {
            const response = await APIRequest.request<RebateListResponse>(
                '/gc/rebate/rebateList',
                'POST',
                params
            );

            if (!response.success) {
                throw new Error(response.msg || 'Failed to fetch rebate list');
            }

            return response;
        } catch (error) {
            // Handle token expiration errors specifically
            if (error instanceof Error && error.message.includes('Session expired')) {
                throw error; // Re-throw token expiration errors
            }

            if (error instanceof Error) {
                throw new Error(`Failed to fetch rebate list: ${error.message}`);
            }
            throw new Error('Failed to fetch rebate list');
        }
    }

    static async getInviteRankList(params: InviteRankRequest): Promise<InviteRankResponse> {
        try {
            const response = await APIRequest.request<InviteRankResponse>(
                '/gc/rebate/inviteRankList',
                'POST',
                params
            );

            if (!response.success) {
                throw new Error(response.msg || 'Failed to fetch invite rank list');
            }

            return response;
        } catch (error) {
            // Handle token expiration errors specifically
            if (error instanceof Error && error.message.includes('Session expired')) {
                throw error; // Re-throw token expiration errors
            }

            if (error instanceof Error) {
                throw new Error(`Failed to fetch invite rank list: ${error.message}`);
            }
            throw new Error('Failed to fetch invite rank list');
        }
    }

    static async getInvitingDetails(params: InviteDetailRequest): Promise<InviteDetailResponse> {
        try {
            const response = await APIRequest.request<InviteDetailResponse>(
                '/gc/rebate/getInvitingDetails',
                'POST',
                params
            );

            if (!response.success) {
                throw new Error(response.msg || 'Failed to fetch wallet transactions');
            }

            return response;
        } catch (error) {
            // Handle token expiration errors specifically
            if (error instanceof Error && error.message.includes('Session expired')) {
                throw error; // Re-throw token expiration errors
            }

            if (error instanceof Error) {
                throw new Error(`Failed to fetch wallet transactions: ${error.message}`);
            }
            throw new Error('Failed to fetch wallet transactions');
        }
    }

    static async receiveInviteRebate(params: ReceiveInviteRebateRequest): Promise<EmptyReponse> {
        try {
            const response = await APIRequest.request<EmptyReponse>(
                '/gc/rebate/receiveInviteRebate',
                'POST',
                params
            );

            if (!response.success) {
                throw new Error(response.msg || 'Failed to fetch wallet transactions');
            }

            return response;
        } catch (error) {
            // Handle token expiration errors specifically
            if (error instanceof Error && error.message.includes('Session expired')) {
                throw error; // Re-throw token expiration errors
            }

            if (error instanceof Error) {
                throw new Error(`Failed to fetch wallet transactions: ${error.message}`);
            }
            throw new Error('Failed to fetch wallet transactions');
        }
    }
}