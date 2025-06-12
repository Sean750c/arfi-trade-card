import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Modal,
} from 'react-native';
import { Eye, EyeOff, Gift, TrendingUp, Award, HelpCircle, X, Info } from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { WalletBalanceData } from '@/types/api';

interface WalletBalanceCardProps {
  balanceData: WalletBalanceData;
  balanceVisible: boolean;
  onToggleVisibility: () => void;
  onRebatePress: () => void;
}

export default function WalletBalanceCard({
  balanceData,
  balanceVisible,
  onToggleVisibility,
  onRebatePress,
}: WalletBalanceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showRebateInfo, setShowRebateInfo] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const formatAmount = (amount: number | string) => {
    if (!balanceVisible) return '****';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrency = (amount: number | string, symbol: string = '₦') => {
    return `${symbol}${formatAmount(amount)}`;
  };

  const handleRebatePress = () => {
    // Add subtle animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onRebatePress();
  };

  const RebateInfoModal = () => (
    <Modal
      visible={showRebateInfo}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRebateInfo(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Gift size={20} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Rebate Balance
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowRebateInfo(false)}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Your rebate balance is earned through:
            </Text>
            
            <View style={styles.rebateExplanation}>
              <View style={styles.explanationItem}>
                <View style={[styles.explanationIcon, { backgroundColor: `${colors.success}15` }]}>
                  <TrendingUp size={16} color={colors.success} />
                </View>
                <Text style={[styles.explanationText, { color: colors.text }]}>
                  Trading volume bonuses
                </Text>
              </View>
              
              <View style={styles.explanationItem}>
                <View style={[styles.explanationIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Award size={16} color={colors.primary} />
                </View>
                <Text style={[styles.explanationText, { color: colors.text }]}>
                  VIP level rewards
                </Text>
              </View>
              
              <View style={styles.explanationItem}>
                <View style={[styles.explanationIcon, { backgroundColor: `${colors.secondary}15` }]}>
                  <Gift size={16} color={colors.secondary} />
                </View>
                <Text style={[styles.explanationText, { color: colors.text }]}>
                  Referral commissions
                </Text>
              </View>
            </View>
            
            <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
              <Info size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Rebate funds can be transferred to your main balance or withdrawn directly.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        {/* Main Balance Section */}
        <View style={styles.balanceHeader}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.balanceAmountContainer}>
              <Text style={styles.balanceAmount}>
                {formatCurrency(balanceData.total_amount)}
              </Text>
              <Text style={styles.currencyName}>
                {balanceData.currency_name}
              </Text>
            </View>
            
            {/* USD Equivalent */}
            <Text style={styles.usdEquivalent}>
              ≈ ${formatAmount(balanceData.usd_amount)} USD
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.visibilityButton}
            onPress={onToggleVisibility}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            {balanceVisible ? (
              <Eye size={20} color="rgba(255, 255, 255, 0.8)" />
            ) : (
              <EyeOff size={20} color="rgba(255, 255, 255, 0.8)" />
            )}
          </TouchableOpacity>
        </View>

        {/* Balance Details Grid */}
        <View style={styles.balanceDetails}>
          {/* Withdrawable Amount */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Withdrawable</Text>
              <Text style={styles.detailAmount}>
                {formatCurrency(balanceData.withdraw_amount)}
              </Text>
            </View>
          </View>

          {/* Rebate Amount - Clickable with Enhanced UI */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.detailItem, styles.rebateItem]}
              onPress={handleRebatePress}
              activeOpacity={0.8}
            >
              <View style={styles.detailIcon}>
                <Gift size={16} color="rgba(255, 255, 255, 0.9)" />
              </View>
              <View style={styles.detailContent}>
                <View style={styles.rebateHeader}>
                  <Text style={styles.detailLabel}>Rebate Balance</Text>
                  <TouchableOpacity 
                    onPress={() => setShowRebateInfo(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <HelpCircle size={14} color="rgba(255, 255, 255, 0.7)" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.detailAmount}>
                  {formatCurrency(balanceData.rebate_amount)}
                </Text>
                <Text style={styles.rebateUsd}>
                  ≈ ${formatAmount(balanceData.usd_rebate_money)} USD
                </Text>
              </View>
              <View style={styles.rebateIndicator}>
                <Text style={styles.rebateIndicatorText}>Tap to view</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Frozen Amount */}
          {balanceData.frozen_amount > 0 && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Award size={16} color="rgba(255, 255, 255, 0.9)" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Frozen</Text>
                <Text style={styles.detailAmount}>
                  {formatCurrency(balanceData.frozen_amount)}
                </Text>
              </View>
            </View>
          )}

          {/* Points Display */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Award size={16} color="rgba(255, 255, 255, 0.9)" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Points</Text>
              <Text style={styles.detailAmount}>
                {balanceData.point.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Information */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Exchange Rate</Text>
            <Text style={styles.statusValue}>1 USD = ₦{balanceData.rate}</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Active Deals</Text>
            <Text style={styles.statusValue}>{balanceData.dealing_cnt}</Text>
          </View>
        </View>
      </Card>

      <RebateInfoModal />
    </>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    marginBottom: 24, // 24px spacing (1.5 * 16px base)
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24, // 24px spacing
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8, // 8px compact spacing
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8, // 8px compact spacing
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginRight: 8, // 8px compact spacing
  },
  currencyName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  usdEquivalent: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  visibilityButton: {
    padding: 16, // 16px base spacing
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24, // 24px spacing
    gap: 16, // 16px base spacing
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    minHeight: 60,
  },
  rebateItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  rebateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  detailAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  rebateUsd: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 1,
  },
  rebateIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  rebateIndicatorText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontFamily: 'Inter-Medium',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16, // 16px base spacing
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16, // 16px base spacing
  },
  modalContent: {
    borderRadius: 16,
    padding: 24, // 24px spacing
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // 24px spacing
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 8px compact spacing
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  modalBody: {
    gap: 16, // 16px base spacing
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  rebateExplanation: {
    gap: 12,
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  explanationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16, // 16px base spacing
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    flex: 1,
  },
});