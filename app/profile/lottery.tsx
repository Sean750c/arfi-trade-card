import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Zap, Trophy, Gift, Star, Sparkles, Crown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import Header from '@/components/UI/Header';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLotteryStore } from '@/stores/useLotteryStore';
import type { LotteryPrize, LotteryDrawResult } from '@/types';

const { width: screenWidth } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(screenWidth * 0.8, 300);
const WHEEL_RADIUS = WHEEL_SIZE / 2;

// Prize result modal component
function PrizeResultModal({ 
  visible, 
  onClose, 
  result, 
  colors 
}: { 
  visible: boolean; 
  onClose: () => void; 
  result: LotteryDrawResult | null;
  colors: any;
}) {
  const scaleAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scaleAnim.value = withSpring(1, { damping: 15, stiffness: 200 });
      rotateAnim.value = withSequence(
        withTiming(360, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 })
      );
    } else {
      scaleAnim.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnim.value },
      { rotate: `${rotateAnim.value}deg` }
    ],
  }));

  const getPrizeTypeIcon = (prizeType: number) => {
    switch (prizeType) {
      case 1: return <Star size={32} color="#FFD700" fill="#FFD700" />;
      case 2: return <Gift size={32} color="#10B981" />;
      case 3: return <Trophy size={32} color="#F59E0B" />;
      case 4: return <Crown size={32} color="#8B5CF6" />;
      default: return <Gift size={32} color={colors.primary} />;
    }
  };

  const getPrizeTypeColor = (prizeType: number) => {
    switch (prizeType) {
      case 1: return '#FFD700';
      case 2: return '#10B981';
      case 3: return '#F59E0B';
      case 4: return '#8B5CF6';
      default: return colors.primary;
    }
  };

  if (!result) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.prizeModal, { backgroundColor: colors.card }, animatedStyle]}>
          <LinearGradient
            colors={[getPrizeTypeColor(result.prize_type), `${getPrizeTypeColor(result.prize_type)}80`]}
            style={styles.prizeGradient}
          >
            <View style={styles.prizeIconContainer}>
              {getPrizeTypeIcon(result.prize_type)}
            </View>
            <Text style={styles.congratsText}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.prizeNameText}>{result.prize_name}</Text>
            <Text style={styles.prizeValueText}>
              {result.prize_type === 1 ? `${result.prize_value} Points` :
               result.prize_type === 2 ? `₦${result.prize_value}` :
               result.prize_type === 3 ? `$${result.prize_value}` :
               result.prize_value}
            </Text>
          </LinearGradient>
          
          <View style={styles.prizeModalContent}>
            <Text style={[styles.prizeDescription, { color: colors.textSecondary }]}>
              Your prize has been added to your account!
            </Text>
            
            <Button
              title="Awesome!"
              onPress={onClose}
              style={[styles.prizeButton, { backgroundColor: getPrizeTypeColor(result.prize_type) }]}
              fullWidth
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Lottery wheel component
function LotteryWheel({ 
  prizes, 
  isSpinning, 
  onSpin, 
  colors,
  userPoints,
  requiredPoints 
}: { 
  prizes: LotteryPrize[];
  isSpinning: boolean;
  onSpin: () => void;
  colors: any;
  userPoints: number;
  requiredPoints: number;
}) {
  const rotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const animatedWheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const spinWheel = (targetAngle: number) => {
    const spins = 5; // Number of full rotations
    const finalAngle = spins * 360 + targetAngle;
    
    rotation.value = withSequence(
      withTiming(finalAngle, { 
        duration: 3000, 
        easing: Easing.out(Easing.cubic) 
      }),
      withTiming(finalAngle, { duration: 500 })
    );
  };

  const handleSpin = () => {
    if (isSpinning || userPoints < requiredPoints) return;
    
    buttonScale.value = withSequence(
      withSpring(0.9, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    
    // Generate random target angle
    const randomAngle = Math.random() * 360;
    spinWheel(randomAngle);
    
    onSpin();
  };

  // Calculate slice angle for each prize
  const sliceAngle = 360 / prizes.length;

  // Generate wheel paths
  const generateWheelPaths = () => {
    return prizes.map((prize, index) => {
      const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);
      
      const x1 = WHEEL_RADIUS + WHEEL_RADIUS * 0.9 * Math.cos(startAngle);
      const y1 = WHEEL_RADIUS + WHEEL_RADIUS * 0.9 * Math.sin(startAngle);
      const x2 = WHEEL_RADIUS + WHEEL_RADIUS * 0.9 * Math.cos(endAngle);
      const y2 = WHEEL_RADIUS + WHEEL_RADIUS * 0.9 * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${WHEEL_RADIUS} ${WHEEL_RADIUS}`,
        `L ${x1} ${y1}`,
        `A ${WHEEL_RADIUS * 0.9} ${WHEEL_RADIUS * 0.9} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Color based on prize type
      const getSliceColor = (prizeType: number, index: number) => {
        const baseColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        return baseColors[index % baseColors.length];
      };

      return {
        path: pathData,
        color: getSliceColor(prize.prize_type, index),
        prize,
        textAngle: (startAngle + endAngle) / 2,
      };
    });
  };

  const wheelPaths = generateWheelPaths();

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.wheelWrapper}>
        <Animated.View style={[styles.wheel, animatedWheelStyle]}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            {wheelPaths.map((slice, index) => (
              <G key={index}>
                <Path
                  d={slice.path}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <SvgText
                  x={WHEEL_RADIUS + (WHEEL_RADIUS * 0.6) * Math.cos(slice.textAngle)}
                  y={WHEEL_RADIUS + (WHEEL_RADIUS * 0.6) * Math.sin(slice.textAngle)}
                  fontSize="12"
                  fill="#FFFFFF"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${(slice.textAngle * 180 / Math.PI) + 90} ${WHEEL_RADIUS + (WHEEL_RADIUS * 0.6) * Math.cos(slice.textAngle)} ${WHEEL_RADIUS + (WHEEL_RADIUS * 0.6) * Math.sin(slice.textAngle)})`}
                >
                  {slice.prize.prize_name.length > 8 ? 
                    slice.prize.prize_name.substring(0, 8) + '...' : 
                    slice.prize.prize_name}
                </SvgText>
              </G>
            ))}
          </Svg>
        </Animated.View>

        {/* Center pointer */}
        <View style={[styles.pointer, { borderBottomColor: colors.primary }]} />

        {/* Center spin button */}
        <Animated.View style={[styles.spinButtonContainer, animatedButtonStyle]}>
          <TouchableOpacity
            style={[
              styles.spinButton,
              { 
                backgroundColor: userPoints >= requiredPoints ? colors.primary : colors.border,
                shadowColor: colors.primary,
              }
            ]}
            onPress={handleSpin}
            disabled={isSpinning || userPoints < requiredPoints}
            activeOpacity={0.8}
          >
            {isSpinning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Zap size={24} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Spin cost info */}
      <View style={[styles.spinInfo, { backgroundColor: colors.card }]}>
        <Text style={[styles.spinCost, { color: colors.text }]}>
          Cost: {requiredPoints} points per spin
        </Text>
        <Text style={[
          styles.userPoints, 
          { color: userPoints >= requiredPoints ? colors.success : colors.error }
        ]}>
          Your points: {userPoints}
        </Text>
      </View>
    </View>
  );
}

function LotteryScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    lotteryActivity,
    lastDrawResult,
    isLoadingActivity,
    isDrawing,
    activityError,
    fetchLotteryActivity,
    drawLottery,
    clearLastDrawResult,
  } = useLotteryStore();

  const [showPrizeModal, setShowPrizeModal] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchLotteryActivity(user.token);
    }
  }, [user?.token, fetchLotteryActivity]);

  // Show prize modal when draw result is available
  useEffect(() => {
    if (lastDrawResult) {
      setShowPrizeModal(true);
    }
  }, [lastDrawResult]);

  const handleSpin = async () => {
    if (!user?.token || !lotteryActivity) return;

    if (lotteryActivity.user_point < lotteryActivity.point) {
      Alert.alert(
        'Insufficient Points',
        `You need ${lotteryActivity.point} points to spin. You currently have ${lotteryActivity.user_point} points.`,
        [
          { text: 'OK', style: 'default' },
          { text: 'Earn Points', onPress: () => router.push('/profile/checkin') }
        ]
      );
      return;
    }

    try {
      await drawLottery(user.token, lotteryActivity.id);
    } catch (error) {
      Alert.alert(
        'Draw Failed',
        error instanceof Error ? error.message : 'Failed to draw lottery'
      );
    }
  };

  const handlePrizeModalClose = () => {
    setShowPrizeModal(false);
    clearLastDrawResult();
  };

  const formatPrizeValue = (prize: LotteryPrize) => {
    switch (prize.prize_type) {
      case 1: return `${prize.prize_value} Points`;
      case 2: return `₦${prize.prize_value}`;
      case 3: return `$${prize.prize_value}`;
      case 4: return prize.prize_value;
      default: return prize.prize_value;
    }
  };

  const getPrizeTypeIcon = (prizeType: number) => {
    switch (prizeType) {
      case 1: return <Star size={16} color="#FFD700" />;
      case 2: return <Gift size={16} color="#10B981" />;
      case 3: return <Trophy size={16} color="#F59E0B" />;
      case 4: return <Crown size={16} color="#8B5CF6" />;
      default: return <Gift size={16} color={colors.primary} />;
    }
  };

  if (isLoadingActivity) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <Header title="Lucky Draw" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading lottery activity...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (activityError || !lotteryActivity) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <Header title="Lucky Draw" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {activityError || 'No lottery activity available'}
          </Text>
          <Button
            title="Retry"
            onPress={() => user?.token && fetchLotteryActivity(user.token)}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <Header title="Lucky Draw" subtitle="Spin to win amazing prizes!" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Activity Info Card */}
        <LinearGradient
          colors={[colors.primary, '#6366F1']}
          style={styles.activityCard}
        >
          <View style={styles.activityHeader}>
            <Trophy size={24} color="#FFFFFF" />
            <Text style={styles.activityTitle}>{lotteryActivity.name}</Text>
          </View>
          <Text style={styles.activityDescription}>
            {lotteryActivity.desc}
          </Text>
          <View style={styles.activityStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lotteryActivity.user_point}</Text>
              <Text style={styles.statLabel}>Your Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lotteryActivity.point}</Text>
              <Text style={styles.statLabel}>Cost per Spin</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lotteryActivity.prizes.length}</Text>
              <Text style={styles.statLabel}>Total Prizes</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Lottery Wheel */}
        <Card style={styles.wheelCard}>
          <LotteryWheel
            prizes={lotteryActivity.prizes}
            isSpinning={isDrawing}
            onSpin={handleSpin}
            colors={colors}
            userPoints={lotteryActivity.user_point}
            requiredPoints={lotteryActivity.point}
          />
        </Card>

        {/* Prize List */}
        <Card style={styles.prizeListCard}>
          <View style={styles.prizeListHeader}>
            <Sparkles size={20} color={colors.primary} />
            <Text style={[styles.prizeListTitle, { color: colors.text }]}>
              Available Prizes
            </Text>
          </View>
          
          <View style={styles.prizeGrid}>
            {lotteryActivity.prizes.map((prize, index) => (
              <View
                key={prize.id}
                style={[
                  styles.prizeItem,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }
                ]}
              >
                <View style={styles.prizeItemHeader}>
                  {getPrizeTypeIcon(prize.prize_type)}
                  <Text style={[styles.prizeItemName, { color: colors.text }]}>
                    {prize.prize_name}
                  </Text>
                </View>
                <Text style={[styles.prizeItemValue, { color: colors.primary }]}>
                  {formatPrizeValue(prize)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* How to Earn Points */}
        <Card style={styles.earnPointsCard}>
          <View style={styles.earnPointsHeader}>
            <Star size={20} color={colors.warning} />
            <Text style={[styles.earnPointsTitle, { color: colors.text }]}>
              How to Earn Points
            </Text>
          </View>
          
          <View style={styles.earnPointsList}>
            <TouchableOpacity 
              style={styles.earnPointsItem}
              onPress={() => router.push('/profile/checkin')}
            >
              <Text style={[styles.earnPointsText, { color: colors.textSecondary }]}>
                📅 Daily Check-in
              </Text>
              <ChevronLeft 
                size={16} 
                color={colors.primary} 
                style={{ transform: [{ rotate: '180deg' }] }} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.earnPointsItem}
              onPress={() => router.push('/(tabs)/sell')}
            >
              <Text style={[styles.earnPointsText, { color: colors.textSecondary }]}>
                💳 Complete Orders
              </Text>
              <ChevronLeft 
                size={16} 
                color={colors.primary} 
                style={{ transform: [{ rotate: '180deg' }] }} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.earnPointsItem}
              onPress={() => router.push('/refer')}
            >
              <Text style={[styles.earnPointsText, { color: colors.textSecondary }]}>
                👥 Invite Friends
              </Text>
              <ChevronLeft 
                size={16} 
                color={colors.primary} 
                style={{ transform: [{ rotate: '180deg' }] }} 
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Activity Period */}
        <View style={[styles.activityPeriod, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.activityPeriodText, { color: colors.text }]}>
            Activity Period: {new Date(lotteryActivity.start_time * 1000).toLocaleDateString()} - {new Date(lotteryActivity.end_time * 1000).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      {/* Prize Result Modal */}
      <PrizeResultModal
        visible={showPrizeModal}
        onClose={handlePrizeModalClose}
        result={lastDrawResult}
        colors={colors}
      />
    </SafeAreaWrapper>
  );
}

export default function LotteryScreen() {
  return (
    <AuthGuard>
      <LotteryScreenContent />
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
    paddingHorizontal: Spacing.xl,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Activity Card
  activityCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  activityTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },

  // Wheel
  wheelCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  wheelContainer: {
    alignItems: 'center',
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pointer: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    zIndex: 10,
  },
  spinButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
    zIndex: 10,
  },
  spinButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  spinInfo: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  spinCost: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  userPoints: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },

  // Prize List
  prizeListCard: {
    marginBottom: Spacing.lg,
  },
  prizeListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  prizeListTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  prizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  prizeItem: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  prizeItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  prizeItemName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  prizeItemValue: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },

  // Earn Points
  earnPointsCard: {
    marginBottom: Spacing.lg,
  },
  earnPointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  earnPointsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  earnPointsList: {
    gap: Spacing.sm,
  },
  earnPointsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  earnPointsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  // Activity Period
  activityPeriod: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  activityPeriodText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  // Prize Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeModal: {
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  prizeGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  prizeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  congratsText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  prizeNameText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  prizeValueText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  prizeModalContent: {
    padding: Spacing.xl,
  },
  prizeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  prizeButton: {
    height: 48,
    borderRadius: 12,
  },
});