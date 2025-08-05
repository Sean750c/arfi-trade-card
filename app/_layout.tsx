import { useEffect } from 'react';
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
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Loading component for initialization
function InitializationLoader() {
  const { colors } = useTheme();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      gap: Spacing.md,
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: colors.textSecondary,
      }}>
        Initializing...
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const { initialize } = useAppStore();
  const { fetchCountries } = useCountryStore();
  const { isAuthenticated, user, initialize: initializeAuth, isInitialized } = useAuthStore();

  const {
    isVisible: popupVisible,
    popData,
    closePopup,
    checkAppStartPopup,
  } = usePopupManager();

  useFrameworkReady();
  useAuthProtection(); // Add auth protection

  const isHuawei = Platform.OS === 'android' && Device.brand?.toLowerCase() === 'huawei';
  if (!isHuawei) {
    useNotifications(); // Initialize notifications
  }

  useEffect(() => {
    const init = async () => {
      try {
        // 首先初始化认证状态
        await initializeAuth();

        // Fetch countries and banners in parallel (these don't require auth)
        await Promise.all([
          fetchCountries(),
        ]);

        // Initialize app data with user token if authenticated
        const userToken = isAuthenticated && user?.token ? user.token : undefined;
        await initialize(userToken);

        // Check for app start popup after initialization
        checkAppStartPopup();

        // Check onboarding status
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    init();
  }, []); // 只依赖 []

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {isInitialized ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : null}
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="rates" options={{ headerShown: false }} />
        <Stack.Screen name="refer" options={{ headerShown: false }} />
        <Stack.Screen name="calculator" />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* Show loading screen during initialization */}
      {!isInitialized && <InitializationLoader />}

      <StatusBar style="auto" />

      {/* Global Popup Modal */}
      {popupVisible && popData && (
        <PopupModal
          visible={popupVisible}
          onClose={closePopup}
          popData={popData}
        />
      )}
    </ThemeProvider>
  );
}