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
import {
  X,
  Coins,
  Smartphone,
  Truck,
  Lightbulb,
  Tv,
  CircleCheck,
  CircleX,
  Clock,
} from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUtilitiesStore } from '@/stores/useUtilitiesStore';
import type { RechargeLogEntry } from '@/types';
import { formatDate } from '@/utils/date';

interface RechargeLogsModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  type: 'phone' | 'cable' | 'electricity' | 'internet' | 'lottery' | 'all';
}

export default function RechargeLogsModal({ title, visible, onClose, type }: RechargeLogsModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    rechargeLogs,
    isLoadingRechargeLogs,
    isLoadingMoreRechargeLogs,
    rechargeLogsError,
    hasMoreRechargeLogs,
    fetchRechargeLogs,
    loadMoreRechargeLogs,
  } = useUtilitiesStore();

  const [logsInitialized, setLogsInitialized] = useState(false);

  // ✅ 保留原始获取数据逻辑
  useEffect(() => {
    if (visible && user?.token) {
      setLogsInitialized(false);
      fetchRechargeLogs(user.token, type, true).then(() => setLogsInitialized(true));
    }
  }, [visible, user?.token, type, fetchRechargeLogs]);

  const handleLoadMore = useCallback(() => {
    if (user?.token) {
      loadMoreRechargeLogs(user.token, type);
    }
  }, [user?.token, type, loadMoreRechargeLogs]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return colors.success;
      case 'failed':
      case 'error':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getTypeLabel = (v: number) => {
    switch (v) {
      case 1:
        return 'Airtime Purchase';
      case 2:
        return 'Data Purchase';
      case 3:
        return 'Logistics';
      case 4:
        return 'Electricity';
      case 5:
        return 'Cable TV';
      default:
        return 'Other';
    }
  };

  // 🌈 UI增强：根据类型给图标与卡片点缀色
  const getTypeAccentColor = (v: number) => {
    switch (v) {
      case 1:
      case 2:
        return colors.primary;
      case 3:
        return colors.primary; // 也可自定义物流色
      case 4:
        return colors.warning;
      case 5:
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };
  const getTypeIcon = (v: number) => {
    switch (v) {
      case 1:
      case 2:
        return <Smartphone size={20} color={getTypeAccentColor(v)} />;
      case 3:
        return <Truck size={20} color={getTypeAccentColor(v)} />;
      case 4:
        return <Lightbulb size={20} color={getTypeAccentColor(v)} />;
      case 5:
        return <Tv size={20} color={getTypeAccentColor(v)} />;
      default:
        return <Coins size={20} color={getTypeAccentColor(v)} />;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CircleCheck size={16} color={colors.success} />;
      case 'failed':
      case 'error':
        return <CircleX size={16} color={colors.error} />;
      case 'pending':
      default:
        return <Clock size={16} color={colors.warning} />;
    }
  };

  // 🎨 卡片化的单项渲染（仅UI变更，不动数据）
  const renderLogEntry = ({ item: log }: { item: RechargeLogEntry }) => {
    const accent = getTypeAccentColor(log.type);
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.text,
          },
        ]}
      >
        {/* 左侧圆形图标 */}
        <View style={[styles.iconContainer, { backgroundColor: `${accent}15` }]}>
          {getTypeIcon(log.type)}
        </View>

        {/* 右侧详情 */}
        <View style={styles.cardDetails}>
          {/* 标题 + 金额 */}
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {getTypeLabel(log.type)}
            </Text>
            <Text style={[styles.cardAmount, { color: colors.success }]}>
              {String(log.amount)}
            </Text>
          </View>

          {/* 运营商 */}
          {(log.merchant_name || log.account_no) && (
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {log.merchant_name} {log.account_no}
            </Text>
          )}

          {log.transaction_id && (
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {log.transaction_id}
            </Text>
          )}

          {log.reference_no && (
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {log.reference_no}
            </Text>
          )}

          {/* 状态 + 时间 */}
          <View style={styles.statusRow}>
            <View style={styles.statusChip}>
              {getStatusIcon(log.transaction_status)}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(log.transaction_status) },
                ]}
              >
                {log.transaction_status}
              </Text>
            </View>
            <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
              {formatDate(log.create_time)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* 头部 */}
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* 错误状态（逻辑不变） */}
          {rechargeLogsError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{rechargeLogsError}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.error }]}
                onPress={() => user?.token && fetchRechargeLogs(user.token, type, true)}
                activeOpacity={0.9}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={rechargeLogs}
              // 不改动你原来的 key 逻辑，保持最小侵入
              keyExtractor={(item, index) => (item.log_id ?? item.log_id ?? index).toString()}
              renderItem={renderLogEntry}
              onEndReached={() => {
                if (
                  logsInitialized &&
                  !isLoadingMoreRechargeLogs &&
                  hasMoreRechargeLogs &&
                  !isLoadingRechargeLogs
                ) {
                  handleLoadMore();
                }
              }}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={
                !isLoadingRechargeLogs && logsInitialized ? (
                  <View style={styles.emptyContainer}>
                    <Coins size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No history found
                    </Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                isLoadingMoreRechargeLogs ? (
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
              refreshing={isLoadingRechargeLogs}
              onRefresh={() => user?.token && fetchRechargeLogs(user.token, type, true)}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // —— Modal 外层保持不变，仅微调阴影/圆角 —— //
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
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  titleTextContainer: { flex: 1 },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },

  // —— 卡片化样式（参考 TransactionList） —— //
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardDetails: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  cardSub: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  cardDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  // —— 原有的空/加载/错误 —— //
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
