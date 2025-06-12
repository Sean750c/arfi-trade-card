import { APIRequest } from '@/utils/api';
import type { 
  WalletBalanceResponse, 
  WalletTransactionsResponse,
  WalletBalanceData,
  WalletTransactionsData,
  WalletTransactionRequest
} from '@/types/api';

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

  static async getWalletTransactions(params: WalletTransactionRequest): Promise<WalletTransactionsData> {
    try {
      const response = await APIRequest.request<WalletTransactionsResponse>(
        '/gc/wallet/moneyLogList',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch wallet transactions');
      }

      return response.data;
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
}