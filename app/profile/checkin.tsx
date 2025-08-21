import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ChevronLeft, Star, Trophy, Gift, Calendar, Clock, Zap, List,
  CalendarCheck,
  Star,
  Gift,
  DollarSign,
  Ticket,
  HelpCircle,
  Info,
} from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import Header from '@/components/UI/Header';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCheckinStore } from '@/stores/useCheckinStore';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import CheckinCalendar from '@/components/checkin/CheckinCalendar';
import MakeUpSignModal from '@/components/checkin/MakeUpSignModal';
import CheckinLogModal from '@/components/checkin/CheckinLogModal';
import RewardIcon from '@/components/checkin/RewardIcon';
import { RewardType } from '@/types';

// Helper to format date to YYYY-MM-DD
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CheckinScreenContent() {
  const { colors } = useTheme();
  const { user, isAuthenticated, reloadUser } = useAuthStore();
  const {
    checkinConfig,
    isLoadingConfig,
    isCheckingIn,
    configError,
    checkinError,
    fetchCheckinConfig,
    performCheckin,
  } = useCheckinStore();

  const [currentDisplayDate, setCurrentDisplayDate] = useState(formatDate(new Date()));
  const [showLogModal, setShowLogModal] = useState(false);
  const [showMakeUpSignModal, setShowMakeUpSignModal] = useState(false);

  // Fetch data on focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user?.token) {
        fetchCheckinConfig(user.token, currentDisplayDate);
      }
    }, [isAuthenticated, user?.token, fetchCheckinConfig, currentDisplayDate])
  );

  // Handle check-in action
  const handleCheckin = useCallback(
    async (ruleId: number) => {
      if (!user?.token) {
        Alert.alert('Error', 'Please login to check in.');
        return;
      }
      try {
        await performCheckin(user.token, ruleId, currentDisplayDate);
        Alert.alert('Success', 'Check-in successful! Points awarded.');
        reloadUser(); // Reload user to update points
      } catch (error) {
        Alert.alert(
          'Check-in Failed',
          checkinError || (error instanceof Error ? error.message : 'An unknown error occurred.')
        );
      }
    },
    [user?.token, performCheckin, checkinError, currentDisplayDate, reloadUser]
  );

  // Handle make-up sign action
  const handleMakeUpSign = useCallback(
    async (ruleId: number) => {
      if (!user?.token) {
        Alert.alert('Error', 'Please login to make-up sign.');
        return;
      }
      if (checkinConfig && checkinConfig.used_make_up_sign_count >= checkinConfig.max_make_up_sign_rule) {
        Alert.alert('No Make-Up Signs Left', 'You have used all your make-up sign opportunities.');
        return;
      }
      Alert.alert(
        'Confirm Make-Up Sign',
        'Are you sure you want to use a make-up sign opportunity? This will deduct points.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                await performCheckin(user.token, ruleId, currentDisplayDate);
                Alert.alert('Success', 'Make-up sign successful! Points awarded.');
                reloadUser(); // Reload user to update points
              } catch (error) {
                Alert.alert(
                  'Make-Up Sign Failed',
                  checkinError || (error instanceof Error ? error.message : 'An unknown error occurred.')
                );
              }
            },
          },
        ]
      );
    },
    [user?.token, checkinConfig, performCheckin, checkinError, currentDisplayDate, reloadUser]
  );

  // Handle calendar navigation
  const handleCalendarDateChange = useCallback(
    (direction: string) => {
      const date = new Date(currentDisplayDate);
      if (direction === 'prev') {
        date.setDate(date.getDate() - 7); // Go back one week
      } else {
        date.setDate(date.getDate() + 7); // Go forward one week
      }
      setCurrentDisplayDate(formatDate(date));
    },
    [currentDisplayDate]
  );

  const totalSignedDays = useMemo(() => {
    return checkinConfig?.rule.filter((rule) => rule.is_checkin).length || 0;
  }, [checkinConfig]);

  const userPoints = checkinConfig?.user_point || 0;
  const currencySymbol = user?.currency_symbol || '₦';

  const renderRewardSection = (
    title: string,
    rewards: Array<any>,
    type: 'accumulated' | 'daily'
  ) => {
    if (!rewards || rewards.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {rewards.map((reward, index) => (
          <View
            key={index}
            style={[styles.rewardItem, { borderColor: colors.border }]}
          >
            <View style={styles.rewardLeft}>
              {type === 'accumulated' && (
                <Text style={[styles.rewardCondition, { color: colors.textSecondary }]}>
                  Check-in {reward.checkin_count} Days
                </Text>
              )}
              {type === 'daily' && (
                <Text style={[styles.rewardCondition, { color: colors.textSecondary }]}>
                  Trade {currencySymbol}{reward.amount}
                </Text>
              )}
              <RewardIcon
                type={reward.prize_type}
                value={reward.prize}
                currencySymbol={currencySymbol}
                size={36}
                iconSize={20}
                fontSize={14}
                color={colors.primary}
              />
            </View>
            <View style={styles.rewardRight}>
              {reward.is_checkin ? (
                <Text style={[styles.claimedText, { color: colors.success }]}>
                  Claimed
                </Text>
              ) : (
                <Text style={[styles.unclaimedText, { color: colors.warning }]}>
                  Unclaimed
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTaskSection = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Tasks</Text>
        {tasks.map((task, index) => (
          <View
            key={index}
            style={[styles.taskItem, { borderColor: colors.border }]}
          >
            <View style={styles.taskLeft}>
              <Text style={[styles.taskName, { color: colors.text }]}>{task.name}</Text>
              <RewardIcon
                type={task.prize_type}
                value={task.prize}
                currencySymbol={currencySymbol}
                size={32}
                iconSize={18}
                fontSize={12}
                color={colors.primary}
              />
            </View>
            <TouchableOpacity
              style={[styles.taskButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Task Action', `Navigate to ${task.code}`)} // Placeholder for task navigation
            >
              <Text style={styles.taskButtonText}>Go</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // Calculate check-in progress
  const getCheckinProgress = () => {
    if (!checkinConfig?.rule) return { completed: 0, total: 0 };
    
    const completed = checkinConfig.rule.filter(rule => rule.is_checkin).length;
    const total = checkinConfig.rule.length;
    return { completed, total };
  };

  const progress = getCheckinProgress();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header title="Daily Check-in" showBack={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Points</Text>
            <Text style={styles.summaryValue}>{userPoints}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Signed Days</Text>
            <Text style={styles.summaryValue}>{totalSignedDays}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <TouchableOpacity
            style={styles.summaryItem}
            onPress={() => setShowMakeUpSignModal(true)}
          >
            <Text style={styles.summaryLabel}>Make-Up Signs</Text>
            <Text style={styles.summaryValue}>
              {(checkinConfig?.max_make_up_sign_rule || 0) - (checkinConfig?.used_make_up_sign_count || 0)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Check-in Calendar */}
        {configError ? (
          <View style={[styles.errorContainer, { backgroundColor: `${colors.error}10` }]}>
            <Info size={24} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {configError}
            </Text>
            <TouchableOpacity
              onPress={() => fetchCheckinConfig(user?.token || '', currentDisplayDate)}
              style={[styles.retryButton, { backgroundColor: colors.error }]}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : checkinConfig && checkinConfig.rule.length > 0 ? (
          <CheckinCalendar
            rules={checkinConfig.rule}
            onCheckin={handleCheckin}
            onMakeUpSign={handleMakeUpSign}
            currentDisplayDate={currentDisplayDate}
            onDateChange={handleCalendarDateChange}
            isLoading={isLoadingConfig}
            isCheckingIn={isCheckingIn}
            userPoints={userPoints}
            currencySymbol={currencySymbol}
            maxMakeUpSigns={checkinConfig.max_make_up_sign_rule}
            usedMakeUpSigns={checkinConfig.used_make_up_sign_count}
          />
        ) : (
          <View style={[styles.noActivityContainer, { backgroundColor: colors.card }]}>
            <CalendarCheck size={48} color={colors.textSecondary} />
            <Text style={[styles.noActivityText, { color: colors.text }]}>
              No Check-in Activity Available
            </Text>
            <Text style={[styles.noActivitySubtext, { color: colors.textSecondary }]}>
              Please check back later for new exciting check-in events!
            </Text>
          </View>
        )}

        {/* First Check-in Reward */}
        {checkinConfig?.first_checkin_reward?.enable && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>First Check-in Bonus</Text>
            <View style={[styles.rewardItem, { borderColor: colors.border }]}>
              <View style={styles.rewardLeft}>
                <Text style={[styles.rewardCondition, { color: colors.textSecondary }]}>
                  Your First Check-in
                </Text>
                <RewardIcon
                  type={checkinConfig.first_checkin_reward.prize_type}
                  value={checkinConfig.first_checkin_reward.prize}
                  currencySymbol={currencySymbol}
                  size={40}
                  iconSize={24}
                  fontSize={16}
                  color={colors.success}
                />
              </View>
              <View style={styles.rewardRight}>
                {checkinConfig.first_checkin_reward.is_checkin ? (
                  <Text style={[styles.claimedText, { color: colors.success }]}>
                    Claimed
                  </Text>
                ) : (
                  <Text style={[styles.unclaimedText, { color: colors.warning }]}>
                    Available
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Accumulated Check-in Rewards */}
        {checkinConfig?.accumulate_checkin_reward && checkinConfig.accumulate_checkin_reward.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.rewardHeader}>
              <Trophy size={20} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Consecutive Check-in Rewards
              </Text>
            </View>
            <View style={styles.accumulateRewardsList}>
              {checkinConfig.accumulate_checkin_reward.map((reward, index) => (
                <View key={index} style={[styles.accumulateRewardItem, { borderColor: colors.border }]}>
                  <View style={styles.accumulateRewardInfo}>
                    <Text style={[styles.accumulateRewardCount, { color: colors.text }]}>
                      {reward.checkin_count} Days
                    </Text>
                    <RewardIcon
                      type={reward.prize_type}
                      value={reward.prize}
                      currencySymbol={user?.currency_symbol || '₦'}
                      size={32}
                      iconSize={18}
                      fontSize={12}
                    />
                  </View>
                  {reward.is_checkin && (
                    <View style={[styles.claimedBadge, { backgroundColor: colors.success }]}>
                      <Text style={styles.claimedText}>Claimed</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Daily Accumulate Amount Rewards */}
        {checkinConfig?.daily_accumulate_amount_reward && checkinConfig.daily_accumulate_amount_reward.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.rewardHeader}>
              <Zap size={20} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Daily Trading Rewards
              </Text>
            </View>
            <View style={styles.accumulateRewardsList}>
              {checkinConfig.daily_accumulate_amount_reward.map((reward, index) => (
                <View key={index} style={[styles.accumulateRewardItem, { borderColor: colors.border }]}>
                  <View style={styles.accumulateRewardInfo}>
                    <Text style={[styles.accumulateRewardCount, { color: colors.text }]}>
                      Trade ${reward.amount}+
                    </Text>
                    <RewardIcon
                      type={reward.prize_type}
                      value={reward.prize}
                      currencySymbol={user?.currency_symbol || '₦'}
                      size={32}
                      iconSize={18}
                      fontSize={12}
                    />
                  </View>
                  {reward.is_checkin && (
                    <View style={[styles.claimedBadge, { backgroundColor: colors.success }]}>
                      <Text style={styles.claimedText}>Claimed</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Tasks */}
        {checkinConfig?.task && checkinConfig.task.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.rewardHeader}>
              <Star size={20} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Bonus Tasks
              </Text>
            </View>
            <View style={styles.tasksList}>
              {checkinConfig.task.filter(task => task.enable).map((task, index) => (
                <View key={index} style={[styles.taskItem, { borderColor: colors.border }]}>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, { color: colors.text }]}>
                      {task.name}
                    </Text>
                    <RewardIcon
                      type={task.prize_type}
                      value={task.prize}
                      currencySymbol={user?.currency_symbol || '₦'}
                      size={28}
                      iconSize={16}
                      fontSize={11}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.taskButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      // TODO: Handle task action based on task.code
                      Alert.alert('Task', `Navigate to ${task.code}`);
                    }}
                  >
                    <Text style={styles.taskButtonText}>Go</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Make-Up Sign Modal */}
      {checkinConfig && (
        <MakeUpSignModal
          visible={showMakeUpSignModal}
          onClose={() => setShowMakeUpSignModal(false)}
          makeUpRules={checkinConfig.make_up_sign_rule}
          usedCount={checkinConfig.used_make_up_sign_count}
          maxCount={checkinConfig.max_make_up_sign_rule}
        />
      )}

      <CheckinLogModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        token={user?.token || ''}
        currencySymbol={user?.currency_symbol || '₦'}
      />
    </SafeAreaWrapper>
  );
}

export default function CheckinScreen() {
  return <AuthGuard><CheckinScreenContent /></AuthGuard>;
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.xxs,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  summaryDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardCondition: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  rewardRight: {
    alignItems: 'flex-end',
  },
  claimedText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  unclaimedText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taskName: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  taskButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  taskButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: Spacing.sm,
  },
  retryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  claimedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noActivityContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: 16,
    gap: Spacing.md,
  },
  noActivityText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  noActivitySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  accumulateRewardsList: {
    gap: Spacing.sm,
  },
  accumulateRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 12,
  },
  accumulateRewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  accumulateRewardCount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    minWidth: 60,
  },
  tasksList: {
    gap: Spacing.sm,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
});