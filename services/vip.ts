import { APIRequest } from '@/utils/api';
import type { 
  VIPInfoResponse,
  VIPLogResponse,
  VIPData,
  VIPLogEntry,
  VIPInfoRequest,
  VIPLogRequest,
} from '@/types';

export class VIPService {
  static async getVIPInfo(token: string): Promise<VIPData> {
    try {
      const response = await APIRequest.request<VIPInfoResponse>(
        '/gc/vip/info',
        'POST',
        { token }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch VIP info');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch VIP info: ${error.message}`);
      }
      throw new Error('Failed to fetch VIP info');
    }
  }

  static async getVIPDefault(): Promise<any> {
    try {
      const response = await APIRequest.request<any>(
        '/gc/vip/default',
        'POST'
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch VIP default info');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch VIP default info: ${error.message}`);
      }
      throw new Error('Failed to fetch VIP default info');
    }
  }

  static async getVIPLogs(params: VIPLogRequest): Promise<VIPLogEntry[]> {
    try {
      const response = await APIRequest.request<VIPLogResponse>(
        '/gc/vip/loglist',
        'POST',
        {
          ...params,
          page: params.page || 0,
          page_size: params.page_size || 20,
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch VIP logs');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch VIP logs: ${error.message}`);
      }
      throw new Error('Failed to fetch VIP logs');
    }
  }
}