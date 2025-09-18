import { APIRequest } from '@/utils/api';
import type {
  SuppliersResponse,
  DataBundlesRequest,
  DataBundlesResponse,
  AirtimeRechargeRequest,
  AirtimeRechargeResponse,
  DataRechargeRequest,
  DataRechargeResponse,
  Supplier,
  DataBundle,
  RechargeLogsRequest,
  RechargeLogResponse,
  RechargeLogEntry,
  MerchantListResponse,
  MerchantEntry,
  MerchantServiceResponse,
  MerchantServiceEntry,
  MerchantAccountEntry,
  MerchantAccountResponse,
  MerchantPaymentResponse,
  MerchantPaymentRequest,
} from '@/types/utilities';

export class UtilitiesService {

  static async getSuppliers(token: string): Promise<Supplier[]> {
    try {
      const response = await APIRequest.request<SuppliersResponse>(
        '/gc/recharge/getSuppliers',
        'POST',
        { token }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch suppliers');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Failed to fetch suppliers: ${error.message}`);
      }
      throw new Error('Failed to fetch suppliers');
    }
  }

  static async getDataBundles(params: DataBundlesRequest): Promise<DataBundle[]> {
    try {
      const response = await APIRequest.request<DataBundlesResponse>(
        '/gc/recharge/dataBundles',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch data bundles');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Failed to fetch data bundles: ${error.message}`);
      }
      throw new Error('Failed to fetch data bundles');
    }
  }

  static async airtimeRecharge(params: AirtimeRechargeRequest): Promise<void> {
    try {
      const response = await APIRequest.request<AirtimeRechargeResponse>(
        '/gc/recharge/airtimeRecharge',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to recharge airtime');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Failed to recharge airtime: ${error.message}`);
      }
      throw new Error('Failed to recharge airtime');
    }
  }

  static async dataRecharge(params: DataRechargeRequest): Promise<void> {
    try {
      const response = await APIRequest.request<DataRechargeResponse>(
        '/gc/recharge/dataRecharge',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to recharge data');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Failed to recharge data: ${error.message}`);
      }
      throw new Error('Failed to recharge data');
    }
  }

  static async getRechargeLogs(params: RechargeLogsRequest): Promise<RechargeLogEntry[]> {
    try {
      const response = await APIRequest.request<RechargeLogResponse>(
        '/gc/recharge/logList',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch recharge logs');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }

      if (error instanceof Error) {
        throw new Error(`Failed to fetch recharge logs: ${error.message}`);
      }
      throw new Error('Failed to fetch recharge logs');
    }
  }

  static async getMerchants(token: string, type: number): Promise<MerchantEntry[]> {
    try {
      const response = await APIRequest.request<MerchantListResponse>(
        '/gc/recharge/getMerchants',
        'POST',
        { token, type }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch merchant list');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }

      if (error instanceof Error) {
        throw new Error(`Failed to fetch merchant list: ${error.message}`);
      }
      throw new Error('Failed to fetch merchant list');
    }
  }

  static async getMerchantServices(token: string, merchant_id: string): Promise<MerchantServiceEntry[]> {
    try {
      const response = await APIRequest.request<MerchantServiceResponse>(
        '/gc/recharge/getMerchantServices',
        'POST',
        { token, merchant_id }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch merchant services');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }

      if (error instanceof Error) {
        throw new Error(`Failed to fetch merchant services: ${error.message}`);
      }
      throw new Error('Failed to fetch merchant services');
    }
  }

  static async getMerchantAccountDetails(token: string, merchant_id: string, customer_no: string, product_code: string): Promise<MerchantAccountEntry> {
    try {
      const response = await APIRequest.request<MerchantAccountResponse>(
        '/gc/recharge/getMerchantAccountDetails',
        'POST',
        { token, merchant_id, customer_no, product_code }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch merchant account details');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }

      if (error instanceof Error) {
        throw new Error(`Failed to fetch merchant account details: ${error.message}`);
      }
      throw new Error('Failed to fetch merchant account details');
    }
  }

  static async merchantPayment(params: MerchantPaymentRequest): Promise<void> {
    try {
      const response = await APIRequest.request<MerchantPaymentResponse>(
        '/gc/recharge/merchantPayment',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch merchant account details');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }

      if (error instanceof Error) {
        throw new Error(`Failed to fetch merchant account details: ${error.message}`);
      }
      throw new Error('Failed to fetch merchant account details');
    }
  }
  
}