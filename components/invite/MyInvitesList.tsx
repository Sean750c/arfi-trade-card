import React, { useEffect, useCallback, useState, ReactElement } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';
import Spacing from '@/constants/Spacing';
import { useInviteStore } from '@/stores/useInviteStore';
import type { InviteDetailItem } from '@/types';

interface MyInvitesListProps {
  visible: boolean;
  onClose: () => void;
  token: string;
  colors: any;
  styles: any;
}

export default function MyInvitesList({
  visible,
  onClose,
  token,
  colors,
  styles,
}: MyInvitesListProps) {
  const {
    invitingList,
    hasMore,
    isLoadingInvitingList,
    invitingListError,
    fetchInvitingList,
    loadMoreInvitingList,
    receiveInviteRebate,
    isReceivingInviteRebate,
  } = useInviteStore();
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (visible && token) {
      setInitialized(false);
      fetchInvitingList(token, true).then(() => setInitialized(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, token]);

  const handleLoadMore = () => {
    if (!isLoadingInvitingList && hasMore && initialized) {
      loadMoreInvitingList(token);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInvitingList(token, true).then(() => setRefreshing(false));
  };

  // 获取状态文本和颜色
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { text: 'Pending', color: '#F59E0B' };
      case 1:
        return { text: 'Unclaimed', color: '#EF4444' };
      case 2:
        return { text: 'Claimed', color: '#10B981' };
      default:
        return { text: 'Unknown', color: '#6B7280' };
    }
  };

  // 处理领取
  const handleClaim = async (item: InviteDetailItem) => {
    if (item.status === 1 && token) {
      try {
        await receiveInviteRebate(token, item.user_id);
        // 领取成功后刷新列表
        fetchInvitingList(token, true);
      } catch (error) {
        // 错误处理已在store中处理
      }
    }
  };

  // 渲染单个邀请用户
  const renderReferralItem = ({ item }: { item: InviteDetailItem }) => {
    const statusInfo = getStatusInfo(item.status);
    const canClaim = item.status === 1;

    return (
      <View style={styles.referralItem}>
        <View style={styles.avatar}><Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.username?.[0]?.toUpperCase() || '?'}</Text></View>
        <View style={styles.referralInfo}>
          <Text style={styles.referralName}>{item.username}</Text>
          <Text style={styles.referralDate}>Joined: {item.register_date}</Text>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.referralEarnings}>{item.amount ? `${item.currency_symbol}${item.amount}` : ''}</Text>
          {canClaim && (
            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: colors.primary }]}
              onPress={() => handleClaim(item)}
              disabled={isReceivingInviteRebate}
            >
              <Text style={styles.claimButtonText}>
                {isReceivingInviteRebate ? 'Claiming...' : 'Claim'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={[modalStyles.modalContent, { backgroundColor: colors.card }]}> 
          <View style={modalStyles.modalHeader}>
            <Text style={[modalStyles.modalTitle, { color: colors.text }]}>My Invited Users</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {invitingListError ? (
            <Text style={{ color: colors.error, textAlign: 'center', marginTop: 20 }}>{invitingListError}</Text>
          ) : (
            <FlatList
              data={invitingList}
              keyExtractor={(item, idx) => String(item.user_id || idx)}
              renderItem={renderReferralItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                isLoadingInvitingList && invitingList.length > 0 ? (
                  <View style={modalStyles.loadingFooter}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.modalList}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              ListEmptyComponent={
                isLoadingInvitingList ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 32 }} />
                ) : (
                  <View style={styles.emptyReferrals}>
                    <Text style={[styles.emptyReferralsText, { color: colors.textSecondary }]}>No invitees yet</Text>
                  </View>
                )
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
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
    fontWeight: 'bold',
  },
  modalList: {
    paddingBottom: Spacing.lg,
  },
  loadingFooter: {
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  claimButton: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 