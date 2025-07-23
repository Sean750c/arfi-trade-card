import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Bell, BellOff, Settings, CheckCircle } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import * as Notifications from 'expo-notifications';

export default function NotificationPermissionCard() {
  const { colors } = useTheme();
  const { getPermissionStatus, requestPermissions } = useNotifications();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoading, setIsLoading] = useState(false);

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
          'Notifications enabled! You\'ll now receive important updates about your orders and account.'
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'To receive important updates, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Notifications.openSettingsAsync() 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const openNotificationSettings = () => {
    Notifications.openSettingsAsync();
  };

  const getStatusInfo = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          icon: <CheckCircle size={24} color={colors.success} />,
          title: 'Notifications Enabled',
          description: 'You\'ll receive important updates about your orders and account.',
          buttonTitle: 'Manage Settings',
          buttonAction: openNotificationSettings,
          buttonVariant: 'outline' as const,
          cardColor: `${colors.success}10`,
        };
      case 'denied':
        return {
          icon: <BellOff size={24} color={colors.error} />,
          title: 'Notifications Disabled',
          description: 'Enable notifications to receive important updates about your orders.',
          buttonTitle: 'Open Settings',
          buttonAction: openNotificationSettings,
          buttonVariant: 'primary' as const,
          cardColor: `${colors.error}10`,
        };
      default:
        return {
          icon: <Bell size={24} color={colors.warning} />,
          title: 'Enable Notifications',
          description: 'Get notified about order updates, payments, and important announcements.',
          buttonTitle: 'Enable Notifications',
          buttonAction: handleRequestPermissions,
          buttonVariant: 'primary' as const,
          cardColor: `${colors.warning}10`,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card style={[styles.container, { backgroundColor: statusInfo.cardColor }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {statusInfo.icon}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {statusInfo.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {statusInfo.description}
          </Text>
        </View>
      </View>
      
      <Button
        title={statusInfo.buttonTitle}
        variant={statusInfo.buttonVariant}
        onPress={statusInfo.buttonAction}
        loading={isLoading}
        style={styles.button}
        fullWidth
      />
      
      {permissionStatus === 'granted' && (
        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            You'll be notified about:
          </Text>
          <View style={styles.featuresList}>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              • Order status updates and completions
            </Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              • Payment confirmations and withdrawals
            </Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              • VIP level upgrades and bonuses
            </Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              • Security alerts and account changes
            </Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
              • Special promotions and offers
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  button: {
    marginBottom: Spacing.md,
  },
  featuresContainer: {
    marginTop: Spacing.sm,
  },
  featuresTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  featuresList: {
    gap: Spacing.xs,
  },
  featureItem: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});