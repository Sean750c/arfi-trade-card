import type { APIResponse } from './api';

export interface WalletBalanceData {
    total_amount: number;
    usd_amount: string;
    frozen_amount: number;
    withdraw_amount: number;
    transfer_rebate: string;
    rebate_amount: number;
    usd_rebate_money: number;
    checkin_status: boolean;
    lottery_status: boolean;
    rank_status: boolean;
    default_wallet_type: string;
    dealing_cnt: number;
    currency_name: string;
    rate: string;
    point: number;
}

export interface WalletTransaction {
    currency_name: string;
    currency_symbol: string;
    log_id: number;
    memo: string;
    order_no: string;
    create_time: number;
    amount: number;
    balance_amount: number;
    order_amount: string;
    platform_fee: string;
    vip_rate: string;
    remark: string;
    name: string;
    type: 'order' | 'withdraw' | 'admin' | 'transfer' | 'dispute' | 'activity' | 'rank' | 'platform' | 'recommend' | 'vip';
    order_status: string;
    image: string;
    account_no: string;
    account_name: string;
    bank_name: string;
    bank_logo: string;
}

export interface WalletTransactionRequest {
    token: string;
    type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip';
    wallet_type: '1' | '2'; // 1: national currency, 2: USDT
    page: number;
    page_size: number;
}

export interface MoneyLogDetailRequest {
    token: string;
    log_id: number;
}

export interface MoneyLogDetail {
    log_id: number;
    amount: number;
    balance_amount: number;
    create_time: number;
    wallet_type: '1' | '2';
    serial_number: string;
    order_status: string;
    name: string;
    account_no: string;
    account_name: string;
    bank_name: string;
    bank_logo: string;
    remark: string;
    image: string;
    withdraw_no: string;
    withdraw_deal_time: number;
    withdraw_create_time: number;
}

export interface PaymentAccount {
    bank_id: number;
    is_def: number; // 1: default, 2: not default
    bank_logo: string;
    bank_logo_image: string;
    bank_name: string;
    account_no: string;
    account_name?: string;
    timeout_desc: string;
}

export interface PaymentMethod {
    payment_id: number;
    code: string;
    name: string;
    data_list: PaymentAccount[];
}

export interface FormField {
    code: string;
    name: string;
    desc: string;
    type: number;
    len: number;
    seq: number;
    disp_type: number;
    placeholder: string;
}

export interface AvailablePaymentMethod {
    payment_id: number;
    code: string;
    name: string;
    logo: string;
    background_color: string;
    logo_image: string;
    form_list: FormField[];
}

export interface Bank {
    bank_id: number;
    bank_name: string;
    bank_logo: string;
    bank_logo_image: string;
}

export interface CoinNetwork {
    coin_id: number;
    coin_name: string;
    coin_symbol: string;
    network_name: string;
    network_logo: string;
}

export interface UserPaymentListRequest {
    token: string;
    type: '1' | '2'; // 1: national currency, 2: USDT
}

export interface PaymentListRequest {
    token: string;
    type: '1' | '2'; // 1: national currency, 2: USDT
    country_id: number;
}

export interface BankListRequest {
    token: string;
    country_id: number;
}

export type WalletBalanceResponse = APIResponse<WalletBalanceData>;
export type WalletTransactionsResponse = APIResponse<WalletTransaction[]>;
export type PaymentMethodsResponse = APIResponse<PaymentMethod[]>;
export type AvailablePaymentMethodsResponse = APIResponse<AvailablePaymentMethod[]>;
export type BankListResponse = APIResponse<Bank[]>;
export type CoinListResponse = APIResponse<CoinNetwork[]>;
export type MoneyLogDetailResponse = APIResponse<MoneyLogDetail>;