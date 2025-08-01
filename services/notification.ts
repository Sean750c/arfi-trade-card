import { APIRequest } from '@/utils/api';
import NavigationUtils from '@/utils/navigation';
import type { 
  NoticeListRequest, 
  NoticeListResponse, 
  NoticeListData,
  FCMTokenRequest,
  FCMTokenResponse
} from '@/types';

export class NotificationService {
  static async getNotifications(params: NoticeListRequest): Promise<NoticeListData> {
    try {
      //console.log('Fetching notifications with params:', params);
      const response = await APIRequest.request<NoticeListResponse>(
        '/gc/finder/allNotice',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to fetch notifications');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }
      throw new Error('Failed to fetch notifications');
    }
  }

  static async markAsRead(noticeId: number, token: string): Promise<NoticeListData> {
    try {
      const response = await APIRequest.request<NoticeListResponse>(
        '/gc/finder/readNotice',
        'POST',
        {
          token,
          notice_id: noticeId,
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to mark notification as read');
      }

      return response.data;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }
      throw new Error('Failed to mark notification as read');
    }
  }

  static async registerFCMToken(params: FCMTokenRequest): Promise<void> {
    try {
      const response = await APIRequest.request<FCMTokenResponse>(
        '/gc/user/registerDeviceToken',
        'POST',
        params
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to register FCM token');
      }
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error; // Re-throw token expiration errors
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to register FCM token: ${error.message}`);
      }
      throw new Error('Failed to register FCM token');
    }
  }

  /**
   * 处理通知点击跳转
   * @param notice 通知对象
   */
  static handleNotificationClick(notice: any) {
    try {
      const { notice_action, notice_params, notice_order } = notice;
      
      // 如果有订单信息，优先处理订单跳转
      if (notice_order?.order_id) {
        NavigationUtils.navigateToOrderByStatus(
          notice_order.order_id, 
          notice_order.status
        );
        return true;
      }
      
      // 处理通用的通知跳转
      if (notice_action) {
        return NavigationUtils.handleNotificationNavigation(
          notice_action, 
          notice_params
        );
      }
      
      return false;
    } catch (error) {
      console.error('Notification click handling error:', error);
      return false;
    }
  }
}