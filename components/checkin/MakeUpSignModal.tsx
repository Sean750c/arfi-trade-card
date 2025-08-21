import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, CalendarCheck, Star } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { MakeUpSignRule, RewardType } from '@/types';
import RewardIcon from './RewardIcon';

interface MakeUpSignModalProps {
  visible: boolean;
  onClose: () => void;
  makeUpRules: MakeUpSignRule[];
  usedCount: number;
  maxCount: number;
}

export default function MakeUpSignModal({
  visible,
  onClose,
  makeUpRules,
  usedCount,
  maxCount,
}: MakeUpSignModalProps) {
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
              <CalendarCheck size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Make-Up Sign Rules
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.infoCard, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                You have used <Text style={styles.highlightText}>{usedCount}</Text> out of{' '}
                <Text style={styles.highlightText}>{maxCount}</Text> available make-up signs.
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                Remaining: <Text style={styles.highlightText}>{maxCount - usedCount}</Text>
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Cost per Make-Up Sign:
            </Text>
            {makeUpRules.length > 0 ? (
              makeUpRules.map((rule, index) => (
                <View
                  key={index}
                  style={[styles.ruleItem, { borderColor: colors.border }]}
                >
                  <Text style={[styles.ruleText, { color: colors.text }]}>
                    {rule.sign_count} Make-Up Sign{parseInt(rule.sign_count) > 1 ? 's' : ''}
                  </Text>
                  <View style={styles.rewardDisplay}>
                    <Text style={[styles.costText, { color: colors.textSecondary }]}>Cost:</Text>
                    <RewardIcon
                      type={RewardType.POINTS}
                      value={rule.sign_point}
                      size={24}
                      iconSize={16}
                      fontSize={14}
                      color={colors.error}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.noRulesText, { color: colors.textSecondary }]}>
                No make-up sign rules available.
              </Text>
            )}

            <View style={[styles.noteBox, { backgroundColor: `${colors.warning}10` }]}>
              <Text style={[styles.noteTitle, { color: colors.warning }]}>
                💡 How to Make-Up Sign:
              </Text>
              <Text style={[styles.noteText, { color: colors.text }]}>
                • Tap on any past, unsigned date in the calendar.{'\n'}
                • If you have remaining make-up sign opportunities, the required points will be deducted from your balance.{'\n'}
                • Make-up signs count towards accumulated rewards.
              </Text>
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
    maxHeight: '70%',
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
  infoCard: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  highlightText: {
    fontFamily: 'Inter-Bold',
    color: '#000', // Will be overridden by theme colors
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  ruleText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  rewardDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  costText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  noRulesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  noteBox: {
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.lg,
  },
  noteTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  noteText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});