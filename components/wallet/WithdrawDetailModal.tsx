import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { X, Calendar, CreditCard, User, Building, Hash, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { WalletService } from '@/services/wallet';
import { formatDate } from '@/utils/date';
import type { MoneyLogDetail } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';

interface WithdrawDetailModalProps {
  visible: boolean;
  onClose: () => void;
  logId: number;
}

export default function WithdrawDetailModal({
  visible,
  onClose,
  logId,
}: WithdrawDetailModalProps) {
  const { colors } = useTheme();
  const [withdrawDetail, setWithdrawDetail] = useState<MoneyLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (visible && logId && user?.token) {
      fetchWithdrawDetail();
    }
  }, [visible, logId, user?.token]);

  const fetchWithdrawDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const detail = await WalletService.moneyLogDetail({
        token: user?.token || '',
        log_id: logId,
      });
      setWithdrawDetail(detail);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch withdraw details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'approved':
        return colors.success;
      case 'pending':
      case 'processing':
        return colors.warning;
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'approved':
        return <CheckCircle size={20} color={colors.success} />;
      case 'pending':
      case 'processing':
        return <Clock size={20} color={colors.warning} />;
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return <AlertCircle size={20} color={colors.error} />;
      default:
        return <Clock size={20} color={colors.textSecondary} />;
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading withdraw details...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (error) {
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
                Withdraw Details
              </Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.errorContainer}>
              <AlertCircle size={48} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={fetchWithdrawDetail}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (!withdrawDetail) {
    return null;
  }

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
              Withdraw Details
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* Status Card */}
            <View style={[styles.statusCard, { backgroundColor: colors.background }]}>
              <View style={styles.statusHeader}>
                {getStatusIcon(withdrawDetail.order_status)}
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(withdrawDetail.order_status) }
                ]}>
                  {withdrawDetail.order_status}
                </Text>
              </View>
              <Text style={[styles.amountText, { color: colors.text }]}>
                {withdrawDetail.wallet_type === '2' ? 'USDT' : '₦'} {formatAmount(withdrawDetail.amount)}
              </Text>
            </View>

            {/* Withdraw Information */}
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Withdraw Information
              </Text>
              
              <View style={styles.infoRow}>
                <Hash size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Withdraw No:
                </Text>
                <TouchableOpacity
                  style={styles.copyableValue}
                  onPress={() => copyToClipboard(withdrawDetail.withdraw_no, 'Withdraw number')}
                >
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {withdrawDetail.withdraw_no}
                  </Text>
                  <Copy size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Hash size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Serial Number:
                </Text>
                <TouchableOpacity
                  style={styles.copyableValue}
                  onPress={() => copyToClipboard(withdrawDetail.serial_number, 'Serial number')}
                >
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {withdrawDetail.serial_number}
                  </Text>
                  <Copy size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Created:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(withdrawDetail.withdraw_create_time)}
                </Text>
              </View>

              {withdrawDetail.withdraw_deal_time > 0 && (
                <View style={styles.infoRow}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Processed:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatDate(withdrawDetail.withdraw_deal_time)}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <CreditCard size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Wallet Type:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {withdrawDetail.wallet_type === '2' ? 'USDT' : 'Local Currency'}
                </Text>
              </View>
            </View>

            {/* Payment Information */}
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Payment Information
              </Text>

              {withdrawDetail.bank_logo && (
                <View style={styles.bankLogoContainer}>
                  <Image
                    source={{ uri: withdrawDetail.bank_logo }}
                    style={styles.bankLogo}
                    resizeMode="contain"
                  />
                </View>
              )}

              <View style={styles.infoRow}>
                <Building size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Bank:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {withdrawDetail.bank_name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <CreditCard size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Account:
                </Text>
                <TouchableOpacity
                  style={styles.copyableValue}
                  onPress={() => copyToClipboard(withdrawDetail.account_no, 'Account number')}
                >
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {withdrawDetail.account_no}
                  </Text>
                  <Copy size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <User size={16} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Account Name:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {withdrawDetail.account_name}
                </Text>
              </View>
            </View>

            {/* Amount Details */}
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Amount Details
              </Text>

              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                  Withdraw Amount:
                </Text>
                <Text style={[styles.amountValue, { color: colors.success }]}>
                  +{withdrawDetail.wallet_type === '2' ? 'USDT' : '₦'} {formatAmount(withdrawDetail.amount)}
                </Text>
              </View>

              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                  Balance After:
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  {withdrawDetail.wallet_type === '2' ? 'USDT' : '₦'} {formatAmount(withdrawDetail.balance_amount)}
                </Text>
              </View>
            </View>

            {/* Receipt Image */}
            {withdrawDetail.image && (
              <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Receipt
                </Text>
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={() => {
                    // TODO: Implement image preview modal
                    Alert.alert('Image Preview', 'Image preview functionality will be implemented');
                  }}
                >
                  <Image
                    source={{ uri: withdrawDetail.image }}
                    style={styles.receiptImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Remarks */}
            {withdrawDetail.remark && (
              <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Remarks
                </Text>
                <Text style={[styles.remarkText, { color: colors.text }]}>
                  {withdrawDetail.remark}
                </Text>
              </View>
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
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  statusCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
  },
  amountText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 2,
    textAlign: 'right',
  },
  copyableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 2,
    justifyContent: 'flex-end',
  },
  bankLogoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bankLogo: {
    width: 80,
    height: 40,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  amountValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  imageContainer: {
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  remarkText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});