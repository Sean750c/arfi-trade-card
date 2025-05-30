import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useCountryStore } from '@/stores/useCountryStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fetchCountries = useCountryStore((state) => state.fetchCountries);
  useFrameworkReady();

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return (
    <>
      <StatusBar style={'light'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}