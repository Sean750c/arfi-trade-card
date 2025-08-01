import React from 'react';
import {
  View,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { AuthService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppleLoginRequest, FacebookLoginRequest, GoogleLoginRequest } from '@/types';

export default function SocialLoginButtons() {
  const { colors } = useTheme();
  const { setUser, appleLogin, facebookLogin, googleLogin } = useAuthStore();

  // Google Auth Hook
  const [requestGoogle, responseGoogle, promptAsyncGoogle] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  // Facebook Auth Hook
  const [requestFacebook, responseFacebook, promptAsyncFacebook] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID, // Replace with your Facebook App ID
  });

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsyncGoogle();
      if (result.type === 'success' && result.authentication?.accessToken) {
        const accessToken = result.authentication.accessToken;
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userInfo = await userInfoResponse.json();
        const requestData: GoogleLoginRequest = {
          social_id: userInfo.id,
          social_email: userInfo.email || '',
          social_name: userInfo.name || '',
        }
        await googleLogin(requestData);
        // const socialLoginResult = await AuthService.googleLogin(accessToken);
        // await useAuthStore.getState().socialLoginCallback(socialLoginResult);
      } else if (result.type === 'cancel') {
        Alert.alert('Login Cancelled', 'Google login was cancelled.');
      } else if (result.type === 'error') {
        Alert.alert('Login Error', result.error?.message || 'An unknown error occurred during Google login.');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = async () => {
    try {
      const result = await promptAsyncFacebook();
      if (result.type === 'success' && result.authentication?.accessToken) {
        const accessToken = result.authentication.accessToken;
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
        );
        const userInfo = await userInfoResponse.json();
        const requestData: FacebookLoginRequest = {
          facebook_token: accessToken,
          social_id: userInfo.id,
          social_email: userInfo.email || '', // 有些用户可能没有公开 email
          social_name: userInfo.name || '',
        };
        await facebookLogin(requestData);
        // const socialLoginResult = await AuthService.facebookLogin(accessToken);
        // await useAuthStore.getState().socialLoginCallback(socialLoginResult); // Re-using googleLoginCallback for now
      } else if (result.type === 'cancel') {
        Alert.alert('Login Cancelled', 'Facebook login was cancelled.');
      } else if (result.type === 'error') {
        Alert.alert('Login Error', result.error?.message || 'An unknown error occurred during Facebook login.');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Facebook login failed');
    }
  };

  // Handle Apple Login
  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices');
      return;
    }
    
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.authorizationCode) {
        const requestData: AppleLoginRequest = {
          social_id: credential.user,
          social_email: credential.email || '',
          social_name: credential.fullName?.givenName || '',
          social_code: credential.authorizationCode,
        }
        await appleLogin(requestData);
      } else {
        Alert.alert('Login Error', 'Apple identity token not found.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        Alert.alert('Login Cancelled', 'Apple login was cancelled.');
      } else {
        Alert.alert('Login Error', e.message || 'An unknown error occurred during Apple login.');
      }
    }
  };

  // Close the web browser opened by AuthSession
  WebBrowser.maybeCompleteAuthSession();

  // Check if Google login is available
  const isGoogleLoginAvailable = requestGoogle;
  // Check if Facebook login is available
  const isFacebookLoginAvailable = requestFacebook;
  // Apple login is only available on iOS
  const isAppleLoginAvailable = Platform.OS === 'ios';

  // Function to handle social binding
  const handleSocialBind = async (socialType: 'google' | 'facebook' | 'apple', accessToken: string, socialId: string, socialEmail: string, socialName?: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.token) {
        Alert.alert('Error', 'User not authenticated. Please log in first.');
        return;
      }
      const bindResult = await AuthService.socialBind({
        token: user.token,
        social_type: socialType,
        apple_code: socialType === 'apple' ? accessToken : '', // Apple uses identityToken as code
        facebook_token: socialType === 'facebook' ? accessToken : '',
        social_id: socialId,
        social_email: socialEmail,
        social_picture: '', // Assuming no picture from this flow
        social_name: socialName,
        version: '1.0', // Or dynamically get app version
      });
      if (bindResult.is_social_bind) {
        Alert.alert('Success', `${socialType} account bound successfully!`);
        useAuthStore.getState().reloadUser(); // Reload user info to reflect binding
      } else {
        Alert.alert('Binding Failed', `Failed to bind ${socialType} account.`);
      }
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
        disabled={!isGoogleLoginAvailable}
        style={[styles.socialButton, { borderColor: colors.border }]}
        fullWidth
      />
      
      <Button
        title="Continue with Facebook"
        variant="outline"
        onPress={handleFacebookLogin}
        disabled={!isFacebookLoginAvailable}
        style={[styles.socialButton, { borderColor: colors.border }]}
        fullWidth
      />
      
      {isAppleLoginAvailable && (
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