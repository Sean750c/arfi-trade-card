import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, Mail, TrendingUp, Shield, Volume2, Smartphone } from 'lucide-react-native';
import Header from '@/components/UI/Header';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotifications } from '@/hooks/useNotifications';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: 'push' | 'email' | 'subscription';
}

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { getPermissionStatus, requestPermissions } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(false);
  const [pushPermissionStatus, setPushPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'order_updates',
      title: 'Order Updates',
      description: 'Get notified when your order status changes',
      icon: <Bell size={20} color="#008751" />,
      enabled: true,
      category: 'push',
    },
    {
      id: 'payment_notifications',
      title: 'Payment Notifications',
      description: 'Receive alerts for payments and withdrawals',
      icon: <Shield size={20} color="#008751" />,
      enabled: true,
      category: 'push',
    },
    {
      id: 'vip_updates',
      title: 'VIP Updates',
      description: 'Get notified about VIP level changes and benefits',
      icon: <Smartphone size={20} color="#008751" />,
      enabled: true,
      category: 'push',
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important security notifications for your account',
      icon: <Shield size={20} color="#008751" />,
      enabled: true,
      category: 'push',
    },
    {
      id: 'email_notifications',
      title: 'Email Notifications',
      description: 'Receive important updates via email',
      icon: <Mail size={20} color="#008751" />,
      enabled: user?.is_email_bind || false,
      category: 'email',
    },
    {
      id: 'rate_subscription',
      title: 'Rate Alerts',
      description: 'Get notified when rates change for your favorite cards',
      icon: <TrendingUp size={20} color="#008751" />,
      enabled: false,
      category: 'subscription',
    },
    {
      id: 'promotional_offers',
      title: 'Promotional Offers',
      description: 'Receive notifications about special offers and bonuses',
      icon: <Volume2 size={20} color="#008751" />,
      enabled: true,
      category: 'push',
    },
  ]);

  useEffect(() => {
    checkPushPermissionStatus();
  }, []);

  const checkPushPermissionStatus = async () => {
    try {
      const { status } = await getPermissionStatus();
      setPushPermissionStatus(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const handleToggleSetting = async (settingId: string) => {
    const setting = notificationSettings.find(s => s.id === settingId);
    if (!setting) return;

    // Check if this is a push notification setting and permissions are needed
    if (setting.category === 'push' && !setting.enabled && pushPermissionStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'To enable push notifications, please grant notification permissions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Grant Permission', 
            onPress: async () => {
              try {
                const { status } = await requestPermissions();
                setPushPermissionStatus(status);
                if (status === 'granted') {
                  updateSetting(settingId, true);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to request permissions');
              }
            }
          }
        ]
      );
      return;
    }

    // Check if this is email notification and email is not bound
    if (setting.category === 'email' && !setting.enabled && !user?.is_email_bind) {
      Alert.alert(
        'Email Required',
        'To enable email notifications, please bind your email address first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Bind Email', 
            onPress: () => router.push('/profile/personal-info')
          }
        ]
      );
      return;
    }

    updateSetting(settingId, !setting.enabled);
  };

  const updateSetting = (settingId: string, enabled: boolean) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled }
          : setting
      )
    );
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would typically save settings to your backend
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Notification settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSettingItem = (setting: NotificationSetting) => {
    const isDisabled = setting.category === 'email' && !user?.is_email_bind;
    
    return (
      <View
        key={setting.id}
        style={[
          styles.settingItem,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: isDisabled ? 0.6 : 1,
          }
        ]}
      >
        <View style={styles.settingIcon}>
          {setting.icon}
        </View>
        
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {setting.title}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {setting.description}
          </Text>
          {isDisabled && (
            <Text style={[styles.disabledText, { color: colors.error }]}>
              Email binding required
            </Text>
          )}
        </View>
        
        <Switch
          value={setting.enabled}
          onValueChange={() => handleToggleSetting(setting.id)}
          trackColor={{ false: colors.border, true: `${colors.primary}50` }}
          thumbColor={setting.enabled ? colors.primary : colors.textSecondary}
          disabled={isDisabled}
        />
      </View>
    );
  };

  const pushSettings = notificationSettings.filter(s => s.category === 'push');
  const emailSettings = notificationSettings.filter(s => s.category === 'email');
  const subscriptionSettings = notificationSettings.filter(s => s.category === 'subscription');

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
        {/* Push Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Push Notifications
            </Text>
          </View>
          
          {pushPermissionStatus !== 'granted' && (
            <Card style={[styles.permissionCard, { backgroundColor: `${colors.warning}10` }]}>
              <Text style={[styles.permissionTitle, { color: colors.warning }]}>
                Permission Required
              </Text>
              <Text style={[styles.permissionText, { color: colors.text }]}>
                Enable push notifications to receive real-time updates about your orders and account.
              </Text>
              <Button
                title="Enable Push Notifications"
                onPress={async () => {
                  try {
                    const { status } = await requestPermissions();
                    setPushPermissionStatus(status);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to request permissions');
                  }
                }}
                style={styles.permissionButton}
                size="sm"
              />
            </Card>
          )}
          
          <View style={styles.settingsGroup}>
            {pushSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Email Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Email Notifications
            </Text>
          </View>
          
          {!user?.is_email_bind && (
            <Card style={[styles.permissionCard, { backgroundColor: `${colors.error}10` }]}>
              <Text style={[styles.permissionTitle, { color: colors.error }]}>
                Email Not Bound
              </Text>
              <Text style={[styles.permissionText, { color: colors.text }]}>
                Bind your email address to receive important notifications via email.
              </Text>
              <Button
                title="Bind Email Address"
                onPress={() => router.push('/profile/personal-info')}
                style={styles.permissionButton}
                size="sm"
              />
            </Card>
          )}
          
          <View style={styles.settingsGroup}>
            {emailSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Subscription Alerts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Rate Subscriptions
            </Text>
          </View>
          
          <View style={styles.settingsGroup}>
            {subscriptionSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Save Button */}
        <Button
          title={isLoading ? 'Saving...' : 'Save Settings'}
          onPress={handleSaveSettings}
          loading={isLoading}
          style={styles.saveButton}
          fullWidth
        />

        {/* Info Card */}
        <Card style={[styles.infoCard, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>
            💡 About Notifications
          </Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            • Push notifications require device permissions{'\n'}
            • Email notifications require a bound email address{'\n'}
            • Rate alerts help you track favorable exchange rates{'\n'}
            • You can change these settings anytime
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  permissionCard: {
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },
  settingsGroup: {
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingIcon: {
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  disabledText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  saveButton: {
    marginBottom: Spacing.lg,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});