import type { APIResponse } from './api';

// Activity Types
export interface Activity {
  id: number;
  active_title: string;
  active_memo: string;
  active_url: string;
  active_start_time: string;
  active_end_time: string;
  active_image: string;
}

export interface FinderData {
  active: Activity[];
}

export interface FinderRequest {
  token?: string;
  country_id: number;
}

export type FinderResponse = APIResponse<FinderData>;

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