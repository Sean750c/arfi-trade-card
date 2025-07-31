import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Bell, 
  Mail, 
  TrendingUp, 
  Shield, 
  Gift, 
  Wallet, 
  Crown,
  Settings,
  ChevronRight,
  Info
} from 'lucide-react-native';
import Header from '@/components/UI/Header';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotifications } from '@/hooks/useNotifications';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import * as Notifications from 'expo-notifications';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: 'push' | 'email' | 'rate';
  requiresAuth?: boolean;
  requiresEmail?: boolean;
}

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { getPermissionStatus, requestPermissions } = useNotifications();
  
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  
  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'order_updates',
      title: 'Order Updates',
      description: 'Get notified when your order status changes',
      icon: <Gift size={20} color="#10B981" />,
      enabled: true,
      category: 'push',
      requiresAuth: true,
    },
    {
      id: 'payment_notifications',
      title: 'Payment Notifications',
      description: 'Receive alerts for payments and withdrawals',
      icon: <Wallet size={20} color="#3B82F6" />,
      enabled: true,
      category: 'push',
      requiresAuth: true,
    },
    {
      id: 'vip_updates',
      title: 'VIP Updates',
      description: 'Get notified about VIP level changes and bonuses',
      icon: <Crown size={20} color="#F59E0B" />,
      enabled: true,
      category: 'push',
      requiresAuth: true,
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important security notifications and login alerts',
      icon: <Shield size={20} color="#EF4444" />,
      enabled: true,
      category: 'push',
      requiresAuth: true,
    },
    {
      id: 'promotional_offers',
      title: 'Promotional Offers',
      description: 'Special deals and limited-time offers',
      icon: <Bell size={20} color="#8B5CF6" />,
      enabled: false,
      category: 'push',
    },
  ]);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const { status } = await requestPermissions();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        Alert.alert(
          'Success',
          'Notifications enabled! You\'ll now receive important updates.'
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'To receive notifications, please enable them in your device settings.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotificationSetting = (id: string) => {
    if (permissionStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications first to manage individual settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: handleRequestPermissions }
        ]
      );
      return;
    }

    setNotificationSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleEmailNotificationToggle = (value: boolean) => {
    if (!user?.is_email_bind) {
      Alert.alert(
        'Email Required',
        'Please bind your email address first to enable email notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Bind Email', onPress: () => router.push('/profile/personal-info') }
        ]
      );
      return;
    }
    setEmailNotificationsEnabled(value);
  };

  const handleRateSubscription = () => {
    Alert.alert(
      'Coming Soon',
      'Rate subscription feature will be available in the next version. Stay tuned!',
      [{ text: 'OK' }]
    );
  };

  const getPermissionStatusInfo = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          color: colors.success,
          text: 'Enabled',
          description: 'You\'ll receive push notifications',
        };
      case 'denied':
        return {
          color: colors.error,
          text: 'Disabled',
          description: 'Enable in device settings to receive notifications',
        };
      default:
        return {
          color: colors.warning,
          text: 'Not Set',
          description: 'Tap to enable push notifications',
        };
    }
  };

  const statusInfo = getPermissionStatusInfo();

  const renderNotificationItem = (setting: NotificationSetting) => {
    const isDisabled = setting.requiresAuth && !isAuthenticated;
    const canToggle = permissionStatus === 'granted' && !isDisabled;

    return (
      <View
        key={setting.id}
        style={[
          styles.notificationItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: isDisabled ? 0.6 : 1,
          }
        ]}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.notificationIcon, { backgroundColor: `${colors.primary}10` }]}>
            {setting.icon}
          </View>
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {setting.title}
            </Text>
            <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
              {setting.description}
            </Text>
            {isDisabled && (
              <Text style={[styles.requiresAuthText, { color: colors.warning }]}>
                Requires login
              </Text>
            )}
          </View>
        </View>
        <Switch
          value={setting.enabled && canToggle}
          onValueChange={() => toggleNotificationSetting(setting.id)}
          disabled={!canToggle}
          trackColor={{
            false: colors.border,
            true: `${colors.primary}40`,
          }}
          thumbColor={setting.enabled && canToggle ? colors.primary : colors.textSecondary}
        />
      </View>
    );
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header 
        title="Notification Settings" 
        subtitle="Manage your notification preferences"
      />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Permission Status Card */}
        <Card style={[styles.permissionCard, { backgroundColor: `${statusInfo.color}10` }]}>
          <View style={styles.permissionHeader}>
            <View style={[styles.permissionIcon, { backgroundColor: statusInfo.color }]}>
              <Bell size={24} color="#FFFFFF" />
            </View>
            <View style={styles.permissionContent}>
              <Text style={[styles.permissionTitle, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text style={[styles.permissionStatus, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
              <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                {statusInfo.description}
              </Text>
            </View>
          </View>
          
          {permissionStatus !== 'granted' && (
            <Button
              title={isLoading ? 'Requesting...' : 'Enable Notifications'}
              onPress={handleRequestPermissions}
              loading={isLoading}
              style={styles.enableButton}
              fullWidth
            />
          )}
        </Card>

        {/* Push Notification Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Push Notifications
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose which push notifications you want to receive
          </Text>
          
          <View style={styles.notificationList}>
            {notificationSettings.map(renderNotificationItem)}
          </View>
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Email Notifications
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Receive important updates via email
          </Text>
          
          <Card style={styles.emailCard}>
            <View style={styles.emailNotificationItem}>
              <View style={styles.emailContent}>
                <Text style={[styles.emailTitle, { color: colors.text }]}>
                  Email Notifications
                </Text>
                <Text style={[styles.emailDescription, { color: colors.textSecondary }]}>
                  {user?.is_email_bind 
                    ? 'Receive important updates via email' 
                    : 'Bind your email to enable email notifications'
                  }
                </Text>
                {user?.email && (
                  <Text style={[styles.emailAddress, { color: colors.primary }]}>
                    {user.email}
                  </Text>
                )}
              </View>
              <Switch
                value={emailNotificationsEnabled && !!user?.is_email_bind}
                onValueChange={handleEmailNotificationToggle}
                disabled={!user?.is_email_bind}
                trackColor={{
                  false: colors.border,
                  true: `${colors.primary}40`,
                }}
                thumbColor={emailNotificationsEnabled && user?.is_email_bind ? colors.primary : colors.textSecondary}
              />
            </View>
            
            {!user?.is_email_bind && (
              <Button
                title="Bind Email Address"
                variant="outline"
                onPress={() => router.push('/profile/personal-info')}
                style={styles.bindEmailButton}
                fullWidth
              />
            )}
          </Card>
        </View>

        {/* Rate Subscription */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Rate Notifications
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Get notified about rate changes for your favorite cards
          </Text>
          
          <TouchableOpacity
            style={[styles.rateSubscriptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleRateSubscription}
            activeOpacity={0.7}
          >
            <View style={styles.rateSubscriptionContent}>
              <View style={[styles.rateSubscriptionIcon, { backgroundColor: `${colors.warning}20` }]}>
                <TrendingUp size={24} color={colors.warning} />
              </View>
              <View style={styles.rateSubscriptionText}>
                <Text style={[styles.rateSubscriptionTitle, { color: colors.text }]}>
                  Rate Subscription
                </Text>
                <Text style={[styles.rateSubscriptionDescription, { color: colors.textSecondary }]}>
                  Subscribe to rate changes for specific gift cards
                </Text>
                <View style={styles.comingSoonBadge}>
                  <Info size={12} color={colors.warning} />
                  <Text style={[styles.comingSoonText, { color: colors.warning }]}>
                    Coming in next version
                  </Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Advanced Settings
            </Text>
          </View>
          
          <Card style={styles.advancedCard}>
            <TouchableOpacity
              style={styles.advancedItem}
              onPress={() => {
                Alert.alert(
                  'Notification Schedule',
                  'Quiet hours and notification scheduling will be available in the next version.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.advancedContent}>
                <Text style={[styles.advancedTitle, { color: colors.text }]}>
                  Quiet Hours
                </Text>
                <Text style={[styles.advancedDescription, { color: colors.textSecondary }]}>
                  Set times when you don't want to receive notifications
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity
              style={styles.advancedItem}
              onPress={() => {
                Alert.alert(
                  'Notification Sound',
                  'Custom notification sounds will be available in the next version.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.advancedContent}>
                <Text style={[styles.advancedTitle, { color: colors.text }]}>
                  Notification Sound
                </Text>
                <Text style={[styles.advancedDescription, { color: colors.textSecondary }]}>
                  Choose custom sounds for different notification types
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Info Box */}
        <Card style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
          <View style={styles.infoHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              About Notifications
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.text }]}>
            • Push notifications require device permission{'\n'}
            • Email notifications require a verified email address{'\n'}
            • You can change these settings anytime{'\n'}
            • Critical security alerts cannot be disabled
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaWrapper>
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

  // Permission Status Card
  permissionCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  permissionStatus: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  enableButton: {
    marginTop: Spacing.md,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  // Notification List
  notificationList: {
    gap: Spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  requiresAuthText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },

  // Email Notifications
  emailCard: {
    padding: 0,
    overflow: 'hidden',
  },
  emailNotificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  emailContent: {
    flex: 1,
  },
  emailTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  emailDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 4,
  },
  emailAddress: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  bindEmailButton: {
    margin: Spacing.md,
    marginTop: 0,
  },

  // Rate Subscription
  rateSubscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  rateSubscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rateSubscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rateSubscriptionText: {
    flex: 1,
  },
  rateSubscriptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  rateSubscriptionDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 6,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comingSoonText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },

  // Advanced Settings
  advancedCard: {
    padding: 0,
    overflow: 'hidden',
  },
  advancedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  advancedContent: {
    flex: 1,
  },
  advancedTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  advancedDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.md,
  },

  // Info Box
  infoBox: {
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});