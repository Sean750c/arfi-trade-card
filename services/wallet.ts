import { APIRequest } from '@/utils/api';
import type { 
  WalletBalanceResponse, 
  WalletTransactionsResponse,
  WalletBalanceData,
  WalletTransactionRequest,
  MoneyLogDetailRequest,
  MoneyLogDetailResponse,
  MoneyLogDetail
} from '@/types';

export class WalletService {
  static async getWalletBalance(token: string): Promise<WalletBalanceData> {
    try {
      const response = await APIRequest.request<WalletBalanceResponse>(
        '/gc/wallet/balance',
        'POST',
        { token }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch wallet balance');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch wallet balance: ${error.message}`);
      }
      throw new Error('Failed to fetch wallet balance');
    }
  }

  static async getWalletTransactions(params: WalletTransactionRequest): Promise<WalletTransactionsResponse> {
    try {
      const response = await APIRequest.request<WalletTransactionsResponse>(
        '/gc/wallet/moneyLogList',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch wallet transactions');
      }

      return response;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch wallet transactions: ${error.message}`);
      }
      throw new Error('Failed to fetch wallet transactions');
    }
  }

  static async moneyLogDetail(params: MoneyLogDetailRequest): Promise<MoneyLogDetail> {
    try {
      const response = await APIRequest.request<MoneyLogDetailResponse>(
        '/gc/wallet/moneyLogDetail',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch money log detail');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch money log detail: ${error.message}`);
      }
      throw new Error('Failed to fetch money log detail');
    }
  }
}