import { APIRequest } from '@/utils/api';
import type { 
  FinderRequest,
  FinderResponse,
  FinderData,
} from '@/types/finder';

export class FinderService {
  static async getFinder(params: FinderRequest): Promise<FinderData> {
    try {
      const response = await APIRequest.request<FinderResponse>(
        '/gc/finder/showFinder',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch finder data');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch finder data: ${error.message}`);
      }
      throw new Error('Failed to fetch finder data');
    }
  }
}