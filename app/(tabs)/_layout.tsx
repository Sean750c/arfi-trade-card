import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, Gift, Wallet, User } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useNavigationPerformance } from '@/hooks/useNavigationPerformance';

export default function TabLayout() {
  const { colors } = useTheme();
  useNavigationPerformance('TabLayout');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
        },
        headerShown: false,
        lazy: true,
        // Optimize tab performance
        unmountOnBlur: false, // Keep tabs mounted for faster switching
        freezeOnBlur: true, // Freeze inactive tabs to save memory
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell Card',
          tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          lazy: true,
        }}
      />
    </Tabs>
  );
}