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
  BankListRequest,
  SetDefaultPaymentRequest,
  SetDefaultPaymentResponse,
  AddPaymentMethodRequest,
  AddPaymentData,
  AddPaymentMethodResponse,
  VerifyBankAccountRequest,
  VerifyBankAccountResponse,
  DeletePaymentMethodRequest,
  DeletePaymentMethodResponse
} from '@/types/payment';

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

  /**
   * 设置默认提现方式
   * @param params 设置默认提现方式参数
   * @returns 设置结果
   */
  static async setDefaultPayment(params: SetDefaultPaymentRequest): Promise<void> {
    try {
      const response = await APIRequest.request<SetDefaultPaymentResponse>(
        '/gc/payment/setDef',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to set default payment method');
      }

      // 由于返回data为null，这里不需要返回任何数据
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to set default payment method: ${error.message}`);
      }
      throw new Error('Failed to set default payment method');
    }
  }

  /**
   * 添加支付方式
   * @param params { token, payment_id, bank_id, account_no, account_name }
   * @returns { bank_id, is_def }
   */
  static async addPaymentMethod(params: AddPaymentMethodRequest): Promise<AddPaymentData> {
    try {
      const response = await APIRequest.request<AddPaymentMethodResponse>(
        '/gc/payment/add',
        'POST',
        params
      );
      if (!response.success) {
        throw new Error(response.msg || 'Failed to add payment method');
      }
      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      if (error instanceof Error) {
        throw new Error(`Failed to add payment method: ${error.message}`);
      }
      throw new Error('Failed to add payment method');
    }
  }

  /**
   * 验证银行账户
   * @param params { token, bank_id, bank_account }
   * @returns { user_name }
   */
  static async verifyBankAccount(params: VerifyBankAccountRequest): Promise<{ user_name: string }> {
    try {
      const response = await APIRequest.request<VerifyBankAccountResponse>(
        '/gc/payment/verify',
        'POST',
        params
      );
      if (!response.success) {
        throw new Error(response.msg || 'Failed to verify bank account');
      }
      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      if (error instanceof Error) {
        throw new Error(`Failed to verify bank account: ${error.message}`);
      }
      throw new Error('Failed to verify bank account');
    }
  }

  /**
   * 删除支付方式
   * @param params { token, bank_id }
   */
  static async deletePaymentMethod(params: DeletePaymentMethodRequest): Promise<boolean> {
    try {
      const response = await APIRequest.request<DeletePaymentMethodResponse>(
        '/gc/payment/delete',
        'POST',
        params
      );
      if (!response.success) {
        throw new Error(response.msg || 'Failed to delete payment method');
      }
      return true;
      // 返回data为null，无需处理
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      if (error instanceof Error) {
        throw new Error(`Failed to delete payment method: ${error.message}`);
      }
      throw new Error('Failed to delete payment method');
    }
  }
}