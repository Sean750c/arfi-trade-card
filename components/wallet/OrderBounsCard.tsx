import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { 
  DollarSign, 
  Info,
  X,
} from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

interface OrderBounsCardProps {
  visible: boolean;
  onClose: () => void;
  bonusData: Array<{ bonus_amount: number; order_amount: number }>;
  currencySymbol: string;
}

export default function OrderBounsCard({ visible, onClose, bonusData, currencySymbol }: OrderBounsCardProps) {
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
            <View style={styles.modalTitleContainer}>
              <DollarSign size={20} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Amount Order Bonus
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Earn bonus rewards based on your order amount. The more you trade, the more you earn!
            </Text>
            
            <View style={styles.bonusTiers}>
              {bonusData.map((bonus, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.bonusTier, 
                    { 
                      backgroundColor: `${colors.primary}10`,
                      borderColor: colors.border,
                    }
                  ]}
                >
                  <View style={styles.bonusTierContent}>
                    <Text style={[styles.bonusTierAmount, { color: colors.primary }]}>
                      {currencySymbol}{bonus.bonus_amount}
                    </Text>
                    <Text style={[styles.bonusTierLabel, { color: colors.text }]}>
                      Bonus Reward
                    </Text>
                  </View>
                  <View style={styles.bonusTierRequirement}>
                    <Text style={[styles.bonusTierRequirementText, { color: colors.textSecondary }]}>
                      When order ≥ ${bonus.order_amount}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
              <Info size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Bonuses are automatically credited to your account when you complete qualifying orders.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Modal Styles
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
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  bonusTiers: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bonusTier: {
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  bonusTierContent: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bonusTierAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  bonusTierLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  bonusTierRequirement: {
    alignItems: 'center',
  },
  bonusTierRequirementText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});