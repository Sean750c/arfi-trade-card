import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();

  if (typeof isAuthenticated === 'undefined') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Lock size={48} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Login Required
          </Text>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            You need to be logged in to access this feature. Please login or create an account to continue.
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              onPress={() => {
                try {
                  router.push('/(auth)/login');
                } catch (error) {
                  console.error('Navigation error:', error);
                  router.replace('/(auth)/login');
                }
              }}
              style={styles.loginButton}
              fullWidth
            />
            
            <Button
              title="Create Account"
              variant="outline"
              onPress={() => {
                try {
                  router.push('/(auth)/register');
                } catch (error) {
                  console.error('Navigation error:', error);
                  router.replace('/(auth)/register');
                }
              }}
              style={styles.registerButton}
              fullWidth
            />
          </View>
          
          <Button
            title="Continue as Guest"
            variant="ghost"
            onPress={() => {
              try {
                router.replace('/(auth)/login');
                router.back();
              } catch (error) {
                console.error('Navigation error:', error);
                router.replace('/(tabs)');
              }
            }}
            style={styles.guestButton}
            fullWidth
          />
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  loginButton: {
    // Default button styles
  },
  registerButton: {
    // Default button styles
  },
  guestButton: {
    // Default button styles
  },
});