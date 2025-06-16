import { APIRequest } from '@/utils/api';
import type { 
  PaymentMethodsResponse,
  AvailablePaymentMethodsResponse,
  BankListResponse,
  CoinListResponse,
  PaymentMethod,
  AvailablePaymentMethod,
  Bank,
  CoinNetwork,
  PaymentListRequest,
  UserPaymentListRequest,
  BankListRequest
} from '@/types';

export class PaymentService {
  static async getPaymentMethods(params: UserPaymentListRequest): Promise<PaymentMethod[]> {
    try {
      const response = await APIRequest.request<PaymentMethodsResponse>(
        '/gc/payment/list',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch payment methods');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch payment methods: ${error.message}`);
      }
      throw new Error('Failed to fetch payment methods');
    }
  }

  static async getAvailablePaymentMethods(params: PaymentListRequest): Promise<AvailablePaymentMethod[]> {
    try {
      const response = await APIRequest.request<AvailablePaymentMethodsResponse>(
        '/gc/payment/paymentList',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch available payment methods');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch available payment methods: ${error.message}`);
      }
      throw new Error('Failed to fetch available payment methods');
    }
  }

  static async getBankList(params: BankListRequest): Promise<Bank[]> {
    try {
      const response = await APIRequest.request<BankListResponse>(
        '/gc/payment/bankList',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch bank list');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch bank list: ${error.message}`);
      }
      throw new Error('Failed to fetch bank list');
    }
  }

  static async getCoinList(token: string): Promise<CoinNetwork[]> {
    try {
      const response = await APIRequest.request<CoinListResponse>(
        '/gc/payment/coinList',
        'POST',
        { token }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch coin list');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch coin list: ${error.message}`);
      }
      throw new Error('Failed to fetch coin list');
    }
  }
}