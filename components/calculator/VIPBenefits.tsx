import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Crown, ChevronDown, X, Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { VIPDetail, VIPLevel } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

interface VIPBenefitsProps {
  vipDetail: VIPDetail;
  vipLevels: VIPLevel[];
}

export default function VIPBenefits({ vipDetail, vipLevels }: VIPBenefitsProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.vipCard, { backgroundColor: `${colors.primary}15` }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.vipHeader}>
          <Crown size={20} color={colors.primary} />
          <Text style={[styles.vipTitle, { color: colors.primary }]}>
            VIP {vipDetail.level} Benefits
          </Text>
          <ChevronDown size={16} color={colors.primary} />
        </View>
        
        <Text style={[styles.vipBonus, { color: colors.text }]}>
          +{vipDetail.rate}% Exchange Rate Bonus
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.titleContainer}>
                <Crown size={24} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  VIP Benefits
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.currentLevel}>
                <Text style={[styles.currentLevelTitle, { color: colors.text }]}>
                  Current Level: VIP {vipDetail.level}
                </Text>
                <Text style={[styles.currentLevelBonus, { color: colors.primary }]}>
                  +{vipDetail.rate}% Bonus Rate
                </Text>
                
                {vipDetail.next_level && (
                  <View style={styles.nextLevelInfo}>
                    <Text style={[styles.nextLevelText, { color: colors.textSecondary }]}>
                      Next Level: VIP {vipDetail.next_level} (+{vipDetail.next_level_rate}%)
                    </Text>
                    <Text style={[styles.upgradePoints, { color: colors.textSecondary }]}>
                      {vipDetail.upgrade_point} points to upgrade
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.allLevels}>
                <Text style={[styles.allLevelsTitle, { color: colors.text }]}>
                  All VIP Levels
                </Text>
                {vipLevels.map((level) => (
                  <View 
                    key={level.level} 
                    style={[
                      styles.levelRow,
                      { 
                        backgroundColor: level.level === vipDetail.level 
                          ? `${colors.primary}10` 
                          : 'transparent',
                        borderBottomColor: colors.border,
                      }
                    ]}
                  >
                    <View style={styles.levelInfo}>
                      <Text style={[styles.levelNumber, { color: colors.text }]}>
                        VIP {level.level}
                      </Text>
                      {level.level === vipDetail.level && (
                        <Star size={14} color={colors.primary} fill={colors.primary} />
                      )}
                    </View>
                    <Text style={[styles.levelRate, { color: colors.primary }]}>
                      +{level.rate}%
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  vipCard: {
    padding: Spacing.md,
    borderRadius: 12,
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  vipTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  vipBonus: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%', // Increased max height
    minHeight: '60%', // Added minimum height
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl, // Extra padding at bottom
  },
  currentLevel: {
    padding: Spacing.lg,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 135, 81, 0.1)',
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  currentLevelTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  currentLevelBonus: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  nextLevelInfo: {
    alignItems: 'center',
    gap: 4,
  },
  nextLevelText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  upgradePoints: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  allLevels: {
    gap: Spacing.sm,
  },
  allLevelsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  levelNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  levelRate: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});