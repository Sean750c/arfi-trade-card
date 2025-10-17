import { useEffect, useRef, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { NotificationService } from '@/services/notification';
import NavigationUtils from '@/utils/navigation';
import { generateDeviceId, getDeviceType } from '@/utils/device';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationData {
  action?: string;
  // 你自定义的字段可以继续补充，比如：
  params?: string;
  inapp_notice?: string;
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Check for devices without Google Play Services
  const isDeviceWithoutGMS = Platform.OS === 'android' && (
    Device.brand?.toLowerCase() === 'huawei' ||
    Device.brand?.toLowerCase() === 'honor' ||
    Device.manufacturer?.toLowerCase() === 'huawei' ||
    Device.manufacturer?.toLowerCase() === 'honor'
  );

  // Register for push notifications
  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token = null;

    // Early return for devices without Google Play Services
    if (isDeviceWithoutGMS) {
      console.log('⚠️ Notifications Debug - Device without Google Play Services detected, skipping push notifications');
      return null;
    }

    // Early return for web platform
    if (Platform.OS === 'web') {
      return null;
    }

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#008751',
        });
      } catch (error) {
        console.log('⚠️ Notifications Debug - Failed to create Android notification channel (Google Play Services may not be available):', error);
        return null;
      }
    }

    if (Device.isDevice) {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          try {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          } catch (permError) {
            console.log('⚠️ Notifications Debug - Failed to request permissions (Google Play Services may not be available):', permError);
            return null;
          }
        }

        if (finalStatus !== 'granted') {
          console.log('⚠️ Notifications Debug - Notification permissions not granted');
          return null;
        }

        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

          if (!projectId) {
            throw new Error('Project ID not found');
          }

          token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (error) {
          console.log('⚠️ Notifications Debug - Error getting push token (Google Play Services may not be available):', error);
          return null;
        }
      } catch (error) {
        console.log('⚠️ Notifications Debug - Failed to initialize notifications (Google Play Services may not be available):', error);
        return null;
      }
    } else {
      console.log('⚠️ Notifications Debug - Must use physical device for Push Notifications');
    }

    return token;
  };

  // Handle notification actions based on type
  const handleNotificationAction = (actionType: string, data: any) => {
    // 使用NavigationUtils处理通知动作
    let success = false;
    
    // 尝试使用内链代码跳转
    success = NavigationUtils.navigateToInternalRoute(actionType, data);
    
    // 如果跳转失败，默认跳转到首页
    if (!success) {
      router.push('/(tabs)');
    }
  };

  // Register FCM token with backend
  const registerTokenWithBackend = async (token: string) => {
    try {
      
      const deviceNo = await generateDeviceId();
      const deviceType = await getDeviceType();
      
      await NotificationService.registerFCMToken({
        token: user?.token,
        push_device_token: token,
        device_type: deviceType,
        device_no: deviceNo,
        os_type: Platform.OS as 'ios' | 'android' | 'web',
      });
    } catch (error) {
      console.error('❌ Notifications Debug - Failed to register FCM token with backend:', error);
    }
  };

  // Initialize notifications
  useEffect(() => {

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        registerTokenWithBackend(token);
      } else {
        console.log('⚠️ Notifications Debug - No token received');
      }
    });

    if (isDeviceWithoutGMS) {
      return;
    }

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {

      const data = notification.request.content.data as NotificationData;

      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {      
      const { notification } = response;
      const data = notification.request.content.data as NotificationData;

      if (data?.action) {
        handleNotificationAction(data.action as string, data);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current?.remove();
      }
      if (responseListener.current) {
        responseListener.current?.remove();
      }
    };
  }, []);

  // Re-register token when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.token && expoPushToken) {
      registerTokenWithBackend(expoPushToken);
    }
  }, [isAuthenticated, user?.token, expoPushToken]);

  // Schedule local notification (for testing or offline scenarios)
  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: any,
    seconds: number = 1
  ) => {
    if (isDeviceWithoutGMS) {
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: { seconds, repeats: false, type: 'timeInterval' } as any,
    });
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    await Notifications.dismissAllNotificationsAsync();
  };

  // Get notification permissions status
  const getPermissionStatus = async () => {
    return await Notifications.getPermissionsAsync();
  };

  // Request permissions
  const requestPermissions = async () => {
    return await Notifications.requestPermissionsAsync();
  };

  return {
    expoPushToken,
    notification,
    scheduleLocalNotification,
    clearAllNotifications,
    getPermissionStatus,
    requestPermissions,
    registerForPushNotificationsAsync,
  };
}