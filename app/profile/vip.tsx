import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Crown, 
  Gift,
  FileText,
  Info,
  HelpCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthGuard from '@/components/UI/AuthGuard';
import Button from '@/components/UI/Button';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useVIPStore } from '@/stores/useVIPStore';
import VIPLogList from '@/components/vip/VIPLogList';
import VIPTaskList from '@/components/vip/VIPTaskList';
import VIPLevelModal from '@/components/vip/VIPLevelModal';
import HtmlRenderer from '@/components/UI/HtmlRenderer';
import { CommonService } from '@/services/common';
import { LeadData } from '@/types';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

// 11级VIP配色
const VIP_LEVEL_COLORS: [string, string][] = [
  ['#CD7F32', '#A97142'],    // VIP 1 Bronze
  ['#C0C0C0', '#A9A9A9'],    // VIP 2 Silver
  ['#FFD700', '#DAA520'],    // VIP 3 Gold
  ['#E5E4E2', '#BCC6CC'],    // VIP 4 Platinum
  ['#B9F2FF', '#89CFF0'],    // VIP 5 Diamond
  ['#9B111E', '#FF0033'],    // VIP 6 Ruby
  ['#0F52BA', '#4682B4'],    // VIP 7 Sapphire
  ['#50C878', '#2E8B57'],    // VIP 8 Emerald
  ['#9966CC', '#8A2BE2'],    // VIP 9 Amethyst
  ['#343434', '#4F4F4F'],    // VIP 10 Obsidian
  ['#7F00FF', '#E100FF'],    // VIP 11 Celestial (or use gradient)
];

const getVIPLevelGradient = (level: number): [string, string] => {
  // level 1-11, 数组下标0-10
  return VIP_LEVEL_COLORS[Math.max(0, Math.min(level - 1, VIP_LEVEL_COLORS.length - 1))];
};

function VIPScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const {
    vipData,
    isLoadingVIP,
    vipError,
    fetchVIPInfo,
    fetchVIPDefault,
  } = useVIPStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showVIPTipsModal, setShowVIPTipsModal] = useState(false);
  
  // VIP Help Modal 状态
  const [vipHelpLoading, setVipHelpLoading] = useState(false);
  const [vipHelpError, setVipHelpError] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadData>();

  // 浮动问号按钮拖动逻辑
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [helpButtonPosition, setHelpButtonPosition] = useState({
    x: screenWidth - 60,
    y: screenHeight - 200,
  });
  const pan = useRef(new Animated.ValueXY(helpButtonPosition)).current;

  useEffect(() => {
    pan.setValue(helpButtonPosition);
  }, [helpButtonPosition]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y },
      ], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const buttonSize = 40;
        const margin = 20;
        // @ts-ignore
        let newX = pan.x._value ?? 0;
        // @ts-ignore
        let newY = pan.y._value ?? 0;
        newX = Math.max(margin, Math.min(screenWidth - buttonSize - margin, newX));
        newY = Math.max(margin, Math.min(screenHeight - buttonSize - margin, newY));
        setHelpButtonPosition({ x: newX, y: newY });
        pan.setValue({ x: newX, y: newY });
      },
    })
  ).current;

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

  // 获取VIP介绍内容
  const fetchVIPHelp = useCallback(async () => {
    setVipHelpLoading(true);
    setVipHelpError(null);
    try {
      const leadData = await CommonService.getLead('app_vip_introduction');
      setLeadData(leadData);
    } catch (error) {
      setVipHelpError('Failed to load VIP information');
    } finally {
      setVipHelpLoading(false);
    }
  }, []);

  // 处理VIP帮助按钮点击
  const handleVIPHelpPress = useCallback(() => {
    setShowVIPTipsModal(true);
    // 如果还没有加载过内容，则开始加载
    if (!leadData && !vipHelpLoading && !vipHelpError) {
      fetchVIPHelp();
    }
  }, [leadData, vipHelpLoading, vipHelpError, fetchVIPHelp]);

  const getVIPLevelColor = (level: number) => {
    // 取主色
    return getVIPLevelGradient(level)[0];
  };

  // 售卡任务对象
  const sellTask = {
    task_name: 'Sell Card Task',
    value: 0, // number 类型
    is_get: false,
    isSellTask: true,
  };
  const tasks = [sellTask, ...(vipData?.task_list || [])];
  const vipMainColor = getVIPLevelGradient(vipData?.vip_level ?? 1)[0];

  if (isLoadingVIP && !vipData) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading VIP information...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (vipError || !vipData) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
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
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
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
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Level {vipData.vip_level}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.infoButton, { backgroundColor: `${colors.primary}15` }]}
          onPress={() => setShowLogsModal(true)}
        >
          <FileText size={22} color={getVIPLevelGradient(vipData.vip_level)[0]} />
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
            </View>
            <View style={styles.vipBenefits}>
              <TouchableOpacity 
                style={[styles.infoButton, { backgroundColor: 'rgba(255,255,255,0.12)', marginLeft: 8 }]}
                onPress={() => setShowLevelsModal(true)}
              >
                <Info size={18} color={'#fff'} />
              </TouchableOpacity>
              <Text style={[styles.benefitText, { fontSize: 18, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 6 }]}>+{currentLevel?.rate || 0}% Rate Bonus</Text>
              <Text style={[styles.expText, { fontSize: 15, color: '#fff' }]}>{vipData.vip_exp.toLocaleString()} EXP</Text>
            </View>
          </View>
          {nextLevel && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: '#fff', fontWeight: 'bold' }]}>Progress to VIP {nextLevel.level}</Text>
                <Text style={[styles.progressText, { color: '#fff' }]}>{vipData.next_exp.toLocaleString()} EXP</Text>
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
          {/* 合并Rebate与USDT奖励为一行，icon缩小，并可点击跳转返利页面 */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
            activeOpacity={0.8}
            onPress={() => router.push('/wallet/rebate')}
          >
            <Gift size={14} color="#FFD700" style={{ marginRight: 5 }} />
            <Text style={{ color: '#fff', fontSize: 13, marginRight: 40 }}>
              {vipData.currency_symbol}{vipData.total_bonus.toLocaleString()}
            </Text>
            <Gift size={14} color="#26C6DA" style={{ marginRight: 5 }} />
            <Text style={{ color: '#fff', fontSize: 13 }}>
              USDT {vipData.total_bonus_usdt?.toLocaleString?.() ?? '0'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Tasks Section */}
        <VIPTaskList
          tasks={tasks}
          vipMainColor={vipMainColor}
          onSellTaskPress={() => router.push('/sell')}
        />
      </ScrollView>

      {/* VIP Levels Modal */}
      <VIPLevelModal
        visible={showLevelsModal}
        onClose={() => setShowLevelsModal(false)}
        vipInfo={vipData.vip_info}
        currentVIPLevel={vipData.vip_level}
        getVIPLevelColor={getVIPLevelColor}
      />

      {/* Logs Modal */}
      <VIPLogList visible={showLogsModal} onClose={() => setShowLogsModal(false)} />

      {/* VIP Help Modal */}
      <HtmlRenderer
        visible={showVIPTipsModal}
        onClose={() => {
          setShowVIPTipsModal(false);
          // 重置错误状态，下次可以重新尝试
          if (vipHelpError) {
            setVipHelpError(null);
          }
        }}
        title={leadData?.title || 'VIP Info'}
        htmlContent={vipHelpLoading ? 'Loading...' : vipHelpError ? `Error: ${vipHelpError}` : (leadData?.value || 'Here you can view your VIP level, experience, and exclusive benefits. Complete tasks to earn EXP and unlock higher VIP levels for more rewards!')}
      />

      {/* 浮动问号按钮 */}
      <Animated.View
        style={{
          position: 'absolute',
          left: pan.x,
          top: pan.y,
          zIndex: 100,
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={handleVIPHelpPress}
          style={[styles.helpButtonContainer, { borderColor: getVIPLevelGradient(vipData.vip_level)[0] }]}
        >
          <HelpCircle size={20} color={getVIPLevelGradient(vipData.vip_level)[0]} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaWrapper>
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
    marginBottom: Spacing.md,
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
  infoButton: {
    width: 30,
    height: 30,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
  }
});