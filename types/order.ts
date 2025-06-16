import type { APIResponse } from './api';

export interface OrderImage {
    url: string;
    refused_reason: string;
    type: number;
}

export interface OrderDetail {
    coupon_code: string;
    coupon_amount: string;
    order_no: string;
    user_memo: string;
    amount: string;
    status: number;
    wallet_type: number;
    currency: string;
    status_desc: string;
    create_time: number;
    finish_time: number;
    first_order_bonus: number;
    reach_amount_bonus: number;
    full_amount_bonus: number;
    vip_bonus: number;
    keyList: any[];
    imageList: OrderImage[];
    order_activity_result: any[];
}

export interface OrderDetailRequest {
    token: string;
    order_no: string;
}

export interface OrderListItem {
    order_no: string;
    amount: number;
    status: number;
    wallet_type: number;
    currency: string;
    order_rebate: number;
    refused_reason: string;
    images: string;
    card_name: string;
    is_multi: number;
    status_desc: string; // Succeed/Refused/Pending
    show_time: number;
    all_money: string;
}

export interface OrderListRequest {
    token: string;
    status: 'all' | 'inprocess' | 'done';
    start_time?: number;
    end_time?: number;
    page: number;
    page_size: number;
}

export type OrderListResponse = APIResponse<OrderListItem[]>;
export type OrderDetailResponse = APIResponse<OrderDetail>;