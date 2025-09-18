import type { APIResponse } from './api';

// Recharge Types
export interface Supplier {
  name: string;
  mobileOperatorCode: string;
}

export interface DataBundle {
  mobileOperatorId: number;
  servicePrice: number;
  serviceName: string;
  serviceId: number;
}

export interface RechargeLogEntry {
  log_id: number;
  amount: number;
  discount_amount: number;
  fee: number;
  account_no: string;
  transaction_id: string;
  transaction_status: string;
  reference_no: string;
  merchant_name: string;
  desc: string;
  type: number;
  create_time: number;
}

export interface MerchantEntry {
  id: number;
  name: string;
  uuid: string;
  discount: number;
  fee: number;
}

export interface MerchantServiceEntry {
  name: string;
  code: string;
  price: number;
}

export interface MerchantAccountEntry {
  name: string;
  details: string;
}

export interface SuppliersRequest {
  token: string;
}

export interface DataBundlesRequest {
  token: string;
  supply_code: string;
}

export interface AirtimeRechargeRequest {
  token: string;
  name: string;
  phone: string;
  amount: number;
  password: string;
}

export interface DataRechargeRequest {
  token: string;
  name: string;
  phone: string;
  amount: number;
  service_id: number;
  service_name: string;
  password: string;
}

export interface RechargeLogsRequest {
  token: string;
  type: string;
  page: number;
  page_size: number;
}

export interface MerchantPaymentRequest {
  token: string;
  merchant_id: string;
  merchant_name: string;
  customer_no: string;
  product_code: string;
  amount: number;
}

export type SuppliersResponse = APIResponse<Supplier[]>;
export type DataBundlesResponse = APIResponse<DataBundle[]>;
export type AirtimeRechargeResponse = APIResponse<{}>;
export type DataRechargeResponse = APIResponse<{}>;

export type RechargeLogResponse = APIResponse<RechargeLogEntry[]>;

export type MerchantListResponse = APIResponse<MerchantEntry[]>;
export type MerchantServiceResponse = APIResponse<MerchantServiceEntry[]>;
export type MerchantAccountResponse = APIResponse<MerchantAccountEntry>;
export type MerchantPaymentResponse = APIResponse<{}>;
