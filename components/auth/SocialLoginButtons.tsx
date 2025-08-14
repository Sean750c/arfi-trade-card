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
      if (!requestGoogle) {
        Alert.alert('Info', 'Google services are not available on this device!');
        return;
      }
      
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
        };
        
        await googleLogin(requestData);
      } else if (result.type === 'cancel') {
        Alert.alert('Login Cancelled', 'Google login was cancelled.');
      } else if (result.type === 'error') {
        Alert.alert('Login Error', result.error?.message || 'An unknown error occurred during Google login.');
      } else {
        // Debug: Handle unexpected result types
        Alert.alert('Debug Info', `Unexpected result type: ${result.type}. Check console for details.`);
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
      } else if (result.type === 'cancel') {
        Alert.alert('Login Cancelled', 'Facebook login was cancelled.');
      } else if (result.type === 'error') {
        Alert.alert('Login Error', result.error?.message || 'An unknown error occurred during Facebook login.');
      } else {
        Alert.alert('Debug Info', `Unexpected result type: ${result.type}. Check console for details.`);
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
        };
        
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

  // Check if social logins are available and enabled
  const isGoogleLoginAvailable = requestGoogle && (initData?.google_login_enable !== false);
  const isFacebookLoginAvailable = requestFacebook && (initData?.facebook_login_enable !== false);
  const isAppleLoginAvailable = Platform.OS === 'ios' && (initData?.apple_login_enable !== false);


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