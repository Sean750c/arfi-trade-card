import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

// Define which routes don't require authentication
const PUBLIC_ROUTES = [
  '', // Home page
  'index', // Home page alternative
  'rates', // Rate list page
  'onboarding',
  '(auth)', // Auth routes
  '(auth)/login',
  '(auth)/register',
  '+not-found',
];

// Define which routes require authentication
const PROTECTED_ROUTES = [
  '(tabs)/sell',
  '(tabs)/wallet',
  'notifications',
  'refer',
  'orders',
  'wallet',
  'calculator',
];

export function useAuthProtection() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    // Wait for initialization to complete before any navigation
    if (!isInitialized) {
      console.log('Auth protection waiting for initialization...');
      return;
    }

    // Get the current route path
    const currentPath = segments.join('/');
    console.log('Auth protection checking path:', currentPath, 'isAuthenticated:', isAuthenticated);

    // Check if current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
      currentPath.includes(route) || currentPath.startsWith(route)
    );

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route =>
      currentPath === route || currentPath.startsWith(route)
    );

    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && isProtectedRoute) {
      console.log(`Redirecting to login from protected route: ${currentPath}`);
      // Use setTimeout to ensure navigation happens after current render cycle
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
      return;
    }

    // If user is authenticated and on auth pages, redirect to home
    if (isAuthenticated && currentPath.includes('(auth)')) {
      console.log(`Redirecting authenticated user to home from: ${currentPath}`);
      // Use setTimeout to ensure navigation happens after current render cycle
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 0);
      return;
    }
  }, [isAuthenticated, isInitialized, segments]);
}