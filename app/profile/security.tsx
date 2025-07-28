import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { 
  Shield, 
  Lock, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronRight,
  Apple,
  Facebook,
  Check,
  X,
  Google,
  CheckCircle,
  XCircle,
  Bell,
  Settings
} from 'lucide-react-native';
import Header from '@/components/UI/Header';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { AuthService } from '@/services/AuthService';

// Modal Components
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import ChangeWithdrawPasswordModal from '@/components/profile/ChangeWithdrawPasswordModal';
import BindPhoneModal from '@/components/profile/BindPhoneModal';
import BindEmailModal from '@/components/profile/BindEmailModal';
import BindWhatsAppModal from '@/components/profile/BindWhatsAppModal';
import NotificationPermissionCard from '@/components/notifications/NotificationPermissionCard';
import * as WebBrowser from 'expo-web-browser';
import * as GoogleAuth from 'expo-auth-session/providers/google';
import * as FacebookAuth from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';

function SecurityScreenContent() {
  const { colors } = useTheme();
  const { user, reloadUser } = useAuthStore();
  
  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeWithdrawPasswordModal, setShowChangeWithdrawPasswordModal] = useState(false);
  const [showBindPhoneModal, setShowBindPhoneModal] = useState(false);
  const [showBindEmailModal, setShowBindEmailModal] = useState(false);
  const [showBindWhatsAppModal, setShowBindWhatsAppModal] = useState(false);

  // Google Auth Hook for binding
  const [requestGoogleBind, responseGoogleBind, promptAsyncGoogleBind] = GoogleAuth.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  // Facebook Auth Hook for binding
  const [requestFacebookBind, responseFacebookBind, promptAsyncFacebookBind] = FacebookAuth.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
  });

  WebBrowser.maybeCompleteAuthSession();

  const refreshUserData = useCallback(() => {
    if (user?.token) {
      reloadUser();
    }
  }, [user?.token, reloadUser]);

  const securityItems = [
    {
      id: 'password',
      title: 'Login Password',
      subtitle: user?.password_null ? 'Not set' : 'Set',
      icon: <Lock size={24} color={colors.primary} />,
      status: !user?.password_null,
      onPress: () => setShowChangePasswordModal(true),
    },
    {
      id: 'withdraw_password',
      title: 'Withdraw Password',
      subtitle: user?.t_password_null ? 'Not set' : 'Set',
      icon: <Shield size={24} color={colors.primary} />,
      status: !user?.t_password_null,
      onPress: () => setShowChangeWithdrawPasswordModal(true),
    },
    {
      id: 'phone',
      title: 'Phone Number',
      subtitle: user?.phone || 'Not bound',
      icon: <Phone size={24} color={colors.primary} />,
      status: !!user?.phone,
      onPress: () => setShowBindPhoneModal(true),
    },
    {
      id: 'email',
      title: 'Email Address',
      subtitle: user?.email || 'Not bound',
      icon: <Mail size={24} color={colors.primary} />,
      status: user?.is_email_bind || false,
      onPress: () => setShowBindEmailModal(true),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: user?.whatsapp || 'Not bound',
      icon: <MessageCircle size={24} color={colors.primary} />,
      status: user?.whatsapp_bind || false,
      onPress: () => setShowBindWhatsAppModal(true),
    },
  ];

  // Handle Social Binding
  const handleSocialBind = async (socialType: 'google' | 'facebook' | 'apple', accessToken: string, socialId: string, socialEmail: string, socialName?: string) => {
    if (!user?.token) {
      Alert.alert('Error', 'User not authenticated. Please log in first.');
      return;
    }
    try {
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
        refreshUserData(); // Reload user info to reflect binding
      } else {
        Alert.alert('Binding Failed', `Failed to bind ${socialType} account.`);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : `Failed to bind ${socialType} account.`);
    }
  };

  // Google Bind Handler
  const handleGoogleBind = async () => {
    try {
      const result = await promptAsyncGoogleBind();
      if (result.type === 'success' && result.authentication?.accessToken) {
        const accessToken = result.authentication.accessToken;
        // You might need to fetch user info from Google using this token to get social_id and social_email
        // For simplicity, let's assume you get it from the backend response or a separate API call
        // For now, we'll use placeholder social_id and social_email
        Alert.alert('Google Bind', 'Simulating Google bind. In a real app, you\'d fetch user info from Google API.', [
          { text: 'Continue', onPress: () => handleSocialBind('google', accessToken, 'mock_google_id', 'mock_google_email@example.com', 'Mock Google User') }
        ]);
      } else if (result.type === 'cancel') {
        Alert.alert('Bind Cancelled', 'Google bind was cancelled.');
      } else if (result.type === 'error') {
        Alert.alert('Bind Error', result.error?.message || 'An unknown error occurred during Google bind.');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Google bind failed');
    }
  };

  // Facebook Bind Handler
  const handleFacebookBind = async () => {
    try {
      const result = await promptAsyncFacebookBind();
      if (result.type === 'success' && result.authentication?.accessToken) {
        const accessToken = result.authentication.accessToken;
        Alert.alert('Facebook Bind', 'Simulating Facebook bind. In a real app, you\'d fetch user info from Facebook API.', [
          { text: 'Continue', onPress: () => handleSocialBind('facebook', accessToken, 'mock_facebook_id', 'mock_facebook_email@example.com', 'Mock Facebook User') }
        ]);
      } else if (result.type === 'cancel') {
        Alert.alert('Bind Cancelled', 'Facebook bind was cancelled.');
      } else if (result.type === 'error') {
        Alert.alert('Bind Error', result.error?.message || 'An unknown error occurred during Facebook bind.');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Facebook bind failed');
    }
  };

  // Apple Bind Handler
  const handleAppleBind = async () => {
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
      if (credential.identityToken) {
        Alert.alert('Apple Bind', 'Simulating Apple bind. In a real app, you\'d fetch user info from Apple API.', [
          { text: 'Continue', onPress: () => handleSocialBind('apple', credential.identityToken!, credential.user!, credential.email || 'mock_apple_email@example.com', credential.fullName?.givenName || 'Mock Apple User') }
        ]);
      } else {
        Alert.alert('Bind Error', 'Apple identity token not found.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        Alert.alert('Bind Cancelled', 'Apple bind was cancelled.');
      } else {
        Alert.alert('Bind Error', e.message || 'An unknown error occurred during Apple bind.');
      }
    }
  };

  const handleModalClose = async (shouldReload = false) => {
    if (shouldReload) {
      try {
        await reloadUser();
      } catch (error) {
        console.error('Failed to reload user:', error);
      }
    }
  };

  const renderSecurityItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.securityItem,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.securityItemLeft}>
        <View style={[
          styles.securityItemIcon,
          { backgroundColor: `${colors.primary}15` }
        ]}>
          {item.icon}
        </View>
        <View style={styles.securityItemContent}>
          <Text style={[styles.securityItemTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[
            styles.securityItemSubtitle, 
            { color: item.status ? colors.success : colors.textSecondary }
          ]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
      
      <View style={styles.securityItemRight}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: item.status ? colors.success : colors.border }
        ]}>
          {item.status ? (
            <Check size={12} color="#FFFFFF" />
          ) : (
            <X size={12} color={colors.textSecondary} />
          )}
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header 
        title="Security Settings" 
        subtitle="Manage your account security"
        backgroundColor={colors.background}
      />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Permissions */}
        <NotificationPermissionCard />

        {/* Security Overview */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Shield size={32} color={colors.primary} />
            <View style={styles.overviewContent}>
              <Text style={[styles.overviewTitle, { color: colors.text }]}>
                Account Security
              </Text>
              <Text style={[styles.overviewSubtitle, { color: colors.textSecondary }]}>
                Keep your account safe and secure
              </Text>
            </View>
          </View>
          
          <View style={styles.securityScore}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
              Security Score
            </Text>
            <View style={styles.scoreContainer}>
              <View style={[
                styles.scoreBar,
                { backgroundColor: colors.border }
              ]}>
                <View style={[
                  styles.scoreProgress,
                  { 
                    backgroundColor: colors.success,
                    width: `${(securityItems.filter(item => item.status).length / securityItems.length) * 100}%`
                  }
                ]} />
              </View>
              <Text style={[styles.scoreText, { color: colors.success }]}>
                {securityItems.filter(item => item.status).length}/{securityItems.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* Security Items */}
        <View style={styles.securityList}>
          {securityItems.map(renderSecurityItem)}
        </View>

        {/* Social Account Binding */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Social Accounts</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleGoogleBind}>
            <View style={styles.menuItemLeft}>
              <Google size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Bind Google</Text>
            </View>
            <View style={styles.menuItemRight}>
              {user?.google_bind ? ( // Assuming user.google_bind exists
                <CheckCircle size={20} color={colors.success} />
              ) : (
                <XCircle size={20} color={colors.error} />
              )}
            </View>
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={handleFacebookBind}>
            <View style={styles.menuItemLeft}>
              <Facebook size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Bind Facebook</Text>
            </View>
            <View style={styles.menuItemRight}>
              {user?.facebook_bind ? ( // Assuming user.facebook_bind exists
                <CheckCircle size={20} color={colors.success} />
              ) : (
                <XCircle size={20} color={colors.error} />
              )}
            </View>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <>
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <TouchableOpacity style={styles.menuItem} onPress={handleAppleBind}>
                <View style={styles.menuItemLeft}>
                  <Apple size={20} color={colors.primary} />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>Bind Apple</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {user?.apple_bind ? ( // Assuming user.apple_bind exists
                    <CheckCircle size={20} color={colors.success} />
                  ) : (
                    <XCircle size={20} color={colors.error} />
                  )}
                </View>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Notification Permissions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <NotificationPermissionCard />
      </ScrollView>

      {/* Modals */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          setShowChangePasswordModal(false);
          handleModalClose(true);
        }}
      />

      <ChangeWithdrawPasswordModal
        visible={showChangeWithdrawPasswordModal}
        onClose={() => setShowChangeWithdrawPasswordModal(false)}
        onSuccess={() => {
          setShowChangeWithdrawPasswordModal(false);
          handleModalClose(true);
        }}
      />

      <BindPhoneModal
        visible={showBindPhoneModal}
        onClose={() => setShowBindPhoneModal(false)}
        onSuccess={() => {
          setShowBindPhoneModal(false);
          handleModalClose(true);
        }}
      />

      <BindEmailModal
        visible={showBindEmailModal}
        onClose={() => setShowBindEmailModal(false)}
        onSuccess={() => {
          setShowBindEmailModal(false);
          handleModalClose(true);
        }}
      />

      <BindWhatsAppModal
        visible={showBindWhatsAppModal}
        onClose={() => setShowBindWhatsAppModal(false)}
        onSuccess={() => {
          setShowBindWhatsAppModal(false);
          handleModalClose(true);
        }}
      />
    </SafeAreaWrapper>
  );
}

export default function SecurityScreen() {
  return (
    <AuthGuard>
      <SecurityScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  
  // Overview Card
  overviewCard: {
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  overviewContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  overviewSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  securityScore: {
    marginTop: Spacing.md,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },

  // Security List
  securityList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  securityItemContent: {
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  securityItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  securityItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tips Card
  tipsCard: {
    padding: Spacing.lg,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: Spacing.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    marginVertical: Spacing.xs,
  },
});