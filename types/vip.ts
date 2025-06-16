import type { APIResponse } from './api';

export interface VIPInfo {
    level: number;
    exp: number;
    rate: number;
}

export interface VIPTask {
    task_name: string;
    value: number;
    is_get: boolean;
}

export interface VIPData {
    vip_level: number;
    vip_exp: number;
    vip_info: VIPInfo[];
    next_exp: number;
    total_bonus: number;
    total_bonus_usdt: number;
    referred_total_bonus: number;
    first_order_bonus: number;
    amount_order_bonus: {
        bonus_amount: number;
        order_amount: number;
    };
    currency_symbol: string;
    task_list: VIPTask[];
}

export interface VIPLogEntry {
    id: number;
    user_id: number;
    exp: number;
    after_exp: number;
    type: number;
    memo: string;
    create_time: number;
    brand_id: number;
    source: string;
    order_no?: string;
}

export interface VIPInfoRequest {
    token: string;
}

export interface VIPLogRequest {
    token: string;
    page?: number;
    page_size?: number;
}

export type VIPInfoResponse = APIResponse<VIPData>;
export type VIPLogResponse = APIResponse<VIPLogEntry[]>;