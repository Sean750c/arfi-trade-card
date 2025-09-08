import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import type { Supplier } from '@/types/utilities';

interface SupplierSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  isLoadingSuppliers: boolean;
  selectedSupplier: Supplier | null;
  onSelectSupplier: (supplier: Supplier) => void;
}

export default function SupplierSelectionModal({
  visible,
  onClose,
  suppliers,
  isLoadingSuppliers,
  selectedSupplier,
  onSelectSupplier,
}: SupplierSelectionModalProps) {
  const { colors } = useTheme();

  const handleSelectSupplier = (supplier: Supplier) => {
    onSelectSupplier(supplier);
    onClose();
  };

  const renderSupplierOption = (supplier: Supplier) => (
    <TouchableOpacity
      key={supplier.mobileOperatorCode}
      style={[
        styles.modalOption,
        {
          backgroundColor: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode
            ? `${colors.primary}15`
            : colors.card,
          borderColor: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode
            ? colors.primary
            : colors.border,
        }
      ]}
      onPress={() => handleSelectSupplier(supplier)}
    >
      <Text style={[
        styles.modalOptionText,
        {
          color: selectedSupplier?.mobileOperatorCode === supplier.mobileOperatorCode
            ? colors.primary
            : colors.text
        }
      ]}>
        {supplier.name}
      </Text>
    </TouchableOpacity>
  );

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
              Select Network Provider
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {isLoadingSuppliers ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading providers...
                </Text>
              </View>
            ) : suppliers.length > 0 ? (
              suppliers.map(renderSupplierOption)
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No network providers available
              </Text>
            )}
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
    maxHeight: '70%',
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
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  modalLoading: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  emptyText: {
    padding: Spacing.xl,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});