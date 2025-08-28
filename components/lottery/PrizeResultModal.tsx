import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import { Trophy, Gift, Star, Crown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import type { LotteryDrawResult } from '@/types';

interface PrizeResultModalProps {
  visible: boolean;
  onClose: () => void;
  result: LotteryDrawResult | null;
}

export default function PrizeResultModal({
  visible,
  onClose,
  result,
}: PrizeResultModalProps) {
  const { colors } = useTheme();
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
              {result.prize_type === 4 || result.prize_type === 5
                ? 'Please contact customer support to claim your prize.'
                : 'Your prize has been added to your account!'}
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

const styles = StyleSheet.create({
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