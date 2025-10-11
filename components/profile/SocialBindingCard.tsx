import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link2, Unlink, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Shield, Facebook as FacebookIcon, Apple } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { AuthService } from '@/services/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import * as AuthSession from "expo-auth-session";


export default function SocialBindingCard() {
  const { colors } = useTheme();
  const { user, reloadUser } = useAuthStore();
  const { initData } = useAppStore();

  // Individual loading states for each social binding
  const [isBindingGoogle, setIsBindingGoogle] = useState(false);
  const [isBindingFacebook, setIsBindingFacebook] = useState(false);
  const [isBindingApple, setIsBindingApple] = useState(false);

  // Check if any binding is in progress
  const isAnyBinding = isBindingGoogle || isBindingFacebook || isBindingApple;

  // Auth hooks
  const expoConfig = Constants.expoConfig;
  const [requestGoogle, responseGoogle, promptAsyncGoogle] = Google.useAuthRequest({
    iosClientId: expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });

  const clientId = expoConfig?.extra?.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';
  const [requestFacebook, responseFacebook, promptAsyncFacebook] = Facebook.useAuthRequest({
    clientId,
  });

  const socialAccounts = [
    {
      id: 'google',
      name: 'Google',
      icon: <Shield size={20} color={colors.primary} />,
      color: '#4285F4',
      isConnected: user?.google_bind || false,
      isAvailable: !!requestGoogle && (initData?.google_login_enable !== false),
      isLoading: isBindingGoogle,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FacebookIcon size={20} color={colors.primary} />,
      color: '#1877F2',
      isConnected: user?.facebook_bind || false,
      isAvailable: !!requestFacebook && (initData?.facebook_login_enable !== false),
      isLoading: isBindingFacebook,
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: <Apple size={20} color={colors.primary} />,
      color: '#000000',
      isConnected: user?.apple_bind || false,
      isAvailable: Platform.OS === 'ios' && (initData?.apple_login_enable !== false),
      isLoading: isBindingApple,
    },
  ];

  const handleGoogleBind = async () => {
    if (isAnyBinding) return;

    if (!user?.token) return;

    if (!requestGoogle) {
      Alert.alert('Info', 'Google services are not available on this device!');
      return;
    }

    setIsBindingGoogle(true);
    try {
      const result = await promptAsyncGoogle();
      Alert.alert('Info', JSON.stringify(result));
      if (result.type === 'success' && result.params?.code) {
        const authCode = result.params.code;
        if (authCode) {
          // 使用 id_token 获取用户信息
          const googleInfo = await AuthService.getGoogleInfoByToken(authCode, requestGoogle?.redirectUri);

          await AuthService.socialBind({
            token: user.token,
            social_type: 'google',
            apple_code: '',
            facebook_token: '',
            social_id: googleInfo.social_id, // 发送授权码给后端处理
            social_email: googleInfo.social_email, // 后端将从Google获取
            social_picture: '', // 后端将从Google获取
            social_name: googleInfo.social_name, // 后端将从Google获取
            version: '1.0',
          });
  
          await reloadUser();
          Alert.alert('Success', 'Google account bound successfully!');
        } else {
          throw new Error('No authentication tokens received from Google');
        }
      } else if (result.type === 'cancel') {
        // Don't show alert for user cancellation
        console.log('Google binding was cancelled by user');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to bind Google account');
    } finally {
      setIsBindingGoogle(false);
    }
  };

  // 使用 access_token 获取用户信息的函数
  const fetchGoogleUserInfo = async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    return await response.json();
  };

  const handleFacebookBind = async () => {
    if (isAnyBinding) return;

    if (!user?.token) return;

    setIsBindingFacebook(true);
    try {
      const result = await promptAsyncFacebook();
      if (result.type === 'success' && result.authentication?.accessToken) {
        const accessToken = result.authentication.accessToken;
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        await AuthService.socialBind({
          token: user.token,
          social_type: 'facebook',
          apple_code: '',
          facebook_token: accessToken,
          social_id: userInfo.id,
          social_email: userInfo.email || '',
          social_picture: userInfo.picture?.data?.url || '',
          social_name: userInfo.name || '',
          version: '1.0',
        });

        await reloadUser();
        Alert.alert('Success', 'Facebook account bound successfully!');
      } else if (result.type === 'cancel') {
        // Don't show alert for user cancellation
        console.log('Facebook binding was cancelled by user');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to bind Facebook account');
    } finally {
      setIsBindingFacebook(false);
    }
  };

  const handleAppleBind = async () => {
    if (isAnyBinding) return;

    if (!user?.token || Platform.OS !== 'ios') return;

    setIsBindingApple(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.authorizationCode) {
        await AuthService.socialBind({
          token: user.token,
          social_type: 'apple',
          apple_code: credential.authorizationCode,
          facebook_token: '',
          social_id: credential.user,
          social_email: credential.email || '',
          social_picture: '',
          social_name: credential.fullName?.givenName || '',
          version: '1.0',
        });

        await reloadUser();
        Alert.alert('Success', 'Apple account bound successfully!');
      }
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Error', error.message || 'Failed to bind Apple account');
      } else {
        // Don't show alert for user cancellation
        console.log('Apple binding was cancelled by user');
      }
    } finally {
      setIsBindingApple(false);
    }
  };

  const handleSocialAction = (account: any) => {
    if (!account.isAvailable) {
      Alert.alert('Not Available', `${account.name} binding is not available on this platform`);
      return;
    }

    if (isAnyBinding) {
      return; // Prevent multiple simultaneous operations
    }
    if (account.isConnected) {
      Alert.alert(
        'Unbind Account',
        `Are you sure you want to unbind your ${account.name} account?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unbind',
            style: 'destructive',
            onPress: () => {
              // TODO: Implement unbind functionality
              Alert.alert('Info', 'Unbind functionality will be implemented soon');
            }
          }
        ]
      );
    } else {
      switch (account.id) {
        case 'google':
          handleGoogleBind();
          break;
        case 'facebook':
          handleFacebookBind();
          break;
        case 'apple':
          handleAppleBind();
          break;
      }
    }
  };

  const renderSocialAccount = (account: any) => (
    <View
      key={account.id}
      style={[
        styles.socialItem,
        {
          backgroundColor: colors.card,
          borderColor: account.isConnected ? colors.success : colors.border,
          opacity: account.isAvailable ? 1 : 0.6,
        }
      ]}
    >
      <View style={styles.socialInfo}>
        <View style={[styles.socialIcon, { backgroundColor: `${account.color}15` }]}>
          {account.isLoading ? (
            <ActivityIndicator size="small" color={account.color} />
          ) : (
            <Text style={styles.socialEmoji}>{account.icon}</Text>
          )}
        </View>
        <View style={styles.socialContent}>
          <Text style={[styles.socialName, { color: colors.text }]}>
            {account.name}
          </Text>
          <View style={styles.socialStatus}>
            {account.isConnected ? (
              <>
                <CheckCircle size={14} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Connected
                </Text>
              </>
            ) : (
              <>
                <AlertCircle size={14} color={colors.textSecondary} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  Not connected
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: account.isConnected ? `${colors.error}15` : `${colors.primary}15`,
            borderColor: account.isConnected ? colors.error : colors.primary,
            opacity: account.isLoading ? 0.7 : 1,
          }
        ]}
        onPress={() => handleSocialAction(account)}
        disabled={!account.isAvailable || isAnyBinding}
      >
        {account.isLoading ? (
          <>
            <ActivityIndicator size="small" color={account.isConnected ? colors.error : colors.primary} />
            <Text style={[styles.actionButtonText, { color: account.isConnected ? colors.error : colors.primary }]}>
              {account.isConnected ? 'Unbinding...' : 'Binding...'}
            </Text>
          </>
        ) : (
          <>
            {account.isConnected ? (
              <Unlink size={16} color={colors.error} />
            ) : (
              <Link2 size={16} color={colors.primary} />
            )}
            <Text style={[
              styles.actionButtonText,
              { color: account.isConnected ? colors.error : colors.primary }
            ]}>
              {account.isConnected ? 'Unbind' : 'Bind'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Social Account Binding
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Connect your social accounts for easier login and enhanced security
        </Text>
      </View>

      <View style={styles.socialList}>
        {socialAccounts.filter(account => account.isAvailable).map(renderSocialAccount)}
      </View>

      {/* <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
        <Text style={[styles.infoTitle, { color: colors.primary }]}>
          🔒 Security Benefits
        </Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          • Alternative login methods for account recovery{'\n'}
          • Enhanced account security with two-factor authentication{'\n'}
          • Faster login process with social authentication
          • Secure data synchronization across devices
        </Text>
      </View> */}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  socialList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  socialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  socialEmoji: {
    fontSize: 20,
  },
  socialContent: {
    flex: 1,
  },
  socialName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  socialStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  infoBox: {
    padding: Spacing.md,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
});