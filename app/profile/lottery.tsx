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
import { ChevronLeft, Zap, Trophy, Gift, Star, Sparkles, Crown, History, RefreshCw } from 'lucide-react-native';
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
import GridLotteryWheel from '@/components/lottery/GridLotteryWheel';
import LotteryLogsModal from '@/components/lottery/LotteryLogsModal';
import AuthGuard from '@/components/UI/AuthGuard';
import Header from '@/components/UI/Header';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLotteryStore } from '@/stores/useLotteryStore';
import { LotteryPrize, LotteryDrawResult, RewardType } from '@/types';
import PointLogsModal from '@/components/checkin/PointLogsModal';

const { width: screenWidth } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(screenWidth * 0.8, 300);
const WHEEL_RADIUS = WHEEL_SIZE / 2;

// Prize result modal component
function PrizeResultModal({
  visible,
  onClose,
  result,
  currencySymbol = '₦',
  colors
}: {
  visible: boolean;
  onClose: () => void;
  result: LotteryDrawResult | null;
  currencySymbol: string;
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

  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  const [isSpinning, setIsSpinning] = useState(false);

  const [showPointLogsModal, setShowPointLogsModal] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchLotteryActivity(user.token);
    }
  }, [user?.token, fetchLotteryActivity]);

  // Show prize modal when draw result is available
  useEffect(() => {
    if (lastDrawResult && !isSpinning) {
      setShowPrizeModal(true);
    }
  }, [lastDrawResult, isSpinning]);

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
      setIsSpinning(true);
      await drawLottery(user.token, lotteryActivity.id);
    } catch (error) {
      setIsSpinning(false);
      Alert.alert(
        'Draw Failed',
        'Failed to draw lottery: please contact customer service'
      );
    }
  };

  const handlePrizeModalClose = () => {
    setShowPrizeModal(false);
    clearLastDrawResult();
    if (user?.token) {
      fetchLotteryActivity(user.token);
    }
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

  const refreshActivity = () => {
    if (user?.token) {
      fetchLotteryActivity(user.token);
    }
  }

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Lucky Draw</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Test your luck and win amazing prizes!
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowLogsModal(true)}
            style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <History size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={refreshActivity}
            style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <RefreshCw size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Activity Info Card */}
        <LinearGradient
          colors={[colors.primary, '#6366F1']}
          style={styles.activityCard}
        >
          <View style={styles.activityStats}>

            <TouchableOpacity
              style={[styles.statItem, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => setShowPointLogsModal(true)}
            >
              <Text style={styles.statValue}>{lotteryActivity.user_point}</Text>
              <Text style={styles.statLabel}>Your Points</Text>
            </TouchableOpacity>

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
        <GridLotteryWheel
          prizes={lotteryActivity.prizes}
          onSpin={handleSpin}
          onSpinEnd={() => {
            // 👉 只在这里弹窗，这时已至少转了3秒并准确停在中奖格
            setIsSpinning(false);
          }}
          isSpinning={isSpinning}
          winningPrizeId={lastDrawResult?.id}
          userPoints={lotteryActivity.user_point}
          requiredPoints={lotteryActivity.point}
        />

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
          </View>
        </Card>

        {/* Activity Period */}
        <View style={[styles.activityPeriod, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.activityPeriodText, { color: colors.text }]}>
            Activity Period: {new Date(lotteryActivity.start_time * 1000).toLocaleDateString()} - {new Date(lotteryActivity.end_time * 1000).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      {/* Lottery Logs Modal */}
      <LotteryLogsModal
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />

      {/* Prize Result Modal */}
      <PrizeResultModal
        visible={showPrizeModal}
        onClose={handlePrizeModalClose}
        result={lastDrawResult}
        currencySymbol={user?.currency_symbol || '₦'}
        colors={colors}
      />

      <PointLogsModal
        visible={showPointLogsModal}
        onClose={() => setShowPointLogsModal(false)}
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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