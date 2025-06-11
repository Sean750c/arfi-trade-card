import { APIRequest } from '@/utils/api';
import type { 
  CardCategoryListResponse, 
  CurrencyListResponse, 
  RatesDataResponse,
  CardCategory,
  Currency,
  RatesData
} from '@/types/api';

export class RatesService {
  static async getCardCategories(): Promise<CardCategory[]> {
    try {
      const response = await APIRequest.request<CardCategoryListResponse>(
        '/gc/card/category',
        'POST'
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch card categories');
      }
      
      return response.data;
    } catch (error) {
      console.error('Card Categories Error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch card categories: ${error.message}`);
      }
      throw new Error('Failed to fetch card categories');
    }
  }

  static async getCurrencies(): Promise<Currency[]> {
    try {
      const response = await APIRequest.request<CurrencyListResponse>(
        '/gc/card/currencyList',
        'POST'
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch currencies');
      }
      
      return response.data;
    } catch (error) {
      console.error('Currencies Error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch currencies: ${error.message}`);
      }
      throw new Error('Failed to fetch currencies');
    }
  }

  static async getRatesData(params: {
    country_id: number;
    page: number;
    page_size: number;
    card_catgory?: number; // Note: API uses 'card_catgory' (typo in API)
    currency?: string;
  }): Promise<RatesData> {
    try {
      console.log('Making rates API call with params:', params);
      
      const response = await APIRequest.request<RatesDataResponse>(
        '/gc/v2/card/catalog', // Correct endpoint as specified
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch rates data');
      }
      
      return response.data;
    } catch (error) {
      console.error('Rates Data Error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch rates data: ${error.message}`);
      }
      throw new Error('Failed to fetch rates data');
    }
  }
}