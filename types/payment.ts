import type { APIResponse } from './api';

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

// Set Default Payment Method Request
export interface SetDefaultPaymentRequest {
    token: string;
    bank_id: number;
}

// Response types
export type PaymentMethodsResponse = APIResponse<PaymentMethod[]>;
export type AvailablePaymentMethodsResponse = APIResponse<AvailablePaymentMethod[]>;
export type BankListResponse = APIResponse<Bank[]>;
export type CoinListResponse = APIResponse<CoinNetwork[]>;
export type SetDefaultPaymentResponse = APIResponse<null>; 