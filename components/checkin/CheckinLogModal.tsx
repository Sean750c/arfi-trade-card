import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { X, Calendar, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { formatDate } from '@/utils/date';
import RewardIcon from './RewardIcon';
import type { CheckinLogEntry } from '@/types';

interface CheckinLogModalProps {
  visible: boolean;
  onClose: () => void;
  checkinLogs: CheckinLogEntry[] | undefined; // Directly pass logs
  currencySymbol: string;
}

export default function CheckinLogModal({
  visible,
  onClose,
  checkinLogs,
  currencySymbol,
}: CheckinLogModalProps) {
  const { colors } = useTheme();

  const renderLogEntry = ({ item: log }: { item: CheckinLogEntry }) => (
    <View style={[styles.logEntry, { borderBottomColor: colors.border }]}>
      <View style={styles.logHeader}>
        <View style={[styles.logIcon, { backgroundColor: `${colors.primary}15` }]}>
          <TrendingUp size={16} color={colors.primary} />
        </View>
        <View style={styles.logContent}>
          <Text style={[styles.logMemo, { color: colors.text }]}>
            {(log.type === 1 ? 'Daily Check-in' : 'Make-up Sign')}
          </Text>
          <Text style={[styles.logDate, { color: colors.textSecondary }]}>
            {log.date}
          </Text>
        </View>
        <View style={styles.logReward}>
          <RewardIcon
            type={log.extra_reward_type}
            value={log.extra_reward}
            currencySymbol={currencySymbol}
            size={24}
            iconSize={14}
            fontSize={12}
            showValue={true}
          />
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
              <Calendar size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Check-in History
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {checkinLogs && checkinLogs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calendar size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No check-in history found for this period.
              </Text>
            </View>
          ) : (
            <FlatList
              data={checkinLogs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderLogEntry}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  logMemo: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  logDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  logReward: {
    alignItems: 'flex-end',
  },
  loadingFooter: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
