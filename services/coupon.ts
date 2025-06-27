import { APIRequest } from '@/utils/api';
import type { 
  CouponListResponse,
  Coupon,
  CouponListRequest,
  APIResponse
} from '@/types';

export class CouponService {

  static async getAvailableCoupons(params: CouponListRequest): Promise<Coupon[]> {
    try {
      const response = await APIRequest.request<CouponListResponse>(
        '/gc/order/getAvailableCoupon',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch available coupons');
      }

      return response.data || [];
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch available coupons: ${error.message}`);
      }
      throw new Error('Failed to fetch available coupons');
    }
  }
} 