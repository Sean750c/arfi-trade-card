import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useAppStore } from '@/stores/useAppStore';
import { useCountryStore } from '@/stores/useCountryStore';
import { useBannerStore } from '@/stores/useBannerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeProvider } from '@/theme/ThemeContext';

export default function RootLayout() {
  const router = useRouter();
  const { initialize } = useAppStore();
  const { fetchCountries } = useCountryStore();
  const { fetchBanners } = useBannerStore();
  const { isAuthenticated, user, initialize: initializeAuth } = useAuthStore();
  
  useFrameworkReady();
  useAuthProtection(); // Add auth protection

  useEffect(() => {
    const init = async () => {
      try {
        // 首先初始化认证状态
        await initializeAuth();
        
        // Fetch countries and banners in parallel (these don't require auth)
        await Promise.all([
          fetchCountries(),
          fetchBanners()
        ]);
        
        // Initialize app data with user token if authenticated
        const userToken = isAuthenticated && user?.token ? user.token : undefined;
        await initialize(userToken);
        
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
  }, [initialize, fetchCountries, fetchBanners, router, isAuthenticated, user?.token, initializeAuth]);

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="rates" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="refer" />
        <Stack.Screen name="calculator" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}