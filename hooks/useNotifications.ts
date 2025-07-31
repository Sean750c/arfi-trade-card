import { useEffect, useRef, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { NotificationService } from '@/services/notification';
import type { NotificationActionType } from '@/types/notification';
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

export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Register for push notifications
  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#008751',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Push notifications are required to receive important updates about your orders and account.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => Notifications.requestPermissionsAsync() 
            }
          ]
        );
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo Push Token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  };

  // Handle notification actions based on type
  const handleNotificationAction = (actionType: NotificationActionType, data: any) => {
    switch (actionType) {
      case 'order_update':
        if (data.order_no) {
          router.push(`/orders/${data.order_no}` as any);
        } else {
          router.push('/orders');
        }
        break;
      case 'payment_received':
        router.push('/(tabs)/wallet');
        break;
      case 'vip_upgrade':
        router.push('/profile/vip');
        break;
      case 'system_announcement':
        router.push('/notifications');
        break;
      case 'security_alert':
        router.push('/profile/security');
        break;
      case 'promotion':
        router.push('/(tabs)/sell');
        break;
      default:
        router.push('/(tabs)');
        break;
    }
  };

  // Register FCM token with backend
  const registerTokenWithBackend = async (token: string) => {
    // if (!isAuthenticated || !user?.token) {
    //   console.log('User not authenticated, skipping token registration');
    //   return;
    // }

    try {
      // console.log('device_token:', token);
      const deviceNo = await generateDeviceId();
      const deviceType = await getDeviceType();
      await NotificationService.registerFCMToken({
        token: user?.token,
        push_device_token: token,
        device_type: deviceType,
        device_no: deviceNo,
        os_type: Platform.OS as 'ios' | 'android' | 'web',
      });
      console.log('FCM token registered with backend successfully');
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
    }
  };

  // Initialize notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        registerTokenWithBackend(token);
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const { notification } = response;
      const data = notification.request.content.data;
      
      if (data?.action) {
        handleNotificationAction(data.action as NotificationActionType, data);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
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