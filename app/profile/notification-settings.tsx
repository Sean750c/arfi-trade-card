import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, TrendingUp } from 'lucide-react-native';
import Header from '@/components/UI/Header';
import Card from '@/components/UI/Card';
import NotificationPermissionCard from '@/components/notifications/NotificationPermissionCard';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleEmailNotificationToggle = (value: boolean) => {
    setEmailNotifications(value);
    // TODO: Implement email notification setting API call
  };

  const handleRateSubscriptionPress = () => {
    Alert.alert(
      'Coming Soon',
      'Rate subscription feature will be available in the next version.',
      [{ text: 'OK' }]
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
        {/* Push Notification Permission */}
        <NotificationPermissionCard />

        {/* Email Notifications */}
        <Card style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Mail size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Email Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive important updates via email
                </Text>
              </View>
            </View>
            {/* <Switch
              value={emailNotifications}
              onValueChange={handleEmailNotificationToggle}
              trackColor={{ false: colors.border, true: `${colors.primary}40` }}
              thumbColor={emailNotifications ? colors.primary : colors.textSecondary}
            /> */}
            <View style={[styles.comingSoonBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </Card>

        {/* Rate Subscription */}
        <TouchableOpacity onPress={handleRateSubscriptionPress}>
          <Card style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}15` }]}>
                  <TrendingUp size={20} color={colors.warning} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Rate Subscription
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Get notified when rates change
                  </Text>
                </View>
              </View>
              <View style={[styles.comingSoonBadge, { backgroundColor: colors.warning }]}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
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
  settingCard: {
    marginBottom: Spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  comingSoonBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
});