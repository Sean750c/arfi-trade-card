import React, { useState, useEffect, useCallback } from 'react';
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

  const calculateProgress = () => {
    if (!vipData) return 0;
    
    const currentLevel = vipData.vip_info.find(info => info.level === vipData.vip_level);
    const nextLevel = vipData.vip_info.find(info => info.level === vipData.vip_level + 1);
    
    if (!currentLevel || !nextLevel) return 100;
    
    const currentExp = vipData.vip_exp - currentLevel.exp;
    const requiredExp = nextLevel.exp - currentLevel.exp;
    
    return Math.min((currentExp / requiredExp) * 100, 100);
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

  const currentLevel = vipData.vip_info.find(info => info.level === vipData.vip_level);
  const nextLevel = vipData.vip_info.find(info => info.level === vipData.vip_level + 1);
  const progress = calculateProgress();

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
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Level {vipData.vip_level} • {getVIPLevelName(vipData.vip_level)}
          </Text>
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
          colors={[getVIPLevelColor(vipData.vip_level), `${getVIPLevelColor(vipData.vip_level)}80`]}
          style={styles.vipStatusCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.vipStatusHeader}>
            <View style={styles.vipLevelContainer}>
              <Crown size={32} color="#FFFFFF" />
              <Text style={styles.vipLevelText}>
                VIP {vipData.vip_level}
              </Text>
              <Text style={styles.vipLevelName}>
                {getVIPLevelName(vipData.vip_level)}
              </Text>
            </View>
            
            <View style={styles.vipBenefits}>
              <Text style={styles.benefitText}>
                +{currentLevel?.rate || 0}% Rate Bonus
              </Text>
              <Text style={styles.expText}>
                {vipData.vip_exp.toLocaleString()} EXP
              </Text>
            </View>
          </View>

          {nextLevel && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  Progress to VIP {nextLevel.level}
                </Text>
                <Text style={styles.progressText}>
                  {vipData.next_exp.toLocaleString()} EXP needed
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${progress}%` }]} 
                />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsTableContainer}>
          <View style={styles.statsTableHeader}>
            <Text style={[styles.statsTableHeaderText, { color: colors.text }]}>Total Rebate</Text>
            <Text style={[styles.statsTableHeaderText, { color: colors.text }]}>USDT Rebate</Text>
          </View>
          <View style={styles.statsTableRow}>
            <Text style={[styles.statsTableCell, { color: colors.text }]}> 
              {vipData.currency_symbol}{vipData.total_bonus.toLocaleString()}
            </Text>
            <Text style={[styles.statsTableCell, { color: '#26C6DA' }]}> 
              USDT {vipData.total_bonus_usdt?.toLocaleString?.() ?? '0'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: `${colors.primary}15` }]}
            onPress={() => setShowTasksModal(true)}
          >
            <Target size={24} color={colors.primary} />
            <Text style={[styles.actionTitle, { color: colors.primary }]}>Complete Tasks</Text>
            <Text style={[styles.actionSubtitle, { color: colors.text }]}>Earn EXP by completing tasks</Text>
            <View style={styles.taskProgress}>
              <Text style={[styles.taskCount, { color: colors.textSecondary }]}> {vipData.task_list.filter(task => task.is_get).length}/{vipData.task_list.length} completed </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: `${colors.secondary}15` }]}
            onPress={() => setShowLogsModal(true)}
          >
            <Calendar size={24} color={colors.secondary} />
            <Text style={[styles.actionTitle, { color: colors.secondary }]}>EXP History</Text>
            <Text style={[styles.actionSubtitle, { color: colors.text }]}>View your experience log</Text>
            <View style={styles.taskProgress}>
              <Text style={[styles.taskCount, { color: colors.textSecondary }]}> {vipLogs.length} entries </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Start Trading CTA */}
        <View style={styles.ctaContainer}>
          <Button
            title="Start Trading to Earn EXP"
            onPress={() => router.push('/(tabs)/sell')}
            style={styles.ctaButton}
            rightIcon={<Zap size={20} color="#FFFFFF" />}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* VIP Levels Modal */}
      <Modal
        visible={showLevelsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLevelsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
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
          </View>
        </View>
      </Modal>

      {/* Tasks Modal */}
      <Modal
        visible={showTasksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTasksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>VIP Tasks</Text>
              <TouchableOpacity onPress={() => setShowTasksModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={vipData.task_list}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderTaskCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
            />
          </View>
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
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
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.sm,
  },
  vipLevelName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  vipBenefits: {
    alignItems: 'flex-end',
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  expText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
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
    color: 'rgba(255, 255, 255, 0.9)',
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
  statsTableContainer: {
    marginBottom: Spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#23272F',
  },
  statsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#23272F',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  statsTableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
  },
  statsTableRow: {
    flexDirection: 'row',
    backgroundColor: '#181A20',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  statsTableCell: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  taskProgress: {
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  ctaContainer: {
    marginTop: Spacing.lg,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
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
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    position: 'relative',
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
  taskCard: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
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
  loadingFooter: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});