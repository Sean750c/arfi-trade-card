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
  onSpinEnd?: (prize: LotteryPrize) => void; // ✅ 新增：旋转结束后再回调给外部弹窗
  isSpinning: boolean;
  winningPrizeId?: number;               // 后端返回的中奖id（父组件设置到这里）
  userPoints: number;
  requiredPoints: number;
}

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = screenWidth - Spacing.lg * 2;
const CELL_SIZE = (GRID_SIZE - Spacing.sm * 2 - Spacing.xs * 6) / 3;

// 至少转动 3s
const MIN_SPIN_MS = 3000;

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

  // 高亮绕外围的顺序（按 grid 索引）：0,1,2,5,8,7,6,3
  const animationSequence = [0, 1, 2, 5, 8, 7, 6, 3];

  // 保存“后端中奖ID”的最新值，避免闭包里读到旧值
  const winnerIdRef = useRef<number | null>(null);
  useEffect(() => {
    console.log("winningPrizeId变化, 修改当前奖励:" + winningPrizeId);
    winnerIdRef.current = (typeof winningPrizeId === 'number') ? winningPrizeId : null;
  }, [winningPrizeId]);

  const PRIZE_CONFIG: Record<number, { icon: any; color: string }> = {
    [RewardType.POINTS]: { icon: Star, color: '#FFD700' },
    [RewardType.COUPON]: { icon: Ticket, color: '#FF6B6B' },
    [RewardType.CASH]: { icon: DollarSign, color: '#4ECDC4' },
    [RewardType.PHYSICAL_PRODUCT]: { icon: Gift, color: '#45B7D1' },
  };

  // 每个格子不同色，不按类型
  const CELL_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#F0932B', '#22A6B3', '#E84393', '#2ECC71'];

  // —— 占位“未中奖”且避免相邻（仅在 prizes 变化时运行一次）——
  const insertBetterLuckPrizes = (list: LotteryPrize[]): LotteryPrize[] => {
    const result = [...list];
    const placeholders: LotteryPrize[] = [];
    while (result.length + placeholders.length < 8) {
      placeholders.push({
        id: -100 - placeholders.length,
        activity_id: 0,
        prize_name: 'Better Luck Next Time',
        prize_type: RewardType.POINTS,
        prize_value: '0',
        prize_image: '',
      });
    }
    for (const ph of placeholders) {
      let idx;
      let tryCnt = 0;
      do {
        idx = Math.floor(Math.random() * (result.length + 1));
        tryCnt++;
        if (tryCnt > 20) break; // 兜底，避免极端死循环
      } while (
        result[idx]?.prize_name === 'Better Luck Next Time' ||
        result[idx - 1]?.prize_name === 'Better Luck Next Time'
      );
      result.splice(Math.max(0, idx), 0, ph);
    }
    return result;
  };

  const filledPrizes = useMemo(() => insertBetterLuckPrizes(prizes), [prizes]);

  // gridItems：外围8个 + 中间null
  const gridItems: (LotteryPrize | null)[] = useMemo(
    () => [...filledPrizes.slice(0, 4), null, ...filledPrizes.slice(4, 8)],
    [filledPrizes]
  );

  useEffect(() => {
    console.log('isSpinning状态变化:' + isSpinning);
    if (isSpinning && animationRef.current == null) startSpinAnimation();
  }, [isSpinning]);

  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  // ✅ 关键：至少转 MIN_SPIN_MS，且等 winnerIdRef.current 有值后再收尾
  const startSpinAnimation = () => {
    console.log("开始抽奖动画:" + isSpinning);
    stopAnimation();
    let seqIndex = animationSequence.indexOf(currentHighlight);
    if (seqIndex === -1) seqIndex = 0;

    const startTime = Date.now();
    let speed = 60; // 起步速度(越小越快)

    const stepOnce = () => {
      // 下一个序列位
      seqIndex = (seqIndex + 1) % 8;
      setCurrentHighlight(animationSequence[seqIndex]);

      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1.12, duration: 60, useNativeDriver: true }),
        Animated.timing(highlightAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      ]).start();

      const elapsed = Date.now() - startTime;
      const winnerId = winnerIdRef.current;

      //console.log('elapsed:' + elapsed + ' MIN_SPIN_MS:' + MIN_SPIN_MS + ' winnerId:' + winnerId);

      // 满足：已到最少时间 且 后端已返回中奖id → 进入收尾对准
      if (elapsed >= MIN_SPIN_MS && winnerId != null) {
        const targetGridIndex = gridItems.findIndex(
          (cell) => cell && (cell as LotteryPrize).id === winnerId
        );
        // 找不到就兜底到第一个
        const safeTargetGridIndex = targetGridIndex >= 0 ? targetGridIndex : animationSequence[0];
        const targetSeqIndex = Math.max(0, animationSequence.indexOf(safeTargetGridIndex));
        animateToWinningSeqIndex(seqIndex, targetSeqIndex);
        return;
      }

      // 继续跑圈：逐步加速→减速（简单线性即可）
      speed = Math.min(140, speed + 4);
      animationRef.current = setTimeout(stepOnce, speed);
    };
    stepOnce();
  };

  // 以“当前序列位”到“目标序列位”收尾，额外多绕1-2圈更自然
  const animateToWinningSeqIndex = (currentSeq: number, targetSeq: number) => {
    stopAnimation();
    const extraLoops = 2; // 多绕圈
    const distance = (extraLoops * 8) + ((targetSeq - currentSeq + 8) % 8);
    let steps = 0;
    let seq = currentSeq;

    const finishStep = () => {
      // 闪烁一下并回调给外部
      startWinningFlash();
      const targetGridIndex = animationSequence[targetSeq];
      const prize = gridItems[targetGridIndex] as LotteryPrize | null;
      if (prize && onSpinEnd) onSpinEnd(prize); // ✅ 停止后才通知外部弹窗
    };

    const tick = () => {
      seq = (seq + 1) % 8;
      setCurrentHighlight(animationSequence[seq]);

      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1.18, duration: 70, useNativeDriver: true }),
        Animated.timing(highlightAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      ]).start();

      steps++;
      if (steps < distance) {
        // 收尾阶段逐步减速
        const base = 80;
        const slow = Math.min(240, base + Math.floor((steps / distance) * 160));
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

    const winningGridIndex = gridItems.findIndex(
      (cell) => cell && (cell as LotteryPrize).id === winningId
    );
    if (winningGridIndex === -1) return;

    let flashCount = 0;
    const maxFlashes = 3;

    const flash = () => {
      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1.25, duration: 180, useNativeDriver: true }),
        Animated.timing(highlightAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        flashCount++;
        if (flashCount < maxFlashes) flash();
        // else startIdleAnimation();
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
      return (
        <Animated.View
          key="center"
          style={[
            styles.centerCell,
            Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              },
              android: { elevation: 8 }
            }),
            canSpin ? { transform: [{ scale: highlightAnim }] } : {}
          ]}
        >
          <TouchableOpacity
            style={{ width: '100%', height: '100%' }}
            onPress={onSpin}
            disabled={!canSpin}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FF7F50', '#FF6347']} style={styles.gradientButton}>
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
            borderColor: isHighlighted ? '#FFF' : 'transparent',
            transform: isHighlighted ? [{ scale: highlightAnim }] : [],
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
      <View style={styles.infoContainer}>
        <Text style={[styles.pointsInfo, { color: colors.text }]}>
          Your Points: <Text style={{ color: colors.primary, fontFamily: 'Inter-Bold' }}>{userPoints.toLocaleString()}</Text>
        </Text>
        <Text style={[styles.costInfo, { color: colors.textSecondary }]}>
          Cost per spin: {requiredPoints} points
        </Text>
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
  spinButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter-Bold', marginTop: 4 },
  spinCostText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontFamily: 'Inter-Medium', marginTop: 2 },
  prizeCellContent: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xs },
  prizeName: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontFamily: 'Inter-Medium', textAlign: 'center', marginTop: 2 },
  infoContainer: { alignItems: 'center', marginTop: Spacing.lg, gap: Spacing.xs },
  pointsInfo: { fontSize: 16, fontFamily: 'Inter-Medium' },
  costInfo: { fontSize: 14, fontFamily: 'Inter-Regular' },
});
