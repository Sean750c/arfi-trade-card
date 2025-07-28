import React from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { AuthService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';

export default function SocialLoginButtons() {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const { setUser } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      // In a real implementation, you would use a library like @react-native-google-signin/google-signin
      // or expo-auth-session to get the access token
      Alert.alert(
        'Google Login',
        'Google login would be implemented here using Google Sign-In SDK',
        [
          {
            text: 'Simulate Success',
            onPress: async () => {
              try {
                // Simulate getting an access token
                const mockAccessToken = 'mock_google_access_token';
                const userData = await AuthService.googleLogin(mockAccessToken);
                // setUser(userData);
                router.replace('/(tabs)');
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // In a real implementation, you would use react-native-fbsdk-next
      Alert.alert(
        'Facebook Login',
        'Facebook login would be implemented here using Facebook SDK',
        [
          {
            text: 'Simulate Success',
            onPress: async () => {
              try {
                const mockAccessToken = 'mock_facebook_access_token';
                const userData = await AuthService.facebookLogin(mockAccessToken);
                // setUser(userData);
                router.replace('/(tabs)');
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Facebook login failed');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Facebook login failed');
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices');
      return;
    }

    try {
      // In a real implementation, you would use @invertase/react-native-apple-authentication
      Alert.alert(
        'Apple Login',
        'Apple Sign-In would be implemented here using Apple Authentication SDK',
        [
          {
            text: 'Simulate Success',
            onPress: async () => {
              try {
                const mockAccessToken = 'mock_apple_access_token';
                const userData = await AuthService.appleLogin(mockAccessToken);
                // setUser(userData);
                router.replace('/(tabs)');
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Apple login failed');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Apple login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Continue with Google"
        variant="outline"
        onPress={handleGoogleLogin}
        style={[styles.socialButton, { borderColor: colors.border }]}
        fullWidth
      />
      
      <Button
        title="Continue with Facebook"
        variant="outline"
        onPress={handleFacebookLogin}
        style={[styles.socialButton, { borderColor: colors.border }]}
        fullWidth
      />
      
      {Platform.OS === 'ios' && (
        <Button
          title="Continue with Apple"
          variant="outline"
          onPress={handleAppleLogin}
          style={[styles.socialButton, { borderColor: colors.border }]}
          fullWidth
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  socialButton: {
    height: 48,
  },
});