import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Bell, BellOff, Settings, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import * as Linking from 'expo-linking';

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
              onPress: () => Linking.openSettings()
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
    Linking.openSettings();
  };

  const getStatusConfig = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          icon: <CheckCircle size={24} color={colors.success} />,
          title: 'Push Notifications Enabled',
          description: 'You\'ll receive important updates about your orders and account.',
          buttonTitle: 'Manage in Settings',
          buttonAction: openNotificationSettings,
          buttonVariant: 'outline' as const,
          statusColor: colors.success,
          backgroundColor: `${colors.success}08`,
        };
      case 'denied':
        return {
          icon: <BellOff size={24} color={colors.error} />,
          title: 'Push Notifications Disabled',
          description: 'Enable notifications to receive important updates about your orders.',
          buttonTitle: 'Open Settings',
          buttonAction: openNotificationSettings,
          buttonVariant: 'primary' as const,
          statusColor: colors.error,
          backgroundColor: `${colors.error}08`,
        };
      default:
        return {
          icon: <AlertTriangle size={24} color={colors.warning} />,
          title: 'Enable Push Notifications',
          description: 'Get notified about order updates, payments, and important announcements.',
          buttonTitle: 'Enable Notifications',
          buttonAction: handleRequestPermissions,
          buttonVariant: 'primary' as const,
          statusColor: colors.warning,
          backgroundColor: `${colors.warning}08`,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.statusColor}15` }]}>
          {config.icon}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {config.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {config.description}
          </Text>
        </View>
      </View>
      
      <Button
        title={config.buttonTitle}
        variant={config.buttonVariant}
        onPress={config.buttonAction}
        loading={isLoading}
        style={styles.button}
        fullWidth
      />
      
      {permissionStatus === 'granted' && (
        <View style={[styles.featuresContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            Notification Types:
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Order status updates
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Payment confirmations
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Security alerts
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Promotions & offers
              </Text>
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  button: {
    marginBottom: Spacing.md,
    height: 48,
  },
  featuresContainer: {
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  featuresTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});