import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import { ActivityIndicator, Text, Image } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import { KochavaMeasurement, KochavaMeasurementEventType } from 'react-native-kochava-measurement';
import { KochavaTracker } from '@/utils/kochava';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppReview } from '@/hooks/useAppReview';
import { useReviewStore } from '@/stores/useReviewStore';
import RatingPromptModal from '@/components/UI/RatingPromptModal';

function InitializationLoader() {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.primary, colors.background]}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: 80, height: 80, marginBottom: 20 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{
        marginTop: 16,
        fontSize: 18,
        fontFamily: 'Inter-Medium',
        color: '#fff',
        textAlign: 'center',
      }}>
        Initializing...
      </Text>
    </LinearGradient>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const isMounted = useRef(true);
  const { initialize, initData } = useAppStore();
  const { fetchCountries } = useCountryStore();
  const { isAuthenticated, user, initialize: initializeAuth, isInitialized } = useAuthStore();
  const { isVisible: popupVisible, popData, closePopup, checkAppStartPopup } = usePopupManager();
  const { markReviewCompleted } = useAppReview();
  const { showRatingPrompt, setShowRatingPrompt } = useReviewStore();

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

        // Silent Update Logic - Only in production builds
        if (__DEV__) {
          console.log('Skipping update check in development mode.');
        } else {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              console.log('Silent update available, downloading in background...');
              await Updates.fetchUpdateAsync();
              console.log('Silent update downloaded successfully. Will apply on next app restart.');
              // Note: We don't call Updates.reloadAsync() for silent updates
              // The update will be applied when the user next restarts the app
            } else {
              console.log('No silent update available.');
            }
          } catch (error) {
            console.error('Silent update check failed:', error);
            // Silently handle update errors - don't interrupt user experience
          }
        }

        await initialize(userToken);
        checkAppStartPopup();

        try {
          KochavaMeasurement.instance.registerAndroidAppGuid("kocardking-android-cwnjsaz");
          KochavaMeasurement.instance.registerIosAppGuid("kocardking-ios-s1der");
          KochavaMeasurement.instance.start();

          // 追踪APP首次打开
          const hasTrackedFirstOpen = await AsyncStorage.getItem('hasTrackedFirstOpen');
          if (!hasTrackedFirstOpen) {
            KochavaTracker.trackAppFirstOpen();
            await AsyncStorage.setItem('hasTrackedFirstOpen', 'true');
          }
        } catch (trackingError) {
          console.log('Tracking initialization failed (non-critical):', trackingError);
        }

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
        <Stack.Screen name="profile/checkin" />
        {/* Add the lottery screen here */}
        <Stack.Screen name="profile/lottery" />
        <Stack.Screen name="utilities" />
        <Stack.Screen name="utilities/mobile-recharge" />
        <Stack.Screen name="utilities/cable-tv" />
        <Stack.Screen name="utilities/electricity" />
        <Stack.Screen name="utilities/internet" />
        <Stack.Screen name="utilities/betting" />
        <Stack.Screen name="+not-found" />
      </Stack>

      {(!isInitialized || !initData) && <InitializationLoader />}

      <StatusBar style="auto" translucent backgroundColor="transparent"/>

      {popupVisible && popData && (
        <PopupModal visible={popupVisible} onClose={closePopup} popData={popData} />
      )}

      <RatingPromptModal
        visible={showRatingPrompt}
        onClose={() => setShowRatingPrompt(false)}
        onRated={markReviewCompleted}
      />

    </ThemeProvider>
  );
}
