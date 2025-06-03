import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAppStore } from '@/stores/useAppStore';

export default function RootLayout() {
  const router = useRouter();
  const initialize = useAppStore((state) => state.initialize);
  useFrameworkReady();

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize app data
        await initialize();
        
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
  }, [initialize, router]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}