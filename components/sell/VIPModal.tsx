import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Crown } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { OrderVip, OrderVipInfo } from '@/types';

interface VIPModalProps {
  visible: boolean;
  onClose: () => void;
  vipList: OrderVip[];
  vipDetail?: OrderVipInfo;
}

export default function VIPModal({ visible, onClose, vipList, vipDetail }: VIPModalProps) {
  const { colors } = useTheme();
  const currentLevel = vipDetail?.level;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 }]}> 
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Crown size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>VIP Trading Benefits</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {/* Current and Next Level */}
          {vipDetail && (
            <View style={styles.levelInfoContainer}>
              <View style={[styles.levelInfoCard, { backgroundColor: colors.primary }]}>
                <Text style={styles.levelInfoTitle}>Current VIP{vipDetail.level}</Text>
                <Text style={styles.levelInfoRate}>+{vipDetail.rate}% Bonus</Text>
              </View>
              
              <View style={[styles.levelInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.levelInfoTitle, { color: colors.text }]}>Next VIP{vipDetail.next_level}</Text>
                <Text style={[styles.levelInfoRate, { color: colors.primary }]}>+{vipDetail.next_level_rate}% Bonus</Text>
              </View>
            </View>
          )}

          {/* Table Card */}
          <View style={[styles.tableCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.primary }]}> 
              <Text style={[styles.tableCell, styles.headerCell, { color: '#fff' }]}>Level</Text>
              <Text style={[styles.tableCell, styles.headerCell, { color: '#fff' }]}>Bonus (%)</Text>
            </View>

            {/* Table Body */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
              {vipList.map((level) => {
                const isCurrent = level.level === currentLevel;
                return (
                  <View
                    key={level.level}
                    style={[
                      styles.tableRow,
                      isCurrent
                        ? { backgroundColor: colors.primary, borderRadius: 8 }
                        : { backgroundColor: 'transparent' },
                    ]}
                  >
                    <Text style={[
                      styles.tableCell,
                      isCurrent
                        ? { color: '#fff', fontWeight: 'bold' }
                        : { color: colors.text }
                    ]}>
                      VIP{level.level}
                    </Text>
                    <Text style={[
                      styles.tableCell,
                      isCurrent
                        ? { color: '#fff', fontWeight: 'bold' }
                        : { color: colors.primary }
                    ]}>
                      +{level.rate}%
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    maxHeight: '90%',
    marginHorizontal: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    borderRadius: 16,
  },
  levelInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  levelInfoCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  levelInfoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelInfoRate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  tableCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
  },
  tableHeader: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    textAlign: 'center',
  },
  headerCell: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
  },
});