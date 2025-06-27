import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import type { OverdueDataItem } from '@/types/withdraw';

interface OrderCompensationModalProps {
  visible: boolean;
  onClose: () => void;
  overdueData: OverdueDataItem[];
  maxPercent?: string;
}

export default function OrderCompensationModal({
  visible,
  onClose,
  overdueData,
  maxPercent,
}: OrderCompensationModalProps) {
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Compensation Rates
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {maxPercent && (
            <View style={[styles.maxCompensationCard, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.maxCompensationText, { color: colors.primary }]}>
                Maximum compensation: {maxPercent}%
              </Text>
            </View>
          )}

          <View style={styles.tableContainer}>
            <View style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
              <Text style={styles.tableHeaderText}>Processing Time</Text>
              <Text style={styles.tableHeaderText}>Compensation</Text>
            </View>
            
            {overdueData.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  { 
                    backgroundColor: index % 2 === 0 ? colors.background : colors.card,
                    borderBottomColor: colors.border 
                  }
                ]}
              >
                <Text style={[styles.tableCell, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.tableCell, { color: colors.text }]}>
                  {item.value}%
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.modalNote, { color: colors.textSecondary }]}>
            1. If your card order processing exceeds the expected time, you will automatically receive compensation based on the delay duration.
          </Text>
          <Text style={[styles.modalNote2, { color: colors.textSecondary }]}>
            2. Compensation will be credited to your wallet balance once the order is completed.
          </Text>
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
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  maxCompensationCard: {
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  maxCompensationText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  tableContainer: {
    marginBottom: Spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
    textAlign: 'center',
  },
  modalNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  modalNote2: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.lg,
  },
}); 