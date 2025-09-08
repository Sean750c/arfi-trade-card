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
import type { DataBundle } from '@/types/utilities';

interface DataBundleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  dataBundles: DataBundle[];
  isLoadingDataBundles: boolean;
  selectedDataBundle: DataBundle | null;
  onSelectDataBundle: (bundle: DataBundle) => void;
  selectedSupplierName?: string;
}

export default function DataBundleSelectionModal({
  visible,
  onClose,
  dataBundles,
  isLoadingDataBundles,
  selectedDataBundle,
  onSelectDataBundle,
  selectedSupplierName,
}: DataBundleSelectionModalProps) {
  const { colors } = useTheme();

  const handleSelectDataBundle = (bundle: DataBundle) => {
    onSelectDataBundle(bundle);
    onClose();
  };

  const renderDataBundleOption = (bundle: DataBundle) => (
    <TouchableOpacity
      key={bundle.serviceId}
      style={[
        styles.modalOption,
        {
          backgroundColor: selectedDataBundle?.serviceId === bundle.serviceId
            ? `${colors.primary}15`
            : colors.card,
          borderColor: selectedDataBundle?.serviceId === bundle.serviceId
            ? colors.primary
            : colors.border,
        }
      ]}
      onPress={() => handleSelectDataBundle(bundle)}
    >
      <View style={styles.dataBundleInfo}>
        <Text style={[
          styles.modalOptionText,
          {
            color: selectedDataBundle?.serviceId === bundle.serviceId
              ? colors.primary
              : colors.text
          }
        ]}>
          {bundle.serviceName}
        </Text>
        <Text style={[
          styles.dataBundlePrice,
          {
            color: selectedDataBundle?.serviceId === bundle.serviceId
              ? colors.primary
              : colors.textSecondary
          }
        ]}>
          ₦{bundle.servicePrice.toLocaleString()}
        </Text>
      </View>
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
              Select Data Bundle
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {isLoadingDataBundles ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading data bundles...
                </Text>
              </View>
            ) : dataBundles.length > 0 ? (
              dataBundles.map(renderDataBundleOption)
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No data bundles available for {selectedSupplierName}
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
  dataBundleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataBundlePrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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