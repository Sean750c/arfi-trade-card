import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Modal,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Crown, 
  Star, 
  TrendingUp,
  Gift,
  Users,
  DollarSign,
  Calendar,
  Award,
  Target,
  Zap,
  CircleCheck as CheckCircle,
  Circle,
  X,
  Info,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthGuard from '@/components/UI/AuthGuard';
import Button from '@/components/UI/Button';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useVIPStore } from '@/stores/useVIPStore';
import type { VIPInfo, VIPTask, VIPLogEntry } from '@/types';
import VIPLogList from '@/components/vip/VIPLogList';

const { width } = Dimensions.get('window');

const VIP_COLORS = {
  bronze: ['#CD7F32', '#A97142'],
  silver: ['#C0C0C0', '#A8A9AD'],
  gold: ['#FFD700', '#FFB300'],
  platinum: ['#E5E4E2', '#B3B3B3'],
  diamond: ['#00CFFF', '#0078A0'],
};

const getVIPLevelGradient = (level: number): [string, string] => {
  if (level <= 2) return VIP_COLORS.bronze as [string, string];
  if (level <= 4) return VIP_COLORS.silver as [string, string];
  if (level <= 6) return VIP_COLORS.gold as [string, string];
  if (level <= 8) return VIP_COLORS.platinum as [string, string];
  return VIP_COLORS.diamond as [string, string];
};

function VIPScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const {
    vipData,
    vipLogs,
    vipDefault,
    isLoadingVIP,
    isLoadingLogs,
    isLoadingMore,
    vipError,
    logsError,
    fetchVIPInfo,
    fetchVIPLogs,
    fetchVIPDefault,
    loadMoreLogs,
  } = useVIPStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // calculateProgress函数在前，避免未定义
  const calculateProgress = () => {
    if (!vipData) return 0;
    const currentLevel = vipData.vip_info.find(info => info.level === vipData.vip_level);
    const nextLevel = vipData.vip_info.find(info => info.level === vipData.vip_level + 1);
    if (!currentLevel || !nextLevel) return 100;
    const currentExp = vipData.vip_exp - currentLevel.exp;
    const requiredExp = nextLevel.exp - currentLevel.exp;
    return Math.min((currentExp / requiredExp) * 100, 100);
  };
  // 先判空，避免vipData为null时报错
  const currentLevel = vipData?.vip_info?.find(info => info.level === vipData.vip_level);
  const nextLevel = vipData?.vip_info?.find(info => info.level === vipData.vip_level + 1);
  const progress = calculateProgress();

  // 进度条动画
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // 弹窗动画
  const levelsModalAnim = useRef(new Animated.Value(0)).current;
  const tasksModalAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (showLevelsModal) {
      Animated.timing(levelsModalAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(levelsModalAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [showLevelsModal]);
  useEffect(() => {
    if (showTasksModal) {
      Animated.timing(tasksModalAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tasksModalAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [showTasksModal]);

  useEffect(() => {
    if (user?.token) {
      fetchVIPInfo(user.token);
      fetchVIPDefault();
    }
  }, [user?.token, fetchVIPInfo, fetchVIPDefault]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;
    setRefreshing(true);
    try {
      await Promise.all([
        fetchVIPInfo(user.token),
        fetchVIPDefault(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token, fetchVIPInfo, fetchVIPDefault]);

  const handleLoadMoreLogs = useCallback(() => {
    if (user?.token) {
      loadMoreLogs(user.token);
    }
  }, [user?.token, loadMoreLogs]);

  const getVIPLevelColor = (level: number) => {
    switch (level) {
      case 1:
      case 2:
        return '#CD7F32'; // Bronze
      case 3:
      case 4:
        return '#C0C0C0'; // Silver
      case 5:
      case 6:
        return '#FFD700'; // Gold
      case 7:
      case 8:
        return '#E5E4E2'; // Platinum
      default:
        return '#00CFFF'; // Diamond
    }
  };

  const getVIPLevelName = (level: number) => {
    if (level <= 2) return 'Bronze';
    if (level <= 4) return 'Silver';
    if (level <= 6) return 'Gold';
    if (level <= 8) return 'Platinum';
    return 'Diamond';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatExpChange = (exp: number) => {
    return exp > 0 ? `+${exp}` : exp.toString();
  };

  const renderVIPLevelCard = ({ item: level }: { item: VIPInfo }) => {
    const isCurrentLevel = level.level === vipData?.vip_level;
    const isUnlocked = vipData ? level.level <= vipData.vip_level : false;
    const levelColor = getVIPLevelColor(level.level);
    return (
      <View style={[
        styles.levelCard,
        {
          backgroundColor: isCurrentLevel ? `${levelColor}22` : colors.card,
          borderColor: isCurrentLevel ? levelColor : colors.border,
          borderWidth: isCurrentLevel ? 2.5 : 1,
          shadowColor: isCurrentLevel ? levelColor : 'transparent',
          shadowOpacity: isCurrentLevel ? 0.25 : 0,
          shadowRadius: isCurrentLevel ? 12 : 0,
          elevation: isCurrentLevel ? 8 : 2,
        }
      ]}>
        <View style={styles.levelHeader}>
          <View style={[styles.levelIcon, { backgroundColor: `${levelColor}22` }]}> 
            <Crown size={24} color={levelColor} />
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelNumber, { color: levelColor, fontSize: 18, fontWeight: 'bold' }]}>VIP {level.level}</Text>
            <Text style={[styles.levelName, { color: levelColor, fontWeight: 'bold', fontSize: 13 }]}> {getVIPLevelName(level.level)} </Text>
          </View>
          {isCurrentLevel && (
            <View style={[styles.currentBadge, { backgroundColor: levelColor, shadowColor: levelColor, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}> 
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>
        <View style={styles.levelDetails}>
          <View style={styles.levelBenefit}>
            <Text style={[styles.benefitLabel, { color: colors.textSecondary }]}>Rate Bonus</Text>
            <Text style={[styles.benefitValue, { color: levelColor, fontWeight: 'bold' }]}>+{level.rate}%</Text>
          </View>
          <View style={styles.levelRequirement}>
            <Text style={[styles.requirementLabel, { color: colors.textSecondary }]}>Required EXP</Text>
            <Text style={[styles.requirementValue, { color: colors.text, fontWeight: 'bold' }]}>{level.exp.toLocaleString()}</Text>
          </View>
        </View>
        {!isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Text style={[styles.lockedText, { color: colors.textSecondary }]}>Locked</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTaskCard = ({ item: task }: { item: VIPTask }) => (
    <View style={[
      styles.taskCard,
      { 
        backgroundColor: colors.card,
        borderColor: task.is_get ? colors.success : colors.border,
      }
    ]}>
      <View style={styles.taskHeader}>
        <View style={[
          styles.taskIcon,
          { backgroundColor: task.is_get ? `${colors.success}20` : `${colors.primary}15` }
        ]}>
          {task.is_get ? (
            <CheckCircle size={20} color={colors.success} />
          ) : (
            <Circle size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskName, { color: colors.text }]}>
            {task.task_name}
          </Text>
          <Text style={[styles.taskReward, { color: task.is_get ? colors.success : colors.primary }]}>
            +{task.value} EXP
          </Text>
        </View>
        {task.is_get && (
          <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoadingVIP && !vipData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading VIP information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (vipError || !vipData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {vipError || 'Failed to load VIP information'}
          </Text>
          <Button
            title="Try Again"
            onPress={() => user?.token && fetchVIPInfo(user.token)}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.card,
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
          <Text style={[styles.title, { color: colors.text }]}>VIP Membership</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Level {vipData.vip_level} • {getVIPLevelName(vipData.vip_level)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.infoButton, { backgroundColor: `${colors.primary}15` }]}
          onPress={() => setShowLevelsModal(true)}
        >
          <Info size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* VIP Status Card */}
        <LinearGradient
          colors={getVIPLevelGradient(vipData.vip_level)}
          style={[styles.vipStatusCard, { shadowColor: getVIPLevelGradient(vipData.vip_level)[0] }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.vipStatusHeader}>
            <View style={styles.vipLevelContainer}>
              <Crown size={40} color="#fff" />
              <Text style={[styles.vipLevelText, { fontSize: 28, letterSpacing: 1, textShadowColor: '#000', textShadowRadius: 8 }]}>VIP {vipData.vip_level}</Text>
              <Text style={[styles.vipLevelName, { fontSize: 16, fontWeight: 'bold', color: '#fff', textShadowColor: '#000', textShadowRadius: 6 }]}>{getVIPLevelName(vipData.vip_level)}</Text>
            </View>
            <View style={styles.vipBenefits}>
              <Text style={[styles.benefitText, { fontSize: 18, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 6 }]}>+{currentLevel?.rate || 0}% Rate Bonus</Text>
              <Text style={[styles.expText, { fontSize: 15, color: '#fff' }]}>{vipData.vip_exp.toLocaleString()} EXP</Text>
            </View>
          </View>
          {nextLevel && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: '#fff', fontWeight: 'bold' }]}>Progress to VIP {nextLevel.level}</Text>
                <Text style={[styles.progressText, { color: '#fff' }]}>{vipData.next_exp.toLocaleString()} EXP needed</Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}> 
                <Animated.View style={[styles.progressFill, {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: '#fff',
                  shadowColor: '#fff',
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                }]} />
              </View>
            </View>
          )}
          <View style={styles.rebateRowInCard}>
            <View style={styles.rebateInCardBlock}>
              <Gift size={18} color="#FFD700" style={{ marginBottom: 2 }} />
              <Text style={styles.rebateInCardLabel}>Total Rebate</Text>
              <Text style={styles.rebateInCardAmount}>{vipData.currency_symbol}{vipData.total_bonus.toLocaleString()}</Text>
            </View>
            <View style={styles.rebateInCardBlock}>
              <Gift size={18} color="#26C6DA" style={{ marginBottom: 2 }} />
              <Text style={styles.rebateInCardLabel}>USDT Rebate</Text>
              <Text style={styles.rebateInCardAmount}>USDT {vipData.total_bonus_usdt?.toLocaleString?.() ?? '0'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* VIP Summary Area */}
        <View style={styles.vipSummaryArea}>
          {/* Actions Row */}
          <View style={styles.actionRowUnified}>
            {/* Tasks Card */}
            <TouchableOpacity
              style={styles.actionCardUnified}
              activeOpacity={0.85}
              onPress={() => setShowTasksModal(true)}
            >
              <Target size={22} color="#00CFFF" style={{ marginBottom: 6 }} />
              <Text style={styles.actionCardLabel}>Tasks</Text>
              <Text style={styles.actionCardDesc}>Completed {vipData.task_list.filter(task => task.is_get).length}/{vipData.task_list.length}</Text>
            </TouchableOpacity>
            {/* EXP Log Card */}
            <TouchableOpacity
              style={styles.actionCardUnified}
              activeOpacity={0.85}
              onPress={() => setShowLogsModal(true)}
            >
              <Calendar size={22} color="#FFD700" style={{ marginBottom: 6 }} />
              <Text style={styles.actionCardLabel}>EXP Log</Text>
              <Text style={styles.actionCardDesc}>View your EXP history</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          {/* 售卡任务按钮 */}
          <TouchableOpacity
            style={styles.taskCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/sell')}
          >
            <View style={styles.taskHeader}>
              <View style={[styles.taskIcon, { backgroundColor: `${colors.primary}15` }]}> 
                <Zap size={20} color={colors.primary} />
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskName, { color: colors.text }]}>Sell Card</Text>
                <Text style={[styles.taskReward, { color: colors.primary }]}>Go to sell page</Text>
              </View>
            </View>
          </TouchableOpacity>
          {/* 接口返回的任务 */}
          {vipData.task_list.map((task, idx) => (
            <View key={idx} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={[
                  styles.taskIcon,
                  { backgroundColor: task.is_get ? `${colors.success}20` : `${colors.primary}15` }
                ]}>
                  {task.is_get ? (
                    <CheckCircle size={20} color={colors.success} />
                  ) : (
                    <Circle size={20} color={colors.primary} />
                  )}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskName, { color: colors.text }]}>
                    {task.task_name}
                  </Text>
                  <Text style={[styles.taskReward, { color: task.is_get ? colors.success : colors.primary }]}>+{task.value} EXP</Text>
                </View>
                {task.is_get && (
                  <View style={[styles.completedBadge, { backgroundColor: colors.success }]}> 
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* VIP Levels Modal */}
      <Modal
        visible={showLevelsModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowLevelsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            { backgroundColor: colors.card },
            {
              opacity: levelsModalAnim,
              transform: [
                {
                  translateY: levelsModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>VIP Levels</Text>
              <TouchableOpacity onPress={() => setShowLevelsModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={vipData.vip_info}
              keyExtractor={(item) => item.level.toString()}
              renderItem={renderVIPLevelCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
            />
          </Animated.View>
        </View>
      </Modal>

      {/* Logs Modal */}
      <VIPLogList visible={showLogsModal} onClose={() => setShowLogsModal(false)} />
    </SafeAreaView>
  );
}

export default function VIPScreen() {
  const { colors } = useTheme();
  return (
    <AuthGuard>
      <VIPScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
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
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    color: '#B0B0B0',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  vipStatusCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  vipStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  vipLevelContainer: {
    alignItems: 'center',
  },
  vipLevelText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.sm,
  },
  vipLevelName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  vipBenefits: {
    alignItems: 'flex-end',
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  expText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  vipSummaryArea: {
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  actionRowUnified: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionCardUnified: {
    flex: 1,
    backgroundColor: '#23272F',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardLabel: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 12,
    color: '#B0B0B0',
    fontFamily: 'Inter-Regular',
  },
  tasksSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  taskCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 0,
    backgroundColor: '#23272F',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  taskReward: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  completedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    maxHeight: '80%',
    backgroundColor: '#181A20',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  modalList: {
    paddingBottom: Spacing.lg,
  },
  levelCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    position: 'relative',
    backgroundColor: '#23272F',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  levelName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  levelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelBenefit: {
    alignItems: 'center',
  },
  benefitLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  benefitValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  levelRequirement: {
    alignItems: 'center',
  },
  requirementLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  requirementValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  rebateRowInCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  rebateInCardBlock: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginHorizontal: 1,
  },
  rebateInCardLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    fontFamily: 'Inter-Bold',
    marginBottom: 0,
  },
  rebateInCardAmount: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Black',
    fontWeight: 'bold',
  },
});