import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Shield, 
  Download,
  Trash2,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

export default function SettingsScreen() {
  // const systemColorScheme = useColorScheme() ?? 'light';
  // const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const { theme: currentTheme, setTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  // 根据currentTheme变量切换主题
  // const effectiveTheme = currentTheme === 'system' ? systemColorScheme : currentTheme;
  // const colors = Colors[effectiveTheme];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      const savedNotifications = await AsyncStorage.getItem('notifications_enabled');
      const savedPush = await AsyncStorage.getItem('push_notifications');
      const savedEmail = await AsyncStorage.getItem('email_notifications');

      if (savedTheme) setTheme(savedTheme as 'light' | 'dark' | 'system');
      if (savedNotifications) setNotificationsEnabled(JSON.parse(savedNotifications));
      if (savedPush) setPushNotifications(JSON.parse(savedPush));
      if (savedEmail) setEmailNotifications(JSON.parse(savedEmail));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveTheme = async (theme: 'light' | 'dark' | 'system') => {
    try {
      // await AsyncStorage.setItem('app_theme', theme); // 可选持久化
      setTheme(theme);
      Alert.alert('Theme Updated', `Theme changed to ${theme} mode`);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting('notifications_enabled', value);
  };

  const handlePushToggle = (value: boolean) => {
    setPushNotifications(value);
    saveSetting('push_notifications', value);
  };

  const handleEmailToggle = (value: boolean) => {
    setEmailNotifications(value);
    saveSetting('email_notifications', value);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data (including settings, login info, etc). Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          }
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'app_theme',
                'notifications_enabled',
                'push_notifications',
                'email_notifications',
              ]);
              loadSettings();
              Alert.alert('Success', 'Settings reset to default');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        },
      ]
    );
  };

  const renderThemeOption = (theme: 'light' | 'dark' | 'system', title: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: currentTheme === theme ? colors.primary : 'transparent',
          borderColor: currentTheme === theme ? colors.primary : colors.border,
        },
      ]}
      onPress={() => saveTheme(theme)}
    >
      <View style={[
        styles.themeIcon,
        { backgroundColor: currentTheme === theme ? 'rgba(255,255,255,0.2)' : `${colors.primary}15` }
      ]}>
        {icon}
      </View>
      <Text style={[
        styles.themeText,
        { color: currentTheme === theme ? '#FFFFFF' : colors.text }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderSettingItem = (
    title: string,
    description: string,
    icon: React.ReactNode,
    value?: boolean,
    onToggle?: (value: boolean) => void,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { borderBottomColor: colors.border }
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
        {icon}
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      
      <View style={styles.settingRight}>
        {onToggle && value !== undefined ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
            thumbColor={value ? colors.primary : '#F4F4F5'}
          />
        ) : onPress ? (
          <ChevronRight size={16} color={colors.textSecondary} />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: currentTheme === 'dark' ? colors.card : '#FFFFFF',
          borderBottomColor: colors.border,
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your app experience
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose your preferred theme
          </Text>
          
          <View style={styles.themeContainer}>
            {renderThemeOption('light', 'Light', <Sun size={20} color={currentTheme === 'light' ? '#FFFFFF' : colors.primary} />)}
            {renderThemeOption('dark', 'Dark', <Moon size={20} color={currentTheme === 'dark' ? '#FFFFFF' : colors.primary} />)}
            {renderThemeOption('system', 'System', <Globe size={20} color={currentTheme === 'system' ? '#FFFFFF' : colors.primary} />)}
          </View>
        </View>

        {/* Notifications */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          
          {renderSettingItem(
            'Enable Notifications',
            'Receive notifications about your account activity',
            <Bell size={20} color={colors.primary} />,
            notificationsEnabled,
            handleNotificationsToggle
          )}
          
          {renderSettingItem(
            'Push Notifications',
            'Get instant notifications on your device',
            <Bell size={20} color={colors.primary} />,
            pushNotifications,
            handlePushToggle
          )}
          
          {renderSettingItem(
            'Email Notifications',
            'Receive notifications via email',
            <Bell size={20} color={colors.primary} />,
            emailNotifications,
            handleEmailToggle
          )}
        </View> */}

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Privacy & Security
          </Text>
          
          {renderSettingItem(
            'Privacy Policy',
            'Read our privacy policy',
            <Shield size={20} color={colors.primary} />,
            undefined,
            undefined,
            () => router.push('/profile/privacy-policy')
          )}
          
          {renderSettingItem(
            'Terms of Service',
            'Read our terms of service',
            <Info size={20} color={colors.primary} />,
            undefined,
            undefined,
            () => router.push('/profile/terms-of-service')
          )}
        </View>

        {/* Storage & Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Storage & Data
          </Text>
          
          {renderSettingItem(
            'Clear Cache',
            'Free up storage space by clearing cached data',
            <Download size={20} color={colors.primary} />,
            undefined,
            undefined,
            handleClearCache
          )}
          
          {renderSettingItem(
            'Reset Settings',
            'Reset all settings to default values',
            <Trash2 size={20} color={colors.error} />,
            undefined,
            undefined,
            handleResetSettings
          )}
        </View>

        {/* App Information */}
        <View style={[
          styles.infoCard,
          { backgroundColor: currentTheme === 'dark' ? colors.card : '#F9FAFB' }
        ]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            App Information
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              1.0.0
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Build
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              2025.06.01
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 80,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  themeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  settingRight: {
    marginLeft: Spacing.md,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});