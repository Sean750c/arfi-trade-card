import { APIRequest } from '@/utils/api';
import type { LeadData, LeadResponse } from '@/types/common';

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
} 