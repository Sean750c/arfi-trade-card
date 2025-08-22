import { APIRequest } from '@/utils/api';
import type { 
  CheckinConfigResponse,
  CheckinResponse,
  CheckinConfig,
  CheckinConfigRequest,
  CheckinRequest,
} from '@/types';

export class CheckinService {
  static async getCheckinConfig(token: string, date: string): Promise<CheckinConfig> {
    try {
      const response = await APIRequest.request<CheckinConfigResponse>(
        '/gc/checkin/config',
        'POST',
        { token, date }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch checkin config');
      }

      //console.log(response.data);

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch checkin config: ${error.message}`);
      }
      throw new Error('Failed to fetch checkin config');
    }
  }

  static async performCheckin(token: string, ruleId: number): Promise<void> {
    try {
      const response = await APIRequest.request<CheckinResponse>(
        '/gc/checkin/checkin',
        'POST',
        { token, rule_id: ruleId }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to perform checkin');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to perform checkin: ${error.message}`);
      }
      throw new Error('Failed to perform checkin');
    }
  }
}