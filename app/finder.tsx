import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  ExternalLink, 
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import AuthGuard from '@/components/UI/AuthGuard';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFinderStore } from '@/stores/useFinderStore';
import { formatDateString } from '@/utils/date';
import type { Activity } from '@/types/finder';

function FinderScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    activities,
    isLoadingActivities,
    activitiesError,
    fetchActivities,
  } = useFinderStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchActivities(user.token, user.country_id);
    }
  }, [user?.token, user?.country_id]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        fetchActivities(user.token, user.country_id),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token, user?.country_id]);

  const handleActivityPress = async (activity: Activity) => {
    try {
      const supported = await Linking.canOpenURL(activity.active_url);
      if (supported) {
        await Linking.openURL(activity.active_url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open activity link');
    }
  };

  const renderActivityCard = (activity: Activity) => (
    <TouchableOpacity
      key={activity.id}
      style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleActivityPress(activity)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: activity.active_image }}
        style={styles.activityImage}
        resizeMode="cover"
      />
      <View style={styles.activityOverlay} />
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: '#FFFFFF' }]}>
          {activity.active_title}
        </Text>
        <Text style={[styles.activityMemo, { color: 'rgba(255, 255, 255, 0.9)' }]}>
          {activity.active_memo}
        </Text>
        <View style={styles.activityFooter}>
          <View style={styles.activityTime}>
            <Calendar size={14} color="rgba(255, 255, 255, 0.8)" />
            <Text style={[styles.activityTimeText, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              {formatDateString(activity.active_start_time)} - {formatDateString(activity.active_end_time)}
            </Text>
          </View>
          <View style={[styles.activityLink, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <ExternalLink size={12} color="#FFFFFF" />
            <Text style={styles.activityLinkText}>View</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Activities</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Discover activities
            </Text>
          </View>
        </View>

        {/* Activities Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎉 Latest Activities
          </Text>
          
          {isLoadingActivities ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading activities...
              </Text>
            </View>
          ) : activitiesError ? (
            <Card style={styles.errorCard}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {activitiesError}
              </Text>
            </Card>
          ) : activities.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activitiesScroll}
            >
              {activities.map(renderActivityCard)}
            </ScrollView>
          ) : (
            <Card style={styles.emptyCard}>
              <Calendar size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No activities available at the moment
              </Text>
            </Card>
          )}
        </View>

      </ScrollView>
    </SafeAreaWrapper>
  );
}

export default function FinderScreen() {
  return (
    <AuthGuard>
      <FinderScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  
  // Activities
  activitiesScroll: {
    paddingRight: Spacing.lg,
  },
  activityCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    marginRight: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  activityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  activityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  activityContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  activityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  activityMemo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  activityTimeText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  activityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activityLinkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});