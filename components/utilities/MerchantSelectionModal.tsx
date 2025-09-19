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
import type { MerchantEntry } from '@/types/utilities';

interface MerchantSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  merchants: MerchantEntry[];
  isLoadingMerchants: boolean;
  selectedMerchant: MerchantEntry | null;
  onSelectMerchant: (merchant: MerchantEntry) => void;
  title: string;
  serviceIcon: React.ReactNode;
}

export default function MerchantSelectionModal({
  visible,
  onClose,
  merchants,
  isLoadingMerchants,
  selectedMerchant,
  onSelectMerchant,
  title,
  serviceIcon,
}: MerchantSelectionModalProps) {
  const { colors } = useTheme();

  const handleSelectMerchant = (merchant: MerchantEntry) => {
    onSelectMerchant(merchant);
    onClose();
  };

  const renderMerchantOption = (merchant: MerchantEntry) => (
    <TouchableOpacity
      key={merchant.uuid}
      style={[
        styles.modalOption,
        {
          backgroundColor: selectedMerchant?.uuid === merchant.uuid
            ? `${colors.primary}15`
            : colors.card,
          borderColor: selectedMerchant?.uuid === merchant.uuid
            ? colors.primary
            : colors.border,
        }
      ]}
      onPress={() => handleSelectMerchant(merchant)}
    >
      <View style={styles.merchantInfo}>
        <View style={[styles.merchantIcon, { backgroundColor: `${colors.primary}15` }]}>
          {serviceIcon}
        </View>
        <View style={styles.merchantDetails}>
          <Text style={[
            styles.merchantName,
            {
              color: selectedMerchant?.uuid === merchant.uuid
                ? colors.primary
                : colors.text
            }
          ]}>
            {merchant.name}
          </Text>
          {merchant.discount > 0 && (
            <Text style={[styles.merchantDiscount, { color: colors.success }]}>
              {merchant.discount}% discount available
            </Text>
          )}
          {merchant.fee > 0 && (
            <Text style={[styles.merchantFee, { color: colors.textSecondary }]}>
              Service fee: ₦{merchant.fee.toLocaleString()}
            </Text>
          )}
        </View>
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
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {isLoadingMerchants ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading providers...
                </Text>
              </View>
            ) : merchants.length > 0 ? (
              merchants.map(renderMerchantOption)
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No service providers available
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
    maxHeight: 400,
  },
  modalOption: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  merchantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantDetails: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  merchantDiscount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  merchantFee: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
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