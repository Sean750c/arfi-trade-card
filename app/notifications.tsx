import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAppStore } from '@/stores/useAppStore';

// Sample notifications data
const notifications = [
  {
    id: '1',
    title: 'Trade Completed',
    message: 'Your Steam gift card trade has been completed successfully.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'New Rate Alert',
    message: 'iTunes gift card rates have been updated. Check them out!',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    title: 'Referral Bonus',
    message: 'You earned ₦1,000 from your referral John Doe.',
    time: '1 day ago',
    read: false,
  },
];

function NotificationsScreenContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { initData } = useAppStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && styles.androidHeader]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You have {initData?.notice_count} unread notifications
          </Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              {
                backgroundColor: item.read ? colors.background : `${colors.primary}05`,
                borderBottomColor: colors.border,
              },
            ]}
          >
            {!item.read && (
              <View
                style={[styles.unreadIndicator, { backgroundColor: colors.primary }]}
              />
            )}
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                {item.message}
              </Text>
              <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                {item.time}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.notificationsList}
      />
    </SafeAreaView>
  );
}

export default function NotificationsScreen() {
  return (
    <AuthGuard>
      <NotificationsScreenContent />
    </AuthGuard>
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
    paddingTop: Platform.OS === 'ios' ? Spacing.lg : Spacing.xl + 20,
    paddingBottom: Spacing.md,
  },
  androidHeader: {
    paddingTop: Spacing.xl + 20,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },
  notificationsList: {
    paddingTop: Spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});