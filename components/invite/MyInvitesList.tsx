import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
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
}

// 新增ReferralItem组件
interface ReferralItemProps {
  item: InviteDetailItem;
  index: number;
  colors: any;
  canClaim: boolean;
  statusInfo: { text: string; color: string };
  handleClaim: (item: InviteDetailItem) => void;
  isReceivingInviteRebate: boolean;
  styles: {
    referralItem: StyleProp<ViewStyle>;
    avatar: StyleProp<ViewStyle>;
    referralInfo: StyleProp<ViewStyle>;
    referralName: StyleProp<TextStyle>;
    referralDate: StyleProp<TextStyle>;
    statusText: StyleProp<TextStyle>;
    rightSection: StyleProp<ViewStyle>;
    referralEarnings: StyleProp<TextStyle>;
    claimButton: StyleProp<ViewStyle>;
    claimButtonText: StyleProp<TextStyle>;
  };
}
function ReferralItem({ item, index, colors, canClaim, statusInfo, handleClaim, isReceivingInviteRebate, styles }: ReferralItemProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
      }}
    >
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
    </Animated.View>
  );
}

export default function MyInvitesList({
  visible,
  onClose,
  token,
  colors,
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
      Alert.alert(
        'Confirm Claim',
        `Are you sure you want to claim the invite reward for ${item.username}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                await receiveInviteRebate(token, item.user_id);
                // 领取成功后刷新列表
                fetchInvitingList(token, true);
              } catch (error) {
                // 错误处理已在store中处理
              }
            },
          },
        ]
      );
    }
  };

  // 渲染单个邀请用户
  const renderReferralItem = ({ item, index }: { item: InviteDetailItem, index: number }) => {
    const statusInfo = getStatusInfo(item.status);
    const canClaim = item.status === 1;
    return (
      <ReferralItem
        item={item}
        index={index}
        colors={colors}
        canClaim={canClaim}
        statusInfo={statusInfo}
        handleClaim={handleClaim}
        isReceivingInviteRebate={isReceivingInviteRebate}
        styles={styles}
      />
    );
  };

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
            <Text style={[styles.modalTitle, { color: colors.text }]}>My Invited Users</Text>
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
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
              ListFooterComponent={
                isLoadingInvitingList && invitingList.length > 0 ? (
                  <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
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
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
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
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  referralDate: {
    fontSize: 12,
    color: '#888',
  },
  referralEarnings: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  emptyReferrals: {
    padding: 24,
    alignItems: 'center',
  },
  emptyReferralsText: {
    fontSize: 14,
    color: '#888',
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#F1F1F1',
    marginLeft: 64,
  },
}); 