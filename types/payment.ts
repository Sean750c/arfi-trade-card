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
    bank_id: number;
    name: string;
    desc: string;
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

// Add Payment Method
export interface AddPaymentMethodRequest {
    token: string;
    payment_id: number;
    bank_id: number;
    account_no: string;
    account_name: string;
}

export interface AddPaymentData {
    bank_id: number;
    is_def: 1 | 2;
}

export type AddPaymentMethodResponse = APIResponse<AddPaymentData>;

// Response types
export type PaymentMethodsResponse = APIResponse<PaymentMethod[]>;
export type AvailablePaymentMethodsResponse = APIResponse<AvailablePaymentMethod[]>;
export type BankListResponse = APIResponse<Bank[]>;
export type CoinListResponse = APIResponse<CoinNetwork[]>;
export type SetDefaultPaymentResponse = APIResponse<null>;

// Verify Bank Account
export interface VerifyBankAccountRequest {
    token: string;
    bank_id: number;
    bank_account: string;
}

export interface VerifyBankAccountData {
    user_name: string;
}

export type VerifyBankAccountResponse = APIResponse<VerifyBankAccountData>;

// Delete Payment Method
export interface DeletePaymentMethodRequest {
    token: string;
    bank_id: number;
}

export type DeletePaymentMethodResponse = APIResponse<null>; 