import { APIRequest } from '@/utils/api';
import type { NoticeListRequest, NoticeListResponse } from '@/types/api';

export class NotificationService {
  static async getNotifications(params: NoticeListRequest) {
    try {
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
      if (error instanceof Error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }
      throw new Error('Failed to fetch notifications');
    }
  }

  static async markAsRead(noticeId: number, token: string) {
    try {
      const response = await APIRequest.request(
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
      if (error instanceof Error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }
      throw new Error('Failed to mark notification as read');
    }
  }
}