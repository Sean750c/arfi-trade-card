import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useAppStore } from '@/stores/useAppStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeProvider } from '@/theme/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { usePopupManager } from '@/hooks/usePopupManager';
import PopupModal from '@/components/UI/PopupModal';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';

function InitializationLoader() {
  const { colors } = useTheme();
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{
        marginTop: 16,
        fontSize: 18,
        fontFamily: 'Inter-Medium',
        color: colors.textSecondary,
        textAlign: 'center',
      }}>
        Initializing...
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const isMounted = useRef(true);
  const { initialize } = useAppStore();
  const { fetchCountries } = useCountryStore();
  const { isAuthenticated, user, initialize: initializeAuth, isInitialized } = useAuthStore();
  const { isVisible: popupVisible, popData, closePopup, checkAppStartPopup } = usePopupManager();
  
  useFrameworkReady();
  useAuthProtection();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 假设 useNotifications 返回一个普通函数来启动通知
  useNotifications();

  // Handle WebBrowser auth sessions globally
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth();
        await Promise.all([fetchCountries()]);
        const userToken = isAuthenticated && user?.token ? user.token : undefined;
        await initialize(userToken);
        checkAppStartPopup();

        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (!hasCompletedOnboarding) { // Only redirect if onboarding hasn't been completed
          setTimeout(() => {
            if (isMounted.current) {
              router.replace('/onboarding');
            }
          }, 100); // Add a small delay to ensure router is ready
        }
      } catch (error) {
        console.error('Initialization error:', error);
        // TODO: 可以调用弹窗或者toast提示错误
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="rates" />
        <Stack.Screen name="refer" />
        <Stack.Screen name="calculator" />
        <Stack.Screen name="+not-found" />
      </Stack>

      {!isInitialized && <InitializationLoader />}

      <StatusBar style="auto" />

      {popupVisible && popData && (
        <PopupModal visible={popupVisible} onClose={closePopup} popData={popData} />
      )}
    </ThemeProvider>
  );
}
