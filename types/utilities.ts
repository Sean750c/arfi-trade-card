import type { APIResponse } from './api';

// Recharge Types
export interface Supplier {
  name: string;
  mobileOperatorCode: string;
}

export interface DataBundle {
  validityPeriod: string | null;
  mobileOperatorId: number;
  servicePrice: number;
  dataValue: string | null;
  serviceName: string;
  serviceId: number;
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

export type SuppliersResponse = APIResponse<Supplier[]>;
export type DataBundlesResponse = APIResponse<DataBundle[]>;
export type AirtimeRechargeResponse = APIResponse<{}>;
export type DataRechargeResponse = APIResponse<{}>;