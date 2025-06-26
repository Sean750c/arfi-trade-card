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
import { X, Crown, CircleCheck as CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

interface VIPLevel {
  level: number;
  bonus: string;
  requirements: string;
  benefits: string[];
}

interface VIPModalProps {
  visible: boolean;
  onClose: () => void;
  currentLevel: number;
}

const vipLevels: VIPLevel[] = [
  {
    level: 1,
    bonus: '0.25%',
    requirements: 'Default level',
    benefits: ['Basic support', 'Standard rates', 'Email notifications']
  },
  {
    level: 2,
    bonus: '0.5%',
    requirements: '$5,000+ monthly volume',
    benefits: ['Priority support', 'Enhanced rates', 'SMS notifications', 'Exclusive promotions']
  },
  {
    level: 3,
    bonus: '0.75%',
    requirements: '$15,000+ monthly volume',
    benefits: ['VIP support', 'Premium rates', 'Phone support', 'Early access to features']
  },
  {
    level: 4,
    bonus: '1.0%',
    requirements: '$50,000+ monthly volume',
    benefits: ['Dedicated manager', 'Best rates', '24/7 priority', 'Custom solutions']
  }
];

export default function VIPModal({ visible, onClose, currentLevel }: VIPModalProps) {
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
              <Crown size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                VIP Exchange Rate Benefits
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {vipLevels.map((level) => (
              <View 
                key={level.level} 
                style={[
                  styles.vipLevelCard,
                  { 
                    backgroundColor: level.level === currentLevel ? `${colors.primary}15` : 'transparent',
                    borderColor: level.level === currentLevel ? colors.primary : colors.border,
                  }
                ]}
              >
                <View style={styles.vipLevelHeader}>
                  <View style={styles.vipLevelInfo}>
                    <Text style={[styles.vipLevelTitle, { color: colors.text }]}>
                      VIP Level {level.level}
                    </Text>
                    <Text style={[styles.vipLevelBonus, { color: colors.primary }]}>
                      +{level.bonus} Exchange Rate Bonus
                    </Text>
                  </View>
                  {level.level === currentLevel && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.vipRequirements, { color: colors.textSecondary }]}>
                  Requirements: {level.requirements}
                </Text>
                
                <View style={styles.vipBenefits}>
                  {level.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
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
  vipLevelCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  vipLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  vipLevelInfo: {
    flex: 1,
  },
  vipLevelTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  vipLevelBonus: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  vipRequirements: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.sm,
  },
  vipBenefits: {
    gap: Spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
});