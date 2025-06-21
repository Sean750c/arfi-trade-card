import { APIRequest } from '@/utils/api';
import type { 
  WithdrawInformationRequest,
  WithdrawInformationResponse,
  WithdrawInformation,
  WithdrawApplyRequest,
  WithdrawApplyResponse,
  WithdrawApplyData
} from '@/types/withdraw';

export class WithdrawService {

  static async getWithdrawInformation(params: WithdrawInformationRequest): Promise<WithdrawInformation> {
    try {
      // console.log('params', params);
      const response = await APIRequest.request<WithdrawInformationResponse>(
        '/gc/withdraw/information',
        'POST',
        { ...params }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch withdraw information');
      }

      return response.data;
    } catch (error) {
      // 处理token过期错误
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // 重新抛出token过期错误
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch withdraw information: ${error.message}`);
      }
      throw new Error('Failed to fetch withdraw information');
    }
  }

  /**
   * 申请提现
   * @param params 提现申请参数
   * @returns 提现申请结果
   */
  static async applyWithdraw(params: WithdrawApplyRequest): Promise<WithdrawApplyData> {
    try {
      const response = await APIRequest.request<WithdrawApplyResponse>(
        '/gc/withdraw/apply',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to apply withdraw');
      }

      return response.data;
    } catch (error) {
      // 处理token过期错误
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // 重新抛出token过期错误
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to apply withdraw: ${error.message}`);
      }
      throw new Error('Failed to apply withdraw');
    }
  }

}
