import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import Colors from '@/constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors[Platform.OS === 'ios' ? 'light' : 'dark'].background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack>
  );
}