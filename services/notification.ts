import { APIRequest } from '@/utils/api';
import type { NoticeListRequest, NoticeListResponse, NoticeListData } from '@/types';

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
}