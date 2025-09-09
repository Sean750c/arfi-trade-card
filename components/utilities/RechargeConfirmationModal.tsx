import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X, Calculator } from 'lucide-react-native';
import Button from '@/components/UI/Button';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';

interface PendingRechargeData {
  type: 'airtime' | 'data';
  supplier: string;
  phone: string;
  amount: number;
  paymentAmount: number;
  dataBundle?: {
    serviceName: string;
    servicePrice: number;
  };
}

interface RechargeConfirmationModalProps {
  chargeDiscount: number;
  visible: boolean;
  onClose: () => void;
  pendingRechargeData: PendingRechargeData | null;
  onConfirm: () => void;
}

export default function RechargeConfirmationModal({
  chargeDiscount,
  visible,
  onClose,
  pendingRechargeData,
  onConfirm,
}: RechargeConfirmationModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Confirm Recharge
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.confirmContent}>
            {pendingRechargeData && (
              <>
                <View style={[styles.confirmCard, { backgroundColor: colors.background }]}>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                      Service Type:
                    </Text>
                    <Text style={[styles.confirmValue, { color: colors.text }]}>
                      {pendingRechargeData.type === 'airtime' ? 'Airtime Recharge' : 'Data Recharge'}
                    </Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                      Network:
                    </Text>
                    <Text style={[styles.confirmValue, { color: colors.text }]}>
                      {pendingRechargeData.supplier}
                    </Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                      Phone Number:
                    </Text>
                    <Text style={[styles.confirmValue, { color: colors.text }]}>
                      {pendingRechargeData.phone}
                    </Text>
                  </View>
                  {pendingRechargeData.dataBundle && (
                    <View style={styles.confirmRow}>
                      <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                        Data Bundle:
                      </Text>
                      <Text style={[styles.confirmValue, { color: colors.text }]}>
                        {pendingRechargeData.dataBundle.serviceName}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.paymentSummary, { backgroundColor: `${colors.primary}10` }]}>
                  <View style={styles.calculationHeader}>
                    <Calculator size={16} color={colors.primary} />
                    <Text style={[styles.calculationTitle, { color: colors.primary }]}>
                      Save {chargeDiscount}% with CardKing
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Recharge Amount:
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      ₦{pendingRechargeData.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.success }]}>
                      CardKing Discount ({chargeDiscount}%):
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      -₦{(pendingRechargeData.amount - pendingRechargeData.paymentAmount).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={[styles.summaryLabel, { color: colors.primary, fontFamily: 'Inter-Bold' }]}>
                      Total Payment:
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.primary, fontFamily: 'Inter-Bold', fontSize: 18 }]}>
                      ₦{pendingRechargeData.paymentAmount.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.confirmActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={onClose}
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Confirm"
                    onPress={onConfirm}
                    style={styles.confirmButton}
                  />
                </View>
              </>
            )}
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
    marginBottom: Spacing.lg,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  confirmContent: {
    gap: Spacing.lg,
  },
  confirmCard: {
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  confirmValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  paymentSummary: {
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  calculationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  totalRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: Spacing.sm,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});