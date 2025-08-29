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
  phone: string;
  transaction_id: string;
  transaction_status: string;
  order_no: string;
  operator: string;
  type: number;
  create_time: number;
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
}

export interface DataRechargeRequest {
  token: string;
  name: string;
  phone: string;
  amount: number;
  service_id: number;
}

export interface RechargeLogsRequest {
  token: string;
  type: string;
  page: number;
  page_size: number;
}

export type SuppliersResponse = APIResponse<Supplier[]>;
export type DataBundlesResponse = APIResponse<DataBundle[]>;
export type AirtimeRechargeResponse = APIResponse<{}>;
export type DataRechargeResponse = APIResponse<{}>;

export type RechargeLogResponse = APIResponse<RechargeLogEntry[]>;