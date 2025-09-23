import type { APIResponse } from './api';

// Recharge Types
export interface Supplier {
  name: string;
  mobileOperatorCode: string;
  min: number;
  max: number;
  discount: number;
  fee: number;
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
  uuid: string;
  name: string;
  discount: number;
  fee: number;
  min: number;
  max: number;
}

export interface MerchantServiceEntry {
  name: string;
  code: string;
  price: number;
}

export interface MerchantAccountEntry {
  code: number;
  name: string;
  details: string;
  message: string;
}

// Service Types Enum
export enum ServiceType {
  AIRTIME = 1,
  DATA = 2,
  CABLE_TV = 3,
  ELECTRICITY = 4,
  INTERNET = 5,
  LOTTERY = 6,
}

// Cable TV Types
export interface CableTVPackage extends MerchantServiceEntry {
  duration: string; // e.g., "1 Month", "3 Months"
  description?: string;
}

// Electricity Types
export interface ElectricityService extends MerchantServiceEntry {
  minimum_amount: number;
  maximum_amount: number;
  unit_type: string; // e.g., "kWh", "Units"
}

// Internet Service Types
export interface InternetService extends MerchantServiceEntry {
  speed: string; // e.g., "10 Mbps", "50 Mbps"
  data_limit?: string; // e.g., "Unlimited", "100GB"
  duration: string; // e.g., "1 Month"
}

// Lottery Types
export interface LotteryGame extends MerchantEntry {
  game_type: string; // e.g., "Lotto", "Scratch Card"
  draw_time?: string;
  jackpot_amount?: number;
}

// Account Verification Types
export interface AccountVerificationRequest {
  token: string;
  merchant_id: string;
  customer_no: string;
  product_code: string;
}

// Payment Request Types
export interface ServicePaymentRequest {
  token: string;
  merchant_id: string;
  merchant_name: string;
  customer_no: string;
  product_code: string;
  amount: number;
  password: string;
  service_type: ServiceType;
  additional_info?: Record<string, any>;
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
  type: number;
  password: string;
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

// Extended response types for new services
export type CableTVPackagesResponse = APIResponse<CableTVPackage[]>;
export type ElectricityServicesResponse = APIResponse<ElectricityService[]>;
export type InternetServicesResponse = APIResponse<InternetService[]>;
export type LotteryGamesResponse = APIResponse<LotteryGame[]>;
