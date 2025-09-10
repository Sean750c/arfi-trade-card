import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { X, TrendingUp, TrendingDown, Star, Gift, Ticket, DollarSign, Sparkles } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLotteryStore } from '@/stores/useLotteryStore';
import type { LotteryLogEntry } from '@/types';
import { formatDate } from '@/utils/date';
import { RewardType } from '@/types';

interface LotteryLogsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LotteryLogsModal({ visible, onClose }: LotteryLogsModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    lotteryLogs,
    isLoadingLogs,
    isLoadingMoreLogs,
    logsError,
    hasMoreLogs,
    fetchLotteryLogs,
    loadMoreLotteryLogs,
  } = useLotteryStore();

  const [logsInitialized, setLogsInitialized] = useState(false);

  useEffect(() => {
    if (visible && user?.token) {
      setLogsInitialized(false);
      fetchLotteryLogs(user.token, true).then(() => setLogsInitialized(true));

      // console.log(JSON.stringify(lotteryLogs));
    }
  }, [visible, user?.token, fetchLotteryLogs]);

  const handleLoadMore = useCallback(() => {
    if (user?.token) {
      loadMoreLotteryLogs(user.token);
    }
  }, [user?.token, loadMoreLotteryLogs]);

  const getPrizeIcon = (prizeType: number) => {
    switch (prizeType) {
      case RewardType.POINTS:
        return <Star size={16} color={colors.primary} fill={colors.primary} />;
      case RewardType.COUPON:
        return <Ticket size={16} color={colors.warning} />;
      case RewardType.CASH:
        return <DollarSign size={16} color={colors.success} />;
      case RewardType.PHYSICAL_PRODUCT:
        return <Gift size={16} color={colors.error} />;
      default:
        return <Sparkles size={16} color={colors.primary} />;
    }
  };

  const getPrizeColor = (prizeType: number) => {
    switch (prizeType) {
      case RewardType.POINTS:
        return colors.primary;
      case RewardType.COUPON:
        return colors.warning;
      case RewardType.CASH:
        return colors.success;
      case RewardType.PHYSICAL_PRODUCT:
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const formatPrizeType = (log: LotteryLogEntry) => {
    switch (log.prize_type) {
      case RewardType.POINTS:
        return `Points`;
      case RewardType.CASH:
        return `Cash`;
      case RewardType.COUPON:
        return 'Coupon';
      case RewardType.PHYSICAL_PRODUCT:
        return 'Product';
      default:
        return 'Other';
    }
  };

  const formatDiscount = (coupon: any) => {
    const discountValue = parseFloat(coupon.discount_value);

    // 百分比类型优惠,抽奖的都是百分比类型的
    return `${coupon.code}(Rate +${(discountValue * 100).toFixed(1)}%)`;
  };

  const formatPrizeValue = (log: LotteryLogEntry) => {
    switch (log.prize_type) {
      case RewardType.POINTS:
        return `${log.prize} Points`;
      case RewardType.CASH:
        return `${'$'}${log.prize}(${log.prize_name})`;
      case RewardType.COUPON:
        return formatDiscount(log.prize_data.coupon);
      case RewardType.PHYSICAL_PRODUCT:
        return log.prize_name;
      default:
        return log.prize_name;
    }
  };

  const renderLogEntry = ({ item: log }: { item: LotteryLogEntry }) => (
    <View style={[
      styles.logEntry,
      { borderBottomColor: colors.border }
    ]}>
      <View style={styles.logHeader}>
        <View style={[
          styles.logIcon,
          { backgroundColor: `${getPrizeColor(log.prize_type)}15` }
        ]}>
          {getPrizeIcon(log.prize_type)}
        </View>
        <View style={styles.logContent}>
          <Text style={[styles.logActivityNo, { color: colors.primary }]}>
            {formatPrizeType(log)}
          </Text>
          <Text style={[styles.logActivityName, { color: colors.textSecondary }]}>
            {formatPrizeValue(log)}
          </Text>
        </View>
        <View style={styles.logPrize}>

          <Text style={[styles.logDate, { color: colors.textSecondary }]}>
            {formatDate(log.create_time)}
          </Text>
        </View>
      </View>
    </View>
  );

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
            <View style={styles.titleContainer}>
              <Gift size={24} color={colors.primary} />
              <View style={styles.titleTextContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Lottery History</Text>
                  <Text style={[styles.totalCount, { color: colors.textSecondary }]}>
                    Total: {lotteryLogs.length ?? 0} records
                  </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={onClose}
            >
              <X size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {logsError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {logsError}
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.error }]}
                onPress={() => user?.token && fetchLotteryLogs(user.token, true)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={lotteryLogs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderLogEntry}
              onEndReached={() => {
                if (logsInitialized && !isLoadingMoreLogs && hasMoreLogs && !isLoadingLogs) {
                  handleLoadMore();
                }
              }}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={
                !isLoadingLogs && logsInitialized ? (
                  <View style={styles.emptyContainer}>
                    <Gift size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No lottery history found
                    </Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                isLoadingMoreLogs ? (
                  <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Loading more...
                    </Text>
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
              refreshing={isLoadingLogs}
              onRefresh={() => user?.token && fetchLotteryLogs(user.token, true)}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews={true}
            />
          )}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    maxHeight: '85%',
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  titleTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  totalCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    paddingBottom: Spacing.lg,
  },
  logEntry: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  logContent: {
    flex: 1,
    gap: 2,
  },
  logActivityName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  logActivityNo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  logDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  logPrize: {
    alignItems: 'flex-end',
    gap: 4,
  },
  prizeValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  prizeIcon: {
    alignItems: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
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
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});