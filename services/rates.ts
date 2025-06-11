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
    card_category?: number;
    currency?: string;
  }): Promise<RatesData> {
    try {
      const response = await APIRequest.request<RatesDataResponse>(
        '/gc/v2/card/datalog',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch rates data');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch rates data: ${error.message}`);
      }
      throw new Error('Failed to fetch rates data');
    }
  }
}