import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Star, Gift, Ticket, DollarSign, Sparkles, Zap } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import type { LotteryPrize } from '@/types';
import { RewardType } from '@/types';

interface GridLotteryWheelProps {
  prizes: LotteryPrize[];
  onSpin: () => void;
  isSpinning: boolean;
  winningPrizeId?: number;
  userPoints: number;
  requiredPoints: number;
}

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = screenWidth - Spacing.lg * 2;
const CELL_SIZE = (GRID_SIZE - Spacing.sm * 2) / 3;

export default function GridLotteryWheel({
  prizes,
  onSpin,
  isSpinning,
  winningPrizeId,
  userPoints,
  requiredPoints,
}: GridLotteryWheelProps) {
  const { colors } = useTheme();
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const highlightAnim = useRef(new Animated.Value(1)).current;

  // 跑马灯动画序列 (顺时针)
  const animationSequence = [0, 1, 2, 5, 8, 7, 6, 3];

  useEffect(() => {
    if (isSpinning) {
      startMarqueeAnimation();
    } else {
      stopMarqueeAnimation();
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isSpinning]);

  const startMarqueeAnimation = () => {
    let step = 0;
    let speed = 100; // 初始速度
    let totalSteps = 0;
    const maxSteps = 30; // 总步数

    animationRef.current = setInterval(() => {
      setCurrentHighlight(animationSequence[step % animationSequence.length]);
      
      // 脉冲动画
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1.1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      step++;
      totalSteps++;

      // 逐渐减速
      if (totalSteps > maxSteps * 0.7) {
        speed = Math.min(speed + 20, 300);
      }

      // 停止条件
      if (totalSteps >= maxSteps) {
        stopMarqueeAnimation();
        
        // 如果有中奖奖品，高亮显示
        if (winningPrizeId) {
          const winningIndex = prizes.findIndex(p => p.id === winningPrizeId);
          if (winningIndex !== -1) {
            setCurrentHighlight(winningIndex);
            
            // 中奖闪烁动画
            Animated.loop(
              Animated.sequence([
                Animated.timing(highlightAnim, {
                  toValue: 1.2,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(highlightAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
              { iterations: 3 }
            ).start(() => {
              setCurrentHighlight(-1);
              highlightAnim.setValue(1);
            });
          }
        }
      }

      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = setInterval(arguments.callee, speed);
      }
    }, speed);
  };

  const stopMarqueeAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  };

  const getPrizeIcon = (prizeType: number, size: number = 24) => {
    switch (prizeType) {
      case RewardType.POINTS:
        return <Star size={size} color="#FFFFFF" fill="#FFFFFF" />;
      case RewardType.COUPON:
        return <Ticket size={size} color="#FFFFFF" />;
      case RewardType.CASH:
        return <DollarSign size={size} color="#FFFFFF" />;
      case RewardType.PHYSICAL_PRODUCT:
        return <Gift size={size} color="#FFFFFF" />;
      default:
        return <Sparkles size={size} color="#FFFFFF" />;
    }
  };

  const getPrizeColor = (prizeType: number) => {
    switch (prizeType) {
      case RewardType.POINTS:
        return '#FFD700';
      case RewardType.COUPON:
        return '#FF6B6B';
      case RewardType.CASH:
        return '#4ECDC4';
      case RewardType.PHYSICAL_PRODUCT:
        return '#45B7D1';
      default:
        return colors.primary;
    }
  };

  const formatPrizeValue = (prize: LotteryPrize) => {
    switch (prize.prize_type) {
      case RewardType.POINTS:
        return `${prize.prize_value}`;
      case RewardType.CASH:
        return `₦${prize.prize_value}`;
      case RewardType.COUPON:
        return 'COUPON';
      case RewardType.PHYSICAL_PRODUCT:
        return 'GIFT';
      default:
        return prize.prize_value;
    }
  };

  const renderPrizeCell = (prize: LotteryPrize | null, index: number) => {
    const isCenter = index === 4; // 中心位置
    const isHighlighted = currentHighlight === index && isSpinning;
    const isWinning = winningPrizeId && prize?.id === winningPrizeId;

    if (isCenter) {
      // 中心抽奖按钮
      return (
        <Animated.View
          key="center"
          style={[
            styles.centerCell,
            {
              backgroundColor: userPoints >= requiredPoints ? colors.primary : colors.border,
              transform: isSpinning ? [{ scale: highlightAnim }] : [],
            }
          ]}
        >
          <TouchableOpacity
            style={styles.spinButton}
            onPress={onSpin}
            disabled={isSpinning || userPoints < requiredPoints}
            activeOpacity={0.8}
          >
            <Zap size={32} color="#FFFFFF" />
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </Text>
            <Text style={styles.spinCostText}>
              {requiredPoints} Points
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (!prize) {
      return (
        <View
          key={`empty-${index}`}
          style={[styles.prizeCell, { backgroundColor: colors.border }]}
        />
      );
    }

    return (
      <Animated.View
        key={prize.id}
        style={[
          styles.prizeCell,
          {
            backgroundColor: getPrizeColor(prize.prize_type),
            borderColor: isHighlighted || isWinning ? '#FFFFFF' : 'transparent',
            borderWidth: isHighlighted || isWinning ? 3 : 0,
            transform: isHighlighted || isWinning ? [{ scale: highlightAnim }] : [],
          }
        ]}
      >
        <View style={styles.prizeCellContent}>
          {getPrizeIcon(prize.prize_type, 20)}
          <Text style={styles.prizeValue} numberOfLines={1}>
            {formatPrizeValue(prize)}
          </Text>
          <Text style={styles.prizeName} numberOfLines={2}>
            {prize.prize_name}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // 创建3x3网格，中心为抽奖按钮
  const gridItems = Array(9).fill(null).map((_, index) => {
    if (index === 4) return null; // 中心位置
    
    // 映射网格位置到奖品索引
    const prizeIndex = index > 4 ? index - 1 : index;
    return prizes[prizeIndex] || null;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { backgroundColor: colors.card }]}>
        {gridItems.map((prize, index) => renderPrizeCell(prize, index))}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.pointsInfo, { color: colors.text }]}>
          Your Points: <Text style={{ color: colors.primary, fontFamily: 'Inter-Bold' }}>
            {userPoints.toLocaleString()}
          </Text>
        </Text>
        <Text style={[styles.costInfo, { color: colors.textSecondary }]}>
          Cost per spin: {requiredPoints} points
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  grid: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 20,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  prizeCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 16,
    margin: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  centerCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 20,
    margin: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  spinButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  spinCostText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  prizeCellContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  prizeValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    marginTop: 4,
    textAlign: 'center',
  },
  prizeName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 2,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  pointsInfo: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  costInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});