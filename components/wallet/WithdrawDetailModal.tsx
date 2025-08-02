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
    if (visible && logId !== null && user?.token) {
      fetchWithdrawDetail();
    }
  }, [visible, logId, user?.token]);

  const fetchWithdrawDetail = async () => {
    if (!user?.token || logId === null) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const detail = await WalletService.moneyLogDetail({
        token: user.token,
        log_id: logId,
      });
      setWithdrawDetail(detail);
    } catch (error) {
      console.error('Failed to fetch withdraw detail:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch withdraw detail');
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
                  {formatAmount(withdrawDetail.amount)}
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
                  <Copy size={12} color={colors.primary} />
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
                  Account No:
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
                  {formatAmount(withdrawDetail.amount)}
                </Text>
              </View>

              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                  Balance After:
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  {formatAmount(withdrawDetail.balance_amount)}
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
    padding: Spacing.md,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  scrollContent: {
    padding: Spacing.lg,
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
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    textTransform: 'capitalize',
  },
  statusAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  amountText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  section: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCard: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.lg,
    color: '#1F2937',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginRight: Spacing.sm,
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
  copyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  copyButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  bankLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.xs,
  },
  bankLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Spacing.sm,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bankName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
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
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  receiptImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  remarkText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    color: '#4B5563',
    backgroundColor: '#F9FAFB',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
});