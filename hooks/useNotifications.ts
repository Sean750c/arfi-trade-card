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

  const isHuawei = Platform.OS === 'android' && Device.brand?.toLowerCase() === 'huawei';

  // Register for push notifications
  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token = null;

    // Early return for Huawei devices to avoid Google Play Services issues
    if (isHuawei) {
      console.log('🔍 Notifications Debug - Skipping push notification setup for Huawei device');
      return null;
    }

    // Early return for web platform
    if (Platform.OS === 'web') {
      console.log('🔍 Notifications Debug - Skipping push notifications on web platform');
      return null;
    }

    console.log('🔍 Notifications Debug - Starting push notification registration');
    console.log('🔍 Device info:', { 
      isDevice: Device.isDevice, 
      brand: Device.brand,
      platform: Platform.OS 
    });

    if (Platform.OS === 'android') {
      try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#008751',
      });
        console.log('✅ Notifications Debug - Android notification channel created');
      } catch (error) {
        console.error('❌ Notifications Debug - Failed to create Android notification channel:', error);
        return null;
      }
    }

    if (Device.isDevice) {
      console.log('🔍 Notifications Debug - Checking existing permissions...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('🔍 Notifications Debug - Existing permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        console.log('🔍 Notifications Debug - Requesting permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('🔍 Notifications Debug - Permission request result:', status);
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('⚠️ Notifications Debug - Permissions not granted');
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
        console.log('🔍 Notifications Debug - Getting Expo push token...');
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        console.log('🔍 Project ID:', projectId);
        
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('✅ Notifications Debug - Expo Push Token obtained:', token ? 'Yes' : 'No');
      } catch (error) {
        console.error('❌ Notifications Debug - Error getting push token:', error);
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
      console.log('🔍 Notifications Debug - Registering token with backend');
      console.log('🔍 Device token:', token);
      console.log('🔍 User authenticated:', isAuthenticated);
      
      const deviceNo = await generateDeviceId();
      const deviceType = await getDeviceType();
      
      await NotificationService.registerFCMToken({
        token: user?.token,
        push_device_token: token,
        device_type: deviceType,
        device_no: deviceNo,
        os_type: Platform.OS as 'ios' | 'android' | 'web',
      });
      console.log('✅ Notifications Debug - FCM token registered with backend successfully');
    } catch (error) {
      console.error('❌ Notifications Debug - Failed to register FCM token with backend:', error);
    }
  };

  // Initialize notifications
  useEffect(() => {
    console.log('🔍 Notifications Debug - useEffect triggered');
    console.log('🔍 isHuawei:', isHuawei);
    console.log('🔍 Platform:', Platform.OS);

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('✅ Notifications Debug - Setting expo push token');
        setExpoPushToken(token);
        registerTokenWithBackend(token);
      } else {
        console.log('⚠️ Notifications Debug - No token received');
      }
    });

    if (isHuawei) {
      console.log('🔍 Notifications Debug - Skipping notification listeners for Huawei device');
      return;
    }

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);

      const data = notification.request.content.data as NotificationData;
      console.log('🔔 Received data:', data);

      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification response:', response);
      
      const { notification } = response;
      const data = notification.request.content.data as NotificationData;

      console.log('🔔 Click data:', data);

      if (data?.action) {
        handleNotificationAction(data.action as string, data);
      }
    });

    return () => {
      console.log('🔍 Notifications Debug - Cleaning up listeners');
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
      console.log('🔍 Notifications Debug - Re-registering token after user login');
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
    if (isHuawei) {
      console.log('🔍 Notifications Debug - Skipping local notification for Huawei device');
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