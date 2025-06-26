import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert,
} from 'react-native';
import { ChevronRight, Clock, Star, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import type { PaymentAccount } from '@/types';
import { PaymentService } from '@/services/payment';
import { useAuthStore } from '@/stores/useAuthStore';

interface PaymentMethodCardProps {
  account: PaymentAccount;
  methodType: string;
  onSelect: () => void;
  onSetDefault?: () => void;
  onDelete?: () => void;
}

export default function PaymentMethodCard({
  account,
  methodType,
  onSelect,
  onSetDefault,
  onDelete,
}: PaymentMethodCardProps) {
  const { colors } = useTheme();
  const isDefault = account.is_def === 1;
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // 设置默认支付方式
  const handleSetDefault = async () => {
    if (!user?.token || isDefault) return;
    setLoading(true);
    try {
      await PaymentService.setDefaultPayment({ token: user.token, bank_id: account.bank_id });
      if (typeof onSetDefault === 'function') onSetDefault();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to set default payment method');
    } finally {
      setLoading(false);
    }
  };

  // 删除提现方式
  const handleDelete = async () => {
    if (!user?.token) return;
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await PaymentService.deletePaymentMethod({ token: user.token, bank_id: account.bank_id });
              if (typeof onDelete === 'function') onDelete();
              else if (typeof onSetDefault === 'function') onSetDefault();
            } catch (e) {
              alert(e instanceof Error ? e.message : 'Failed to delete payment method');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.cardWrap}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isDefault ? colors.primary : colors.border,
            borderWidth: isDefault ? 2 : 1,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* Bank/Payment Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: account.bank_logo_image }}
              style={styles.logo}
              resizeMode="contain"
            />
            {isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Account Details */}
          <View style={styles.accountDetails}>
            <View style={styles.accountHeader}>
              <Text style={[styles.bankName, { color: colors.text }]}>
                {account.bank_name}
              </Text>
            </View>
            
            <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
              ****{account.account_no.slice(-4)}
            </Text>
          </View>

          {/* Action Arrow */}
          <View style={styles.actionContainer}>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
        </View>
        {/* 操作区与timeoutDesc同一行 */}
        <View style={styles.accountFooter}>
          <View style={styles.timeoutContainer}>
            {!!account.timeout_desc && (
              <View style={styles.timeoutDesc}>
                <Clock size={12} color={colors.success} />
                <Text style={[styles.timeoutText, { color: colors.success }]}>
                  {account.timeout_desc}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.accountActions}>
            <TouchableOpacity
              onPress={handleSetDefault}
              disabled={isDefault || loading}
              style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
            >
              <Star
                size={18}
                color={isDefault ? colors.primary : colors.textSecondary}
                fill={isDefault ? colors.primary : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]}
            >
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  logoContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  defaultBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bankName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  defaultLabel: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultLabelText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  accountNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.xs,
  },
  timeoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeoutDesc: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeoutText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actionContainer: {
    marginLeft: Spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: Spacing.lg,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
  accountActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});