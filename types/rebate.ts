import type { APIResponse } from './api';

export interface RebateAmountOrderBonus {
    bonus_amount: number;
    order_amount: number;
}

export interface RebateVipInfo {
    level: number;
    rate: number;
}

export interface RebateItem {
    log_id: number;
    create_time: string;
    activity_code: string;
    after_balance: string;
    money: number;
    type: number;
    wallet_type: '1' | '2';
    from_get: string;
    name: string;
    vip_rate: string;
    purchase_amount: string;
}

export interface RebateData {
    transfer_rebate: string;
    currency_symbol: string;
    transfer_rebate_usd: string;
    short_name: string;
    rebate_amount: number;
    rebate_amount_usd: number;
    currency_symbol_usd: string;
    rebate_total_amount_usd: number;
    rebate_total_amount: number;
    first_order_bonus: number;
    referred_bonus: number;
    amount_order_bonus: RebateAmountOrderBonus[];
    vip_info: RebateVipInfo[];
    user_rebate_list: RebateItem[];
    user_invited_number: string;
}

export interface InviteInfo {
    invite_code: string;
    register_amount: number;
    first_amount: number;
    friend_amount: number;
    self_amount: number;
    recommend_enough_amount: number;
    rebate_money_config: string[];
    invite_friends: number;
    success_order_user: number;
    referred_total_bonus: number;
    recommend_amount: number;
    act_url: string;
    can_receive_money: number;
}

export interface TopListItem {
    user_id: number;
    username: string;
    NAME: string;
    currency_name: string;
    currency_symbol: string;
    CODE: string;
    total_amount: number;
    cnt: number;
    rank: number;
}

export interface SelfInviteInfo {
    code: string;
    cnt: number;
    amount: number;
    top: number;
    username: string;
    currency_name: string;
    currency_symbol: string;
}

export interface InviteRankInfo {
    act_url: string;
    first_amount: number;
    self_amount: number;
    register_amount: number;
    friend_amount: number;
    invite_friends: number;
    success_order_user: number;
    top_list: TopListItem[];
    my_top: SelfInviteInfo;
    notify: string[];
}

export interface InviteDetailItem {
    user_id: number;
    username: string;
    avatar: string;
    register_date: string;
    currency_name: string;
    currency_symbol: string;
    amount: number;
    status: 0 | 1 | 2; //0 已邀请待交易 1 未领取 2 已领取
}

export interface RebateListRequest {
    token: string;
    type: number; // 1:首单, 2:recommand, 3:register, 4:transfer, 5:amount, 6:vip, 11:checkin, 12:lottery, 13:mall
    wallet_type: '1' | '2'; // 1: national currency, 2: USDT
    page: number;
    page_size: number;
}

export interface InviteInfoRequest {
    token: string;
}

export interface InviteRankRequest {
    token: string;
}

export interface InviteDetailRequest {
    token: string;
    page: number;
    page_size: number;
}

export interface ReceiveInviteRebateRequest {
    token: string;
    recommend_user_id: number;
}

export type RebateListResponse = APIResponse<RebateData>;
export type InviteInfoResponse = APIResponse<InviteInfo>;
export type InviteRankResponse = APIResponse<InviteRankInfo>;
export type InviteDetailResponse = APIResponse<InviteDetailItem[]>;