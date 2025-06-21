import type { APIResponse } from './api';

// Overdue Data
export interface OverdueDataItem {
  name: string;
  value: string;
  start: number;
}

// Bank Info
export interface BankInfo {
  bank_id: number;
  bank_account: string;
  bank_name: string;
  bank_logo: string;
  bank_logo_image: string;
}

// Withdraw Information
export interface WithdrawInformation {
  cashable_amount: number;
  cashable_usd_amount: number;
  overdue_data: OverdueDataItem[];
  overdue_max_percent: string;
  timeout_desc: string;
  overdue_time: string;
  bank: BankInfo;
  wallet_type: string;
  minimum_amount: number;
  minimum_amount_usd: number;
  currency_name: string;
  usdt_fee: string;
}

export interface WithdrawInformationRequest {
    token: string;
    wallet_type: '1' | '2'; // 1: national currency, 2: USDT
}

// WithdrawInformationResponse
export type WithdrawInformationResponse = APIResponse<WithdrawInformation>;

// Withdraw Apply Request
export interface WithdrawApplyRequest {
  token: string;
  bank_id: number;
  amount: string;
  password: string;
  channel_type: string;
}

// Withdraw Apply Data
export interface WithdrawApplyData {
  wallet_type: number;
  withdraw_amount: string;
  total_amount: number;
  payment: string;
  bank_name: string;
  withdraw_no: string;
  is_firstwithdraw: boolean;
  whatsapp_bind: boolean;
  log_id: number;
}

// WithdrawApplyResponse
export type WithdrawApplyResponse = APIResponse<WithdrawApplyData>;
