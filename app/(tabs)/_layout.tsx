import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Chrome as Home, Gift, Wallet, User } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Spacing from '@/constants/Spacing';

export default function TabLayout() {
  const { colors } = useTheme();
  const { isInitialized } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Don't render tabs until auth is initialized
  if (!isInitialized) {
    return null;
  }

  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          height: tabBarHeight + bottomInset + Spacing.xs,
          paddingBottom: bottomInset,
          paddingTop: Spacing.xs,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
        },
        headerShown: false,
        lazy: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell Card',
          tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}