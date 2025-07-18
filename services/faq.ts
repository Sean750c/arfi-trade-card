import { APIRequest } from '@/utils/api';
import type { 
  FAQListResponse,
  FAQItem,
  FAQListRequest,
  APIResponse
} from '@/types';

export class FAQService {

  static async getFAQCategories(): Promise<string[]> {
    try {
      const response = await APIRequest.request<APIResponse<string[]>>(
        '/gc/faq/categories',
        'POST'
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch FAQ categories');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch FAQ categories: ${error.message}`);
      }
      throw new Error('Failed to fetch FAQ categories');
    }
  }

  static async getFAQList(params: FAQListRequest = {page: 1, page_size: 10}): Promise<FAQItem[]> {
    try {
      const response = await APIRequest.request<FAQListResponse>(
        '/gc/faq/list',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch FAQ list');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch FAQ list: ${error.message}`);
      }
      throw new Error('Failed to fetch FAQ list');
    }
  }
}