import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFrameworkReady();

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