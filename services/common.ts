import { APIRequest } from '@/utils/api';
import type { LeadData, LeadResponse, PopData, PopResponse } from '@/types/common';
import { getDeviceInfo } from '@/utils/device';
import { EmptyReponse } from '@/types';

export class CommonService {
  static async getLead(type: string): Promise<LeadData> {
    try {
      const response = await APIRequest.request<LeadResponse>(
        '/gc/public/lead',
        'POST',
        { type }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async analysis(name: string, value: string): Promise<EmptyReponse> {
    try {
      const deviceInfo = await getDeviceInfo();
      const response = await APIRequest.request<EmptyReponse>(
        '/gc/public/analysis',
        'POST',
        {
          name,
          value,
          ...deviceInfo,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async popConfig(name: string, value: string): Promise<PopData> {
    try {
      const deviceInfo = await getDeviceInfo();
      const response = await APIRequest.request<PopResponse>(
        '/gc/public/popConfig',
        'POST',
        {
          name,
          value,
          ...deviceInfo,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
} 