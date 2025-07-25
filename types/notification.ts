import type { APIResponse } from './api';

// FCM Token Types
export interface FCMTokenRequest {
  token?: string;
  push_device_token: string;
  device_type: string;
  device_no: string;
  os_type: 'ios' | 'android' | 'web';
}

export interface FCMTokenResponse extends APIResponse<{}> {}

// Notification Types
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  categoryId?: string;
  trigger?: {
    type: 'push';
    remoteMessage: any;
  };
}

export interface NotificationSettings {
  allowsAlert: boolean;
  allowsBadge: boolean;
  allowsSound: boolean;
  allowsAnnouncements: boolean;
  allowsCriticalAlerts: boolean;
  allowsDisplayInCarPlay: boolean;
  allowsDisplayInNotificationCenter: boolean;
  allowsDisplayOnLockScreen: boolean;
  allowsPreviews: boolean;
  providesAppNotificationSettings: boolean;
}

export interface NotificationPermissionStatus {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
  granted: boolean;
  settings: NotificationSettings;
}

// Notification Action Types
export type NotificationActionType = 
  | 'order_update'
  | 'payment_received'
  | 'vip_upgrade'
  | 'system_announcement'
  | 'security_alert'
  | 'promotion'
  | 'general';

export interface NotificationAction {
  type: NotificationActionType;
  data: Record<string, any>;
}