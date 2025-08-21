import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  Gift, 
  Trophy, 
  Star, 
  CheckCircle, 
  Clock,
  Zap,
  Target,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import Header from '@/components/UI/Header';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCheckinStore } from '@/stores/useCheckinStore';
import { useTheme } from '@/theme/ThemeContext';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import type { CheckinRule, CheckinTask, AccumulateCheckinReward } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

function CheckinScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    checkinConfig,
    isLoadingConfig,
    isCheckingIn,
    configError,
    checkinError,
    fetchCheckinConfig,
    performCheckin,
  } = useCheckinStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.token) {
      fetchCheckinConfig(user.token, selectedDate);
    }
  }, [user?.token, selectedDate, fetchCheckinConfig]);

  const handleCheckin = async (rule: CheckinRule) => {
    if (!user?.token || rule.is_checkin) return;

    try {
      await performCheckin(user.token, rule.id, selectedDate);
      Alert.alert(
        'Check-in Successful! 🎉',
        `You've earned ${rule.base_reward} points + ${rule.extra_reward} bonus points!`,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Check-in Failed',
        error instanceof Error ? error.message : 'Failed to check in. Please try again.'
      );
    }
  };

  const formatRewardText = (reward: string, type: number) => {
    switch (type) {
      case 1:
        return `${reward} Points`;
      case 2:
        return `${user?.currency_symbol}${reward}`;
      case 3:
        return `${reward} EXP`;
      default:
        return reward;
    }
  };

  const getWeekdayName = (dayNumber: number) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays[(dayNumber - 1) % 7];
  };

  const renderCheckinCalendar = () => {
    if (!checkinConfig?.rule) return null;

    return (
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Calendar size={20} color={colors.primary} />
          <Text style={[styles.calendarTitle, { color: colors.text }]}>
            Weekly Check-in Calendar
          </Text>
        </View>

        <View style={styles.calendarGrid}>
          {checkinConfig.rule.map((rule) => {
            const isToday = rule.date === selectedDate;
            const canCheckin = !rule.is_checkin && isToday;
            const isCompleted = rule.is_checkin;
            
            return (
              <TouchableOpacity
                key={rule.id}
                style={[
                  styles.calendarDay,
                  {
                    backgroundColor: isCompleted 
                      ? colors.success 
                      : canCheckin 
                        ? colors.primary 
                        : colors.card,
                    borderColor: isToday ? colors.primary : colors.border,
                    borderWidth: isToday ? 2 : 1,
                  }
                ]}
                onPress={() => canCheckin ? handleCheckin(rule) : null}
                disabled={!canCheckin || isCheckingIn}
                activeOpacity={canCheckin ? 0.8 : 1}
              >
                <Text style={[
                  styles.dayNumber,
                  { 
                    color: isCompleted || canCheckin ? '#FFFFFF' : colors.text 
                  }
                ]}>
                  Day {rule.day_number}
                </Text>
                <Text style={[
                  styles.dayName,
                  { 
                    color: isCompleted || canCheckin ? 'rgba(255,255,255,0.8)' : colors.textSecondary 
                  }
                ]}>
                  {getWeekdayName(rule.day_number)}
                </Text>
                
                <View style={styles.rewardContainer}>
                  <Text style={[
                    styles.rewardText,
                    { 
                      color: isCompleted || canCheckin ? '#FFFFFF' : colors.primary 
                    }
                  ]}>
                    +{rule.base_reward}
                  </Text>
                  {parseInt(rule.extra_reward) > 0 && (
                    <Text style={[
                      styles.bonusText,
                      { 
                        color: isCompleted || canCheckin ? '#FFD700' : colors.warning 
                      }
                    ]}>
                      +{rule.extra_reward}
                    </Text>
                  )}
                </View>

                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <CheckCircle size={16} color="#FFFFFF" />
                  </View>
                )}

                {canCheckin && (
                  <View style={styles.checkinButton}>
                    {isCheckingIn ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Zap size={16} color="#FFFFFF" />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
    );
  };

  const renderAccumulateRewards = () => {
    if (!checkinConfig?.accumulate_checkin_reward?.length) return null;

    return (
      <Card style={styles.rewardsCard}>
        <View style={styles.rewardsHeader}>
          <Trophy size={20} color={colors.primary} />
          <Text style={[styles.rewardsTitle, { color: colors.text }]}>
            Accumulate Rewards
          </Text>
        </View>

        <View style={styles.rewardsList}>
          {checkinConfig.accumulate_checkin_reward.map((reward, index) => (
            <View
              key={index}
              style={[
                styles.rewardItem,
                {
                  backgroundColor: reward.is_checkin 
                    ? `${colors.success}15` 
                    : colors.background,
                  borderColor: reward.is_checkin ? colors.success : colors.border,
                }
              ]}
            >
              <View style={styles.rewardInfo}>
                <Text style={[styles.rewardCount, { color: colors.text }]}>
                  {reward.checkin_count} Days
                </Text>
                <Text style={[styles.rewardPrize, { color: colors.primary }]}>
                  {formatRewardText(reward.prize, parseInt(reward.prize_type))}
                </Text>
              </View>
              
              {reward.is_checkin ? (
                <View style={[styles.claimedBadge, { backgroundColor: colors.success }]}>
                  <CheckCircle size={16} color="#FFFFFF" />
                  <Text style={styles.claimedText}>Claimed</Text>
                </View>
              ) : (
                <View style={[styles.progressBadge, { backgroundColor: colors.border }]}>
                  <Clock size={16} color={colors.textSecondary} />
                </View>
              )}
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderTasks = () => {
    if (!checkinConfig?.task?.length) return null;

    return (
      <Card style={styles.tasksCard}>
        <View style={styles.tasksHeader}>
          <Target size={20} color={colors.primary} />
          <Text style={[styles.tasksTitle, { color: colors.text }]}>
            Bonus Tasks
          </Text>
        </View>

        <View style={styles.tasksList}>
          {checkinConfig.task.map((task, index) => (
            <View
              key={index}
              style={[
                styles.taskItem,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }
              ]}
            >
              <View style={styles.taskInfo}>
                <Text style={[styles.taskName, { color: colors.text }]}>
                  {task.name}
                </Text>
                <Text style={[styles.taskReward, { color: colors.primary }]}>
                  +{formatRewardText(task.prize, task.prize_type)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.taskButton,
                  { 
                    backgroundColor: task.enable ? colors.primary : colors.border,
                    opacity: task.enable ? 1 : 0.6,
                  }
                ]}
                disabled={!task.enable}
              >
                <Text style={styles.taskButtonText}>
                  {task.enable ? 'Complete' : 'Completed'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderStats = () => {
    if (!checkinConfig) return null;

    const todayRule = checkinConfig.rule.find(rule => rule.date === selectedDate);
    const completedDays = checkinConfig.rule.filter(rule => rule.is_checkin).length;
    const totalDays = checkinConfig.rule.length;

    return (
      <LinearGradient
        colors={[colors.primary, '#00A65A']}
        style={styles.statsCard}
      >
        <View style={styles.statsHeader}>
          <Award size={24} color="#FFFFFF" />
          <Text style={styles.statsTitle}>Your Progress</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{checkinConfig.user_point}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedDays}/{totalDays}</Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {checkinConfig.max_make_up_sign_rule - checkinConfig.used_make_up_sign_count}
            </Text>
            <Text style={styles.statLabel}>Make-up Left</Text>
          </View>
        </View>

        {todayRule && !todayRule.is_checkin && (
          <TouchableOpacity
            style={styles.todayCheckinButton}
            onPress={() => handleCheckin(todayRule)}
            disabled={isCheckingIn}
          >
            {isCheckingIn ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Zap size={20} color={colors.primary} />
            )}
            <Text style={[styles.todayCheckinText, { color: colors.primary }]}>
              {isCheckingIn ? 'Checking in...' : 'Check in Today'}
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    );
  };

  if (isLoadingConfig) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <Header title="Daily Check-in" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading check-in data...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (configError) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <Header title="Daily Check-in" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {configError}
          </Text>
          <Button
            title="Retry"
            onPress={() => user?.token && fetchCheckinConfig(user.token, selectedDate)}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header title="Daily Check-in" subtitle="Earn points every day" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Card */}
        {renderStats()}

        {/* Check-in Calendar */}
        {renderCheckinCalendar()}

        {/* Accumulate Rewards */}
        {renderAccumulateRewards()}

        {/* Bonus Tasks */}
        {renderTasks()}

        {/* Activity Info */}
        {checkinConfig && (
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Star size={20} color={colors.primary} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                {checkinConfig.name}
              </Text>
            </View>
            
            <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
              {checkinConfig.desc}
            </Text>

            <View style={styles.activityPeriod}>
              <Text style={[styles.periodLabel, { color: colors.textSecondary }]}>
                Activity Period:
              </Text>
              <Text style={[styles.periodText, { color: colors.text }]}>
                {new Date(checkinConfig.start_time * 1000).toLocaleDateString()} - {' '}
                {new Date(checkinConfig.end_time * 1000).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

export default function CheckinScreen() {
  return (
    <AuthGuard>
      <CheckinScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Stats Card
  statsCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  todayCheckinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  todayCheckinText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Calendar Card
  calendarCard: {
    marginBottom: Spacing.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  calendarTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  calendarDay: {
    width: (screenWidth - Spacing.lg * 2 - Spacing.md * 2 - Spacing.sm * 6) / 7,
    aspectRatio: 0.8,
    borderRadius: 12,
    padding: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  dayName: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  rewardContainer: {
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  bonusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  completedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  checkinButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },

  // Rewards Card
  rewardsCard: {
    marginBottom: Spacing.lg,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  rewardsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  rewardsList: {
    gap: Spacing.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardCount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  rewardPrize: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    gap: 4,
  },
  claimedText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  progressBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tasks Card
  tasksCard: {
    marginBottom: Spacing.lg,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tasksTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  tasksList: {
    gap: Spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  taskReward: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  taskButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  taskButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },

  // Info Card
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  activityPeriod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  periodLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  periodText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
});