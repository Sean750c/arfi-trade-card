import { APIRequest } from '@/utils/api';
import type { CalculatorRequest, CalculatorResponse, CalculatorData } from '@/types/api';

export class CalculatorService {
  static async getCalculatorData(params: CalculatorRequest): Promise<CalculatorData> {
    try {
      const response = await APIRequest.request<CalculatorResponse>(
        '/gc/card/calculator',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch calculator data');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch calculator data: ${error.message}`);
      }
      throw new Error('Failed to fetch calculator data');
    }
  }
}