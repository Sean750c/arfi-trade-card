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
import { X, TrendingUp, TrendingDown, Star, Coins } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCheckinStore } from '@/stores/useCheckinStore';
import type { PointLogEntry } from '@/types';
import { formatDate } from '@/utils/date';

interface PointLogsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PointLogsModal({ visible, onClose }: PointLogsModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    pointLogs,
    pointLogsTotal,
    isLoadingPointLogs,
    isLoadingMorePointLogs,
    pointLogsError,
    hasMorePointLogs,
    fetchPointLogs,
    loadMorePointLogs,
  } = useCheckinStore();

  const [logsInitialized, setLogsInitialized] = useState(false);

  useEffect(() => {
    if (visible && user?.token) {
      setLogsInitialized(false);
      fetchPointLogs(user.token, true).then(() => setLogsInitialized(true));
    }
  }, [visible, user?.token, fetchPointLogs]);

  const handleLoadMore = useCallback(() => {
    if (user?.token) {
      loadMorePointLogs(user.token);
    }
  }, [user?.token, loadMorePointLogs]);

  const getPointChangeIcon = (points: number) => {
    if (points > 0) {
      return <TrendingUp size={16} color={colors.success} />;
    } else if (points < 0) {
      return <TrendingDown size={16} color={colors.error} />;
    }
    return <Star size={16} color={colors.primary} />;
  };

  const getPointChangeColor = (points: number) => {
    if (points > 0) return colors.success;
    if (points < 0) return colors.error;
    return colors.primary;
  };

  const formatPointChange = (points: number) => {
    if (points > 0) return `+${points}`;
    return points.toString();
  };

  const renderLogEntry = ({ item: log }: { item: PointLogEntry }) => (
    <View style={[
      styles.logEntry,
      { borderBottomColor: colors.border }
    ]}>
      <View style={styles.logHeader}>
        <View style={[
          styles.logIcon,
          { backgroundColor: log.points > 0 ? `${colors.success}15` : `${colors.error}15` }
        ]}>
          {getPointChangeIcon(log.points)}
        </View>
        <View style={styles.logContent}>
          <Text style={[styles.logTypeName, { color: colors.text }]}>
            {log.type_name}
          </Text>
          {log.content && (
            <Text style={[styles.logContent, { color: colors.textSecondary }]}>
              {log.content}
            </Text>
          )}
          {log.activity_no && (
            <Text style={[styles.logActivityNo, { color: colors.textSecondary }]}>
              Activity: {log.activity_no}
            </Text>
          )}
          <Text style={[styles.logDate, { color: colors.textSecondary }]}>
            {formatDate(log.create_time)}
          </Text>
        </View>
        <View style={styles.logPoints}>
          <Text style={[
            styles.pointsChange,
            { color: getPointChangeColor(log.points) }
          ]}>
            {formatPointChange(log.points)}
          </Text>
          <View style={styles.pointsIcon}>
            <Coins size={12} color={colors.primary} />
          </View>
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
              <Coins size={24} color={colors.primary} />
              <View style={styles.titleTextContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Points History</Text>
                {pointLogsTotal > 0 && (
                  <Text style={[styles.totalCount, { color: colors.textSecondary }]}>
                    Total: {pointLogsTotal} records
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={onClose}
            >
              <X size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {pointLogsError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {pointLogsError}
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.error }]}
                onPress={() => user?.token && fetchPointLogs(user.token, true)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={pointLogs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderLogEntry}
              onEndReached={() => {
                if (logsInitialized && !isLoadingMorePointLogs && hasMorePointLogs && !isLoadingPointLogs) {
                  handleLoadMore();
                }
              }}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={
                !isLoadingPointLogs && logsInitialized ? (
                  <View style={styles.emptyContainer}>
                    <Coins size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No points history found
                    </Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                isLoadingMorePointLogs ? (
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
              refreshing={isLoadingPointLogs}
              onRefresh={() => user?.token && fetchPointLogs(user.token, true)}
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
  logTypeName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  logContentText: {
    fontSize: 13,
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
  logPoints: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pointsChange: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  pointsIcon: {
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