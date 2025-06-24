import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { ChevronRight, Clock, Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { PaymentAccount } from '@/types';
import { PaymentService } from '@/services/payment';
import { useAuthStore } from '@/stores/useAuthStore';

interface PaymentMethodCardProps {
  account: PaymentAccount;
  methodType: string;
  onSelect: () => void;
  onSetDefault?: () => void;
}

export default function PaymentMethodCard({
  account,
  methodType,
  onSelect,
  onSetDefault,
}: PaymentMethodCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDefault = account.is_def === 1;
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(false);

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

  return (
    <View style={styles.cardWrap}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
            borderColor: isDefault ? colors.primary : colors.border,
            borderWidth: isDefault ? 2 : 1,
            shadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',
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
              {methodType === 'BANK' ? 'Account:' : 'Phone:'} {account.account_no}
            </Text>
            
            {account.account_name && (
              <Text style={[styles.accountName, { color: colors.textSecondary }]}>
                {account.account_name}
              </Text>
            )}
            
            {!!account.timeout_desc && (
              <View style={styles.timeoutContainer}>
                <Clock size={12} color={colors.success} />
                <Text style={[styles.timeoutText, { color: colors.success }]}>
                  {account.timeout_desc}
                </Text>
              </View>
            )}
          </View>

          {/* Action Arrow */}
          <View style={styles.actionContainer}>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.radioRow}
        onPress={handleSetDefault}
        disabled={isDefault || loading}
        activeOpacity={0.7}
      >
        <View style={[styles.radioOuter, { borderColor: isDefault ? colors.primary : colors.border }]}>
          {isDefault && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.radioLabel, { color: isDefault ? colors.primary : colors.textSecondary }]}>
          {isDefault ? 'Default' : loading ? 'Setting...' : 'Set as default'}
        </Text>
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
});