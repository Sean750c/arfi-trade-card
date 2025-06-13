import { APIRequest } from '@/utils/api';
import type { 
  OrderListResponse,
  OrderDetailResponse,
  OrderListRequest,
  OrderListItem,
  OrderDetailRequest,
  OrderDetail
} from '@/types/api';

export class OrderService {
  static async getOrderList(params: OrderListRequest): Promise<OrderListItem[]> {
    try {
      const response = await APIRequest.request<OrderListResponse>(
        '/gc/ord/list',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch order list');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order list: ${error.message}`);
      }
      throw new Error('Failed to fetch order list');
    }
  }

  static async getOrderDetail(params: OrderDetailRequest): Promise<OrderDetail> {
    try {
      const response = await APIRequest.request<OrderDetailResponse>(
        '/gc/ord/detail',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch order details');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order details: ${error.message}`);
      }
      throw new Error('Failed to fetch order details');
    }
  }
}