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
import { X, TrendingUp } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useVIPStore } from '@/stores/useVIPStore';
import type { VIPLogEntry } from '@/types';
import { formatDate as formatDateUtil } from '@/utils/date';

interface VIPLogListProps {
  visible: boolean;
  onClose: () => void;
}

export default function VIPLogList({ visible, onClose }: VIPLogListProps) {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    vipLogs,
    isLoadingLogs,
    isLoadingMore,
    logsError,
    fetchVIPLogs,
    loadMoreLogs,
    hasMore,
  } = useVIPStore();

  const [logsInitialized, setLogsInitialized] = useState(false);

  useEffect(() => {
    if (visible && user?.token) {
      setLogsInitialized(false);
      fetchVIPLogs(user.token, true).then(() => setLogsInitialized(true));
    }
  }, [visible, user?.token, fetchVIPLogs]);

  const handleLoadMore = useCallback(() => {
    if (user?.token) {
      loadMoreLogs(user.token);
    }
  }, [user?.token, loadMoreLogs]);

  const formatDate = (timestamp: number) => formatDateUtil(timestamp);

  const formatExpChange = (exp: number) => {
    return exp > 0 ? `+${exp}` : exp.toString();
  };

  const renderLogEntry = ({ item: log }: { item: VIPLogEntry }) => (
    <View style={[
      styles.logEntry,
      { borderBottomColor: colors.border }
    ]}>
      <View style={styles.logHeader}>
        <View style={[
          styles.logIcon,
          { backgroundColor: log.exp > 0 ? `${colors.success}15` : `${colors.error}15` }
        ]}>
          {log.exp > 0 ? (
            <TrendingUp size={16} color={colors.success} />
          ) : (
            <TrendingUp size={16} color={colors.error} style={{ transform: [{ rotate: '180deg' }] }} />
          )}
        </View>
        <View style={styles.logContent}>
          <Text style={[styles.logSource, { color: colors.text }]}>
            {log.source}
          </Text>
          <Text style={[styles.logDate, { color: colors.textSecondary }]}>
            {formatDate(log.create_time)}
          </Text>
        </View>
        <View style={styles.logExp}>
          <Text style={[
            styles.expChange,
            { color: log.exp > 0 ? colors.success : colors.error }
          ]}>
            {formatExpChange(log.exp)} EXP
          </Text>
          <Text style={[styles.afterExp, { color: colors.textSecondary }]}>
            Total: {log.after_exp.toLocaleString()}
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>EXP History</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {logsError ? (
            <Text style={{ color: colors.error, textAlign: 'center', marginTop: 20 }}>{logsError}</Text>
          ) : (
            <FlatList
              data={vipLogs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderLogEntry}
              onEndReached={() => {
                if (logsInitialized && !isLoadingMore && hasMore && !isLoadingLogs) {
                  handleLoadMore();
                }
              }}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={
                !isLoadingLogs && logsInitialized ? (
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 32 }}>
                    No history found
                  </Text>
                ) : null
              }
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
              refreshing={isLoadingLogs}
              onRefresh={() => user?.token && fetchVIPLogs(user.token, true)}
              initialNumToRender={6}
              maxToRenderPerBatch={8}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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
    alignItems: 'center',
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  logContent: {
    flex: 1,
  },
  logSource: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  logMemo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  logDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  logExp: {
    alignItems: 'flex-end',
  },
  expChange: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  afterExp: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  loadingFooter: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
}); 