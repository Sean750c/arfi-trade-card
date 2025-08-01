import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Bell, Filter, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Image as ImageIcon } from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Spacing from '@/constants/Spacing';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { NotificationService } from '@/services/notification';
import { Notice } from '@/types';
import { useTheme } from '@/theme/ThemeContext';
import { formatDate } from '@/utils/date';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
  
const NOTIFICATION_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'notice', label: 'Notice' },
  { key: 'system', label: 'System' },
] as const;

function NotificationsScreenContent() {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    notifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    activeType,
    totalCount,
    fetchNotifications,
    loadMoreNotifications,
    setActiveType,
    markAsRead,
    clearNotifications,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);

  // Safely handle notifications array - ensure it's always an array
  const safeNotifications = notifications || [];

  // Initial load
  useEffect(() => {
    if (user?.token) {
      fetchNotifications(user.token, 'all', true);
    }
  }, [user?.token, fetchNotifications]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;
    
    setRefreshing(true);
    try {
      await fetchNotifications(user.token, activeType, true);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token, activeType, fetchNotifications]);

  // Handle type change
  const handleTypeChange = useCallback(async (type: 'all' | 'notice' | 'system') => {
    if (!user?.token || type === activeType) return;
    
    setActiveType(type);
    await fetchNotifications(user.token, type, true);
  }, [user?.token, activeType, setActiveType, fetchNotifications]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (!user?.token || isLoadingMore || !hasMore) return;
    
    await loadMoreNotifications(user.token);
  }, [user?.token, isLoadingMore, hasMore, loadMoreNotifications]);

  // Handle notification press
  const handleNotificationPress = useCallback(async (notification: Notice) => {
    if (!user?.token) return;

    // Mark as read if it's new
    if (notification.notice_new) {
      await markAsRead(notification.id, user.token);
    }

    // 使用NotificationService处理通知点击
    const success = NotificationService.handleNotificationClick(notification);
    if (!success) {
      console.warn('Failed to handle notification click:', notification);
    }

    try {
      switch (notification.notice_action) {
        case 'app_order':
          if (notification.notice_params) {
            router.push(`/orders/${notification.notice_params}` as any);
          }
          break;
        case 'app_vip':
          // Navigate to VIP section
          router.push('/profile/vip' as any);
          break;
        case 'app_withdrawdetail':
          // Navigate to wallet
          router.push(`/wallet/${notification.notice_params}`);
          break;
        case 'app_profile':
          // Navigate to profile
          router.push('/(tabs)/profile');
          break;
        case 'app_reward':
          // Navigate to profile
          router.push('/wallet/rebate');
          break;
        default:
          // Handle custom URLs or other actions
          if (notification.notice_jump) {
            // For now, just show an alert with the action
            // Alert.alert('Navigation', `Action: ${notification.notice_action}`);
          }
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to the requested page');
    }
  }, [user?.token, markAsRead]);

  // Get status icon
  const getStatusIcon = (notification: Notice) => {
    if (notification.notice_new) {
      return <Bell size={16} color={colors.primary} />;
    }
    return <CheckCircle size={16} color={colors.success} />;
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.notice_new ? `${colors.primary}05` : colors.background,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
              {item.notice_title}
            </Text>
            {getStatusIcon(item)}
          </View>
          <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
            {formatDate(item.notice_time)}
          </Text>
        </View>
        
        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.notice_content}
        </Text>
        
        {item.notice_order?.image && (
          <View style={styles.attachmentContainer}>
            <ImageIcon size={16} color={colors.textSecondary} />
            <Text style={[styles.attachmentText, { color: colors.textSecondary }]}>
              Image attachment
            </Text>
          </View>
        )}
      </View>
      
      {item.notice_new && (
        <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Bell size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No notifications
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AlertCircle size={48} color={colors.error} />
      <Text style={[styles.errorTitle, { color: colors.error }]}>
        Failed to load notifications
      </Text>
      <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={handleRefresh}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Render footer
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Loading more...
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && styles.androidHeader, { backgroundColor: colors.background }]}>
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
            {totalCount > 0 ? `${totalCount} notifications loaded` : 'No notifications'}
          </Text>
        </View>
      </View>

      {/* Type Filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
        {NOTIFICATION_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: activeType === type.key ? colors.primary : 'transparent',
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleTypeChange(type.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: activeType === type.key ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {error && !refreshing ? (
        renderErrorState()
      ) : (
        <FlatList
          data={safeNotifications}
          keyExtractor={(item, idx) => (item?.id ? item.id.toString() : `notice-${idx}`)}
          renderItem={renderNotificationItem}
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            safeNotifications.length === 0 && !isLoading && styles.emptyListContainer,
          ]}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}

      {/* Loading overlay for initial load */}
      {isLoading && safeNotifications.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading notifications...
          </Text>
        </View>
      )}
    </SafeAreaWrapper>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    paddingBottom: Spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    position: 'relative',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginRight: Spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
    marginTop: Spacing.xxs,
    fontFamily: 'Inter-Regular',
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  unreadIndicator: {
    position: 'absolute',
    right: Spacing.lg,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.md,
  },
});