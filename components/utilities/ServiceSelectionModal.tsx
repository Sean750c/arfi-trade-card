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
import { X, CreditCard } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import type { MerchantServiceEntry } from '@/types/utilities';

interface ServiceSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  services: MerchantServiceEntry[];
  isLoadingServices: boolean;
  selectedService: MerchantServiceEntry | null;
  onSelectService: (service: MerchantServiceEntry) => void;
  title: string;
  merchantName?: string;
}

export default function ServiceSelectionModal({
  visible,
  onClose,
  services,
  isLoadingServices,
  selectedService,
  onSelectService,
  title,
  merchantName,
}: ServiceSelectionModalProps) {
  const { colors } = useTheme();

  const handleSelectService = (service: MerchantServiceEntry) => {
    onSelectService(service);
    onClose();
  };

  const renderServiceOption = (service: MerchantServiceEntry) => (
    <TouchableOpacity
      key={service.code}
      style={[
        styles.modalOption,
        {
          backgroundColor: selectedService?.code === service.code
            ? `${colors.primary}15`
            : colors.card,
          borderColor: selectedService?.code === service.code
            ? colors.primary
            : colors.border,
        }
      ]}
      onPress={() => handleSelectService(service)}
    >
      <View style={styles.serviceInfo}>
        <View style={[styles.serviceIcon, { backgroundColor: `${colors.primary}15` }]}>
          <CreditCard size={20} color={colors.primary} />
        </View>
        <View style={styles.serviceDetails}>
          <Text style={[
            styles.serviceName,
            {
              color: selectedService?.code === service.code
                ? colors.primary
                : colors.text
            }
          ]}>
            {service.name}
          </Text>
          <Text style={[
            styles.servicePrice,
            {
              color: selectedService?.code === service.code
                ? colors.primary
                : colors.textSecondary
            }
          ]}>
            ₦{service.price.toLocaleString()}
          </Text>
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
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {title}
              </Text>
              {merchantName && (
                <Text style={[styles.merchantName, { color: colors.textSecondary }]}>
                  {merchantName}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {isLoadingServices ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading services...
                </Text>
              </View>
            ) : services.length > 0 ? (
              services.map(renderServiceOption)
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No services available for {merchantName}
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
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  titleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  servicePrice: {
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