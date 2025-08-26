import { APIRequest } from '@/utils/api';
import type { 
  LotteryActivityResponse,
  LotteryDrawResponse,
  LotteryLogsResponse,
  LotteryActivity,
  LotteryDrawResult,
  LotteryLogEntry,
  LotteryLogsRequest
} from '@/types';

export class LotteryService {
  static async getLotteryActivity(token: string): Promise<LotteryActivity> {
    try {
      const response = await APIRequest.request<LotteryActivityResponse>(
        '/gc/Lottery/activity',
        'POST',
        { token }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch lottery activity');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch lottery activity: ${error.message}`);
      }
      throw new Error('Failed to fetch lottery activity');
    }
  }

  static async drawLottery(token: string, activityId: number): Promise<LotteryDrawResult> {
    try {
      const response = await APIRequest.request<LotteryDrawResponse>(
        '/gc/lottery/draw',
        'POST',
        { token, activity_id: activityId }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to draw lottery');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to draw lottery: ${error.message}`);
      }
      throw new Error('Failed to draw lottery');
    }
  }

  static async getLotteryLogs(params: LotteryLogsRequest): Promise<LotteryLogEntry[]> {
    try {
      const response = await APIRequest.request<LotteryLogsResponse>(
        '/gc/lottery/log',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch lottery logs');
      }

      // console.log(response);

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch lottery logs: ${error.message}`);
      }
      throw new Error('Failed to fetch lottery logs');
    }
  }
}