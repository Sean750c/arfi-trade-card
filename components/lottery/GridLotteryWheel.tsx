import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Gift, Ticket, DollarSign, Zap, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import type { LotteryPrize } from '@/types';
import { RewardType } from '@/types';

interface GridLotteryWheelProps {
  prizes: LotteryPrize[];
  onSpin: () => void;                    // 只负责请求后端，不要在这里弹窗
  onSpinEnd?: () => void; // ✅ 新增：旋转结束后再回调给外部弹窗
  isSpinning: boolean;
  winningPrizeId?: number;               // 后端返回的中奖id（父组件设置到这里）
  userPoints: number;
  requiredPoints: number;
}

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = screenWidth - Spacing.lg * 2;
const CELL_SIZE = (GRID_SIZE - Spacing.sm * 2 - Spacing.xs * 6) / 3;

// 至少转动 3s
const MIN_SPIN_MS = 8000;

export default function GridLotteryWheel({
  prizes,
  onSpin,
  onSpinEnd,
  isSpinning,
  winningPrizeId,
  userPoints,
  requiredPoints,
}: GridLotteryWheelProps) {
  const { colors } = useTheme();
  const [currentHighlight, setCurrentHighlight] = useState<number>(0);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightAnim = useRef(new Animated.Value(1)).current;

  // 顶部 state 定义
  const centerPulseAnim = useRef(new Animated.Value(1)).current; // ✅ 中心按钮动画

  const [isAnimation, setIsAnimation] = useState(false);

  // 高亮绕外围的顺序（按 grid 索引）：0,1,2,5,8,7,6,3
  const animationSequence = [0, 1, 2, 5, 8, 7, 6, 3];

  // 保存“后端中奖ID”的最新值，避免闭包里读到旧值
  const winnerIdRef = useRef<number | null>(null);
  useEffect(() => {
    // console.log('winningPrizeId:' + winningPrizeId);
    winnerIdRef.current = (typeof winningPrizeId === 'number') ? winningPrizeId : null;
    // console.log('winnerIdRef.current:' + winnerIdRef.current);
  }, [winningPrizeId]);

  const PRIZE_CONFIG: Record<number, { icon: any; color: string }> = {
    [RewardType.POINTS]: { icon: Star, color: '#FFD700' },
    [RewardType.COUPON]: { icon: Ticket, color: '#FF6B6B' },
    [RewardType.CASH]: { icon: DollarSign, color: '#4ECDC4' },
    [RewardType.PHYSICAL_PRODUCT]: { icon: Gift, color: '#45B7D1' },
  };

  // 每个格子不同色，不按类型
  const CELL_COLORS = [
    '#FF8A65', // 橙
    '#4DB6AC', // 青绿
    '#FFD54F', // 黄
    '#9575CD', // 紫
    '#FFB74D', // 橙黄
    '#4FC3F7', // 蓝
    '#F06292', // 粉
    '#81C784', // 绿
  ];

  // —— 占位“未中奖”且避免相邻（仅在 prizes 变化时运行一次）——
  const insertBetterLuckPrizes = (list: LotteryPrize[]): LotteryPrize[] => {
    const result = [...list];
    const placeholders: LotteryPrize[] = [];
    let idx = 0;
    while (result.length + placeholders.length < 8) {
      idx++;
      result.push({
        id: -100 - idx,
        activity_id: 0,
        prize_name: 'Better Luck Next Time',
        prize_type: RewardType.POINTS,
        prize_value: '0',
        prize_image: '',
      });
    }
    return result;
  };

  const filledPrizes = useMemo(() => insertBetterLuckPrizes(prizes), [prizes]);

  // gridItems：外围8个 + 中间null
  const gridItems: (LotteryPrize | null)[] = useMemo(
    () => [...filledPrizes.slice(0, 4), null, ...filledPrizes.slice(4, 8)],
    [filledPrizes]
  );

  // 监听按钮是否可点击，给按钮加呼吸动画
  let loopAnim: Animated.CompositeAnimation | null = null;
  useEffect(() => {
    const canSpin = userPoints >= requiredPoints && !isSpinning;
    if (canSpin) {
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(centerPulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(centerPulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loopAnim.start();
    } else {
      loopAnim?.stop();
      centerPulseAnim.setValue(1);
    }
  }, [userPoints, requiredPoints, isSpinning]);

  useEffect(() => {
    if (isSpinning && !isAnimation) {
      startSpinAnimation();
    }
  }, [isSpinning]);

  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  // ✅ 关键：至少转 MIN_SPIN_MS，且等 winnerIdRef.current 有值后再收尾
  const startSpinAnimation = () => {
    setIsAnimation(true);
    stopAnimation();
    let seqIndex = animationSequence.indexOf(currentHighlight);
    if (seqIndex === -1) seqIndex = 0;

    const startTime = Date.now();

    const accelDuration = 1500;  // 加速阶段
    const steadyDuration = 4000; // 匀速阶段
    const minSpinTime = MIN_SPIN_MS - 2500; // 至少转够 10s - 减速时间

    let speed = 250; // 初始慢一点

    const stepOnce = () => {
      seqIndex = (seqIndex + 1) % 8;
      setCurrentHighlight(animationSequence[seqIndex]);

      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1.05, duration: 60, useNativeDriver: true }),
        Animated.timing(highlightAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      ]).start();

      const elapsed = Date.now() - startTime;
      const winnerId = winnerIdRef.current;

      if (elapsed < accelDuration) {
        // 🚀 加速：逐渐减小间隔
        const progress = elapsed / accelDuration;
        speed = 250 - (190 * progress); // 250ms → 60ms
      } else if (elapsed < accelDuration + steadyDuration) {
        // ⏱ 匀速
        speed = 60;
      } else {
        // 进入减速预备，但要保证最少转够 minSpinTime + 后端 winner 返回
        if (!winnerId || elapsed < minSpinTime) {
          speed = 70;
        } else {
          // ✅ winner 已返回 + 最少时间满足 → 进入收尾减速
          const targetGridIndex = gridItems.findIndex(
            (cell) => cell && (cell as LotteryPrize).id === winnerId
          );
          const safeTargetGridIndex =
            targetGridIndex >= 0 ? targetGridIndex : animationSequence[0];
          const targetSeqIndex = Math.max(
            0,
            animationSequence.indexOf(safeTargetGridIndex)
          );
          animateToWinningSeqIndex(seqIndex, targetSeqIndex);
          return;
        }
      }

      animationRef.current = setTimeout(stepOnce, speed);
    };

    stepOnce();
  };


  // 以“当前序列位”到“目标序列位”收尾，额外多绕1-2圈更自然
  const animateToWinningSeqIndex = (currentSeq: number, targetSeq: number) => {
    stopAnimation();
    const extraLoops = 2; // 多绕几圈再停
    const distance = extraLoops * 8 + ((targetSeq - currentSeq + 8) % 8);
    let steps = 0;
    let seq = currentSeq;

    const finishStep = () => {
      startWinningFlash();
      setIsAnimation(false);
    };

    const tick = () => {
      seq = (seq + 1) % 8;
      setCurrentHighlight(animationSequence[seq]);

      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1.05, duration: 70, useNativeDriver: true }),
        Animated.timing(highlightAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      ]).start();

      steps++;
      if (steps < distance) {
        // easeOutCubic 曲线：减速越来越慢
        const t = steps / distance;
        const ease = 1 - Math.pow(1 - t, 3);
        const slow = 70 + ease * 500; // 最快70ms → 最慢570ms
        animationRef.current = setTimeout(tick, slow);
      } else {
        animationRef.current = null;
        finishStep();
      }
    };

    tick();
  };

  const startWinningFlash = () => {
    const winningId = winnerIdRef.current;
    if (winningId == null) return;

    // console.log('gridItems:', JSON.stringify(gridItems, null, 2));

    const winningGridIndex = gridItems.findIndex(
      (cell) => cell && (cell as LotteryPrize).id === winningId
    );
    // console.log('winningGridIndex:' + winningGridIndex);
    if (winningGridIndex === -1) return;

    let flashCount = 0;
    const maxFlashes = 3;

    const flash = () => {
      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1.25, duration: 180, useNativeDriver: true }),
        Animated.timing(highlightAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        flashCount++;
        if (flashCount < maxFlashes) {
          flash();
        } else {
          // ⚡ 闪烁结束后再通知外部
          if (onSpinEnd) {
            onSpinEnd();
          }
        }
      });
    };

    setCurrentHighlight(winningGridIndex);
    flash();
  };

  const getPrizeIcon = (prizeType: number, size: number = 24) => {
    const config = PRIZE_CONFIG[prizeType] || { icon: Sparkles, color: colors.primary };
    const Icon = config.icon;
    return <Icon size={size} color="#FFFFFF" />;
  };

  const getPrizeColor = (index: number) => CELL_COLORS[index % CELL_COLORS.length];

  const renderPrizeCell = (prize: LotteryPrize | null, index: number) => {
    const isCenter = index === 4;
    const isHighlighted = currentHighlight === index;

    if (isCenter) {
      const canSpin = userPoints >= requiredPoints && !isSpinning;
      const gradientColors = canSpin
        ? ['#FF7043', '#F4511E'] as const
        : ['#BDBDBD', '#9E9E9E'] as const;
      return (
        <Animated.View
          key="center"
          style={[
            styles.centerCell,
            {
              transform: [
                { scale: centerPulseAnim }, // 呼吸动画
              ],
            },
            Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              },
              android: { elevation: 8 }
            })
          ]}
        >
          <TouchableOpacity
            style={{ width: '100%', height: '100%' }}
            onPress={onSpin}
            disabled={!canSpin}
            activeOpacity={0.8}
          >
            <LinearGradient colors={gradientColors} style={styles.gradientButton}>
              <Zap size={32} color="#FFF" />
              <Text style={styles.spinButtonText}>{isSpinning ? 'SPINNING...' : 'SPIN'}</Text>
              <Text style={styles.spinCostText}>{requiredPoints} Points</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (!prize) {
      return <View key={`empty-${index}`} style={[styles.prizeCell, { backgroundColor: colors.border }]} />;
    }

    return (
      <Animated.View
        key={prize.id}
        style={[
          styles.prizeCell,
          {
            backgroundColor: getPrizeColor(index),
            borderWidth: isHighlighted ? 3 : 0,
            transform: isHighlighted ? [{ scale: highlightAnim }] : [],
            borderColor: isHighlighted ? '#FFB74D' : 'transparent',
            shadowColor: isHighlighted ? '#FFB74D' : '#000',
            shadowOpacity: isHighlighted ? 1.0 : 0.1,
            shadowRadius: isHighlighted ? 8 : 4,
          }
        ]}
      >
        <View style={styles.prizeCellContent}>
          {getPrizeIcon(prize.prize_type, 20)}
          <Text style={styles.prizeName} numberOfLines={2}>{prize.prize_name}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { backgroundColor: colors.card }]}>
        {gridItems.map((prize, index) => renderPrizeCell(prize, index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  grid: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 20,
    padding: Spacing.sm,
  },
  prizeCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 16,
    margin: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  centerCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 24,
    margin: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 88,
    padding: Spacing.sm,
  },
  spinButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginTop: 4
  },
  spinCostText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: 2
  },
  prizeCellContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xs
  },
  prizeName: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
  ,
});
