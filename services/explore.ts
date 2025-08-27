import { APIRequest } from '@/utils/api';
import type { 
  FinderRequest,
  FinderResponse,
  FinderData,
  SuppliersRequest,
  SuppliersResponse,
  DataBundlesRequest,
  DataBundlesResponse,
  AirtimeRechargeRequest,
  AirtimeRechargeResponse,
  DataRechargeRequest,
  DataRechargeResponse,
  Supplier,
  DataBundle
} from '@/types/explore';

export class ExploreService {
  static async getFinder(params: FinderRequest): Promise<FinderData> {
    try {
      const response = await APIRequest.request<FinderResponse>(
        '/gc/finder/showFinder',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch finder data');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch finder data: ${error.message}`);
      }
      throw new Error('Failed to fetch finder data');
    }
  }

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
}