import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { X, Trophy, Star, Gift } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ActivityModal({ visible, onClose }: ActivityModalProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Trophy size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Activity Rebate Program
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.rebateInfo}>
              <Text style={[styles.rebateTitle, { color: colors.text }]}>
                Earn Cashback on Every Trade
              </Text>
              <Text style={[styles.rebateDescription, { color: colors.textSecondary }]}>
                Get up to 2% cashback based on your monthly trading volume and VIP level.
              </Text>
              
              <View style={styles.rebateTiers}>
                <View style={[styles.rebateTier, { backgroundColor: `${colors.warning}15` }]}>
                  <View style={styles.tierIcon}>
                    <Star size={20} color={colors.warning} />
                  </View>
                  <Text style={[styles.rebateTierTitle, { color: colors.warning }]}>Bronze Tier</Text>
                  <Text style={[styles.rebateTierAmount, { color: colors.text }]}>0.5% Cashback</Text>
                  <Text style={[styles.rebateTierRequirement, { color: colors.textSecondary }]}>
                    $1,000+ monthly
                  </Text>
                </View>
                
                <View style={[styles.rebateTier, { backgroundColor: `${colors.textSecondary}15` }]}>
                  <View style={styles.tierIcon}>
                    <Gift size={20} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.rebateTierTitle, { color: colors.textSecondary }]}>Silver Tier</Text>
                  <Text style={[styles.rebateTierAmount, { color: colors.text }]}>1.0% Cashback</Text>
                  <Text style={[styles.rebateTierRequirement, { color: colors.textSecondary }]}>
                    $5,000+ monthly
                  </Text>
                </View>
                
                <View style={[styles.rebateTier, { backgroundColor: `${colors.primary}15` }]}>
                  <View style={styles.tierIcon}>
                    <Trophy size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.rebateTierTitle, { color: colors.primary }]}>Gold Tier</Text>
                  <Text style={[styles.rebateTierAmount, { color: colors.text }]}>2.0% Cashback</Text>
                  <Text style={[styles.rebateTierRequirement, { color: colors.textSecondary }]}>
                    $15,000+ monthly
                  </Text>
                </View>
              </View>

              <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
                <Text style={[styles.infoTitle, { color: colors.primary }]}>How It Works</Text>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  • Cashback is calculated monthly based on your total trading volume{'\n'}
                  • Rewards are automatically credited to your account{'\n'}
                  • Higher VIP levels unlock better cashback rates{'\n'}
                  • No minimum withdrawal amount for cashback rewards
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  rebateInfo: {
    gap: Spacing.lg,
  },
  rebateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  rebateDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  rebateTiers: {
    gap: Spacing.md,
  },
  rebateTier: {
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    gap: Spacing.xs,
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  rebateTierTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  rebateTierAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  rebateTierRequirement: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  infoBox: {
    padding: Spacing.lg,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});