import React from 'react';
import {
  View,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import Spacing from '@/constants/Spacing';
import { AuthService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppleLoginRequest, FacebookLoginRequest, GoogleLoginRequest } from '@/types';
import Constants from 'expo-constants';

export default function SocialLoginButtons() {
  const { colors } = useTheme();
  const { setUser, appleLogin, facebookLogin, googleLogin } = useAuthStore();
  const { initData } = useAppStore();

  // Google Auth Hook
  const expoConfig = Constants.expoConfig;
  const androidClientId = expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
  const iosClientId = expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
  const webClientId = expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
  const [requestGoogle, responseGoogle, promptAsyncGoogle] = Google.useAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
  });

  // Facebook Auth Hook
  const clientId = expoConfig?.extra?.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';
  const [requestFacebook, responseFacebook, promptAsyncFacebook] = Facebook.useAuthRequest({
    clientId, // Replace with your Facebook App ID
  });

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      console.log('🔍 Google Login Debug - Starting login process');
      console.log('🔍 requestGoogle exists:', !!requestGoogle);
      console.log('🔍 Platform:', Platform.OS);
      console.log('🔍 Client IDs:', { androidClientId, iosClientId, webClientId });
      
      if (!requestGoogle) {
        Alert.alert('Info', 'Google services are not available on this device!');
        console.log('❌ Google Login Debug - requestGoogle is null');
        return;
      }
      
      console.log('🔍 Google Login Debug - Calling promptAsyncGoogle...');
      const result = await promptAsyncGoogle();
      console.log('🔍 Google Login Debug - promptAsyncGoogle result:', result);
      console.log('🔍 Google Login Debug - result.type:', result.type);
      
      if (result.type === 'success' && result.authentication?.accessToken) {
        console.log('✅ Google Login Debug - Authentication successful');
        console.log('🔍 Access token exists:', !!result.authentication.accessToken);
        
        const accessToken = result.authentication.accessToken;
        console.log('🔍 Google Login Debug - Fetching user info from Google API...');
        
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userInfo = await userInfoResponse.json();
        console.log('🔍 Google Login Debug - Google user info:', userInfo);
        
        const requestData: GoogleLoginRequest = {
          social_id: userInfo.id,
          social_email: userInfo.email || '',
          social_name: userInfo.name || '',
        };
        console.log('🔍 Google Login Debug - Calling googleLogin with data:', requestData);
        
        await googleLogin(requestData);
        console.log('✅ Google Login Debug - googleLogin completed successfully');
      } else if (result.type === 'cancel') {
        console.log('⚠️ Google Login Debug - User cancelled login');
        Alert.alert('Login Cancelled', 'Google login was cancelled.');
      } else if (result.type === 'error') {
        console.log('❌ Google Login Debug - Error occurred:', result.error);
        Alert.alert('Login Error', result.error?.message || 'An unknown error occurred during Google login.');
      } else {
        // Debug: Handle unexpected result types
        console.log('⚠️ Google Login Debug - Unexpected result type:', result.type);
        console.log('🔍 Full result object:', result);
        Alert.alert('Debug Info', `Unexpected result type: ${result.type}. Check console for details.`);
      }
    } catch (error) {
      console.error('❌ Google Login Debug - Exception caught:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = async () => {
    try {
      console.log('🔍 Facebook Login Debug - Starting login process');
      
      const result = await promptAsyncFacebook();
      console.log('🔍 Facebook Login Debug - promptAsyncFacebook result:', result);
      
      if (result.type === 'success' && result.authentication?.accessToken) {
        console.log('✅ Facebook Login Debug - Authentication successful');
        
        const accessToken = result.authentication.accessToken;
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
        );
        const userInfo = await userInfoResponse.json();
        console.log('🔍 Facebook Login Debug - Facebook user info:', userInfo);
        
        const requestData: FacebookLoginRequest = {
          facebook_token: accessToken,
          social_id: userInfo.id,
          social_email: userInfo.email || '', // 有些用户可能没有公开 email
          social_name: userInfo.name || '',
        };
        console.log('🔍 Facebook Login Debug - Calling facebookLogin with data:', requestData);
        
        await facebookLogin(requestData);
      } else if (result.type === 'cancel') {
        console.log('⚠️ Facebook Login Debug - User cancelled login');
        Alert.alert('Login Cancelled', 'Facebook login was cancelled.');
      } else if (result.type === 'error') {
        console.log('❌ Facebook Login Debug - Error occurred:', result.error);
        Alert.alert('Login Error', result.error?.message || 'An unknown error occurred during Facebook login.');
      } else {
        console.log('⚠️ Facebook Login Debug - Unexpected result type:', result.type);
        Alert.alert('Debug Info', `Unexpected result type: ${result.type}. Check console for details.`);
      }
    } catch (error) {
      console.error('❌ Facebook Login Debug - Exception caught:', error);
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
      console.log('🔍 Apple Login Debug - Starting login process');
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log('🔍 Apple Login Debug - Apple credential:', credential);

      if (credential.authorizationCode) {
        console.log('✅ Apple Login Debug - Authorization code received');
        
        const requestData: AppleLoginRequest = {
          social_id: credential.user,
          social_email: credential.email || '',
          social_name: credential.fullName?.givenName || '',
          social_code: credential.authorizationCode,
        };
        console.log('🔍 Apple Login Debug - Calling appleLogin with data:', requestData);
        
        await appleLogin(requestData);
      } else {
        console.log('❌ Apple Login Debug - No authorization code received');
        Alert.alert('Login Error', 'Apple identity token not found.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        console.log('⚠️ Apple Login Debug - User cancelled login');
        Alert.alert('Login Cancelled', 'Apple login was cancelled.');
      } else {
        console.error('❌ Apple Login Debug - Exception caught:', e);
        Alert.alert('Login Error', e.message || 'An unknown error occurred during Apple login.');
      }
    }
  };

  // Check if social logins are available and enabled
  const isGoogleLoginAvailable = requestGoogle && (initData?.google_login_enable !== false);
  const isFacebookLoginAvailable = requestFacebook && (initData?.facebook_login_enable !== false);
  const isAppleLoginAvailable = Platform.OS === 'ios' && (initData?.apple_login_enable !== false);

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
      {isGoogleLoginAvailable && (
        <TouchableOpacity
          style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/google.png')} // 请替换为你本地图片的实际路径
            style={{ width: 24, height: 24, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={[styles.socialButtonText, { color: colors.text }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      )}

      {isFacebookLoginAvailable && (
        <TouchableOpacity
          style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={handleFacebookLogin}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/facebook.png')} // 请替换为你本地图片的实际路径
            style={{ width: 24, height: 24, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={[styles.socialButtonText, { color: colors.text }]}>
            Continue with Facebook
          </Text>
        </TouchableOpacity>
      )}

      {isAppleLoginAvailable && (
        <TouchableOpacity
          style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={handleAppleLogin}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/apple.png')} // 请替换为你本地图片的实际路径
            style={{ width: 24, height: 24, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={[styles.socialButtonText, { color: colors.text }]}>
            Continue with Apple
          </Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  socialButtonText: {
    marginLeft: Spacing.sm,
    fontSize: 16,
    fontWeight: '500',
  },
});