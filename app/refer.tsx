import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share, Copy, User, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import AuthGuard from '@/components/UI/AuthGuard';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useInviteStore } from '@/stores/useInviteStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { InviteDetailItem } from '@/types';
import { ScrollView as RNScrollView } from 'react-native';

function ReferScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    inviteInfo,
    inviteRank,
    invitingList,
    isLoadingInvitingList,
    invitingListError,
    fetchInviteInfo,
    fetchInviteRank,
    fetchInvitingList,
    loadMoreInvitingList,
    receiveInviteRebate,
    isReceivingInviteRebate,
  } = useInviteStore();

  useEffect(() => {
    if (user?.token) {
      fetchInviteInfo(user.token);
      fetchInviteRank(user.token);
      fetchInvitingList(user.token, true);
    }
  }, [user?.token, fetchInviteInfo, fetchInviteRank, fetchInvitingList]);

  // Claim reward
  const handleReceive = () => {
    if (user?.token && inviteInfo?.can_receive_money) {
      receiveInviteRebate(user.token, user.user_id);
    }
  };

  // Copy/share
  const handleCopyLink = () => {
    if (inviteInfo?.act_url) {
      Alert.alert('Copied', 'Referral link copied!');
    }
  };
  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Share', 'Sharing is not available on web');
      } else {
        Alert.alert('Share', 'Sharing options would open here');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  // Pagination
  const handleLoadMore = () => {
    if (user?.token && !isLoadingInvitingList) {
      loadMoreInvitingList(user.token);
    }
  };
  // Refresh
  const handleRefresh = () => {
    if (user?.token) {
      fetchInvitingList(user.token, true);
    }
  };

  // Render invitee
  const renderReferralItem = ({ item }: { item: InviteDetailItem }) => (
    <View style={styles.referralItem}>
      <View style={styles.avatar}><User size={20} color={colors.primary} /></View>
      <View style={styles.referralInfo}>
        <Text style={styles.referralName}>{item.username}</Text>
        <Text style={styles.referralDate}>Joined: {item.register_date}</Text>
      </View>
      <Text style={styles.referralEarnings}>{item.amount ? `₦${item.amount}` : ''}</Text>
    </View>
  );

  // Render rank
  const renderRankItem = (item: any, idx: number, isMe = false) => (
    <View key={item.user_id || idx} style={[styles.rankItem, isMe ? styles.myRank : idx < 3 ? styles.topRank : null]}>
      <Text style={styles.rankIndex}>{item.rank ?? item.top}</Text>
      <Text style={styles.rankName}>{item.username}{isMe ? ' (Me)' : ''}</Text>
      <Text style={styles.rankAmount}>₦{item.total_amount ?? item.amount}</Text>
    </View>
  );

  // ListHeaderComponent
  const renderHeader = () => (
    <>
      {/* Banner */}
      <LinearGradient colors={[colors.primary, '#2563eb']} style={styles.banner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.bannerBack}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bannerTitle}>Refer & Earn</Text>
        <Text style={styles.bannerSubtitle}>Invite friends and earn rewards together!</Text>
      </LinearGradient>
      {/* Stats Card */}
      <View style={styles.statsCardShadow}>
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>₦{inviteInfo?.referred_total_bonus ?? 0}</Text>
              <Text style={styles.statLabel}>Total Rewards</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{inviteInfo?.invite_friends ?? 0}</Text>
              <Text style={styles.statLabel}>Invited Friends</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>₦{inviteInfo?.can_receive_money ?? 0}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
          <Button
            title={isReceivingInviteRebate ? 'Claiming...' : 'Claim Reward'}
            onPress={handleReceive}
            style={styles.claimButton}
            disabled={isReceivingInviteRebate}
            fullWidth
          />
        </Card>
      </View>
      {/* Progress Bar 横向滚动 */}
      {inviteInfo && (
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>Invite Progress</Text>
          <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.progressBarWrap}>
            {inviteInfo.rebate_money_config.map((amount, idx) => {
              const reached = (inviteInfo.invite_friends ?? 0) > idx;
              const current = (inviteInfo.invite_friends ?? 0) === idx;
              return (
                <View key={idx} style={styles.progressStepWrapRow}>
                  <View style={styles.progressStepWrap}>
                    <View style={[styles.progressCircle, reached && styles.progressCircleReached, current && styles.progressCircleCurrent]}>
                      <Text style={[styles.progressCircleText, (reached || current) && styles.progressCircleTextActive]}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.progressStepAmount}>₦{amount}</Text>
                  </View>
                  {idx < inviteInfo.rebate_money_config.length - 1 && <View style={styles.progressLine} />}
                </View>
              );
            })}
          </RNScrollView>

          {/* 奖励说明 */}
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            1. When your friend completes an order of <Text style={styles.infoHighlight}>${inviteInfo.recommend_enough_amount}</Text>.
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            2. They will receive a rebate of <Text style={styles.infoHighlight}>{user?.currency_symbol}{inviteInfo.friend_amount}</Text>.
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            3. You will also receive a rebate of <Text style={styles.infoHighlight}>{user?.currency_symbol}{inviteInfo.self_amount}</Text>.
          </Text>
        </Card>
      )}
      {/* Referral Link Card */}
      <Card style={styles.linkCard}>
        <Text style={styles.sectionTitle}>Your Referral Link</Text>
        <View style={styles.linkContainer}>
          <TouchableOpacity style={styles.linkAction} onPress={handleCopyLink}>
            <Copy size={18} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.linkInput, { color: colors.text }]}
            value={inviteInfo?.act_url ?? ''}
            editable={false}
            selectTextOnFocus
          />
          <TouchableOpacity style={styles.linkAction} onPress={handleShare}>
            <Share size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>
      {/* Section Title: My Invites */}
      <View><Text style={styles.listSectionTitle}>My Invites</Text></View>
    </>
  );

  // ListFooterComponent
  const renderFooter = () => (
    <>
      {/* Invite Rank */}
      <View><Text style={styles.listSectionTitle}>Top Inviters</Text></View>
      <Card style={styles.rankCard}>
        {inviteRank && Array.isArray(inviteRank.top_list) && inviteRank.top_list.length > 0 ? inviteRank.top_list.map((item, idx) => (
          <React.Fragment key={item.user_id || idx}>
            {typeof item === 'string' ? <Text>{item}</Text> : renderRankItem(item, idx)}
          </React.Fragment>
        )) : (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 8 }}>No ranking data</Text>
        )}
        {inviteRank?.my_top && renderRankItem(inviteRank.my_top, 999, true)}
      </Card>
      <Button
        title="Share Referral Link"
        onPress={handleShare}
        style={styles.shareButton}
        fullWidth
      />
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={invitingList}
        renderItem={renderReferralItem}
        keyExtractor={(item, idx) => String(item.user_id || `${item.username}_${item.register_date}_${idx}`)}
        ListEmptyComponent={isLoadingInvitingList ? (
          <View style={styles.emptyReferrals}><Text style={{ color: colors.textSecondary }}>Loading...</Text></View>
        ) : invitingListError ? (
          <View style={styles.emptyReferrals}><Text style={{ color: 'red' }}>{invitingListError}</Text></View>
        ) : (
          <View style={styles.emptyReferrals}><Text style={[styles.emptyReferralsText, { color: colors.textSecondary }]}>No invitees yet</Text></View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshControl={<RefreshControl refreshing={isLoadingInvitingList} onRefresh={handleRefresh} />}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        style={{ backgroundColor: '#F5F7FB' }}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}

export default function ReferScreen() {
  return (
    <AuthGuard>
      <ReferScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'flex-start',
    marginBottom: -12,
  },
  bannerBack: {
    position: 'absolute',
    top: 36,
    left: Spacing.lg,
    zIndex: 2,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: 0.5,
    marginLeft: 42,
  },
  bannerSubtitle: {
    color: '#E0E7FF',
    fontSize: 15,
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginLeft: 42,
  },
  statsCardShadow: {
    marginTop: -32,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  claimButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  progressStepWrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xxs,
  },
  progressStepWrap: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: Spacing.xxs,
  },
  progressStepAmount: {
    fontSize: 10,
    color: '#2563eb',
    marginHorizontal: Spacing.xxs,
    fontWeight: 'bold',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleReached: {
    backgroundColor: '#2563eb',
  },
  progressCircleCurrent: {
    backgroundColor: '#FDE68A',
  },
  progressCircleText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
  },
  progressCircleTextActive: {
    color: '#fff',
  },
  progressLine: {
    width: 28,
    height: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 2,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  progressTip: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginLeft: 2,
  },
  linkCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginHorizontal: 16,
    marginTop: Spacing.sm,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#eee',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  linkInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: 'transparent',
  },
  linkAction: {
    padding: 8,
    borderRadius: 8,
  },
  listCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 0,
    backgroundColor: '#fff',
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
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
  rankCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 0,
    backgroundColor: '#fff',
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    backgroundColor: '#fff',
  },
  myRank: {
    backgroundColor: '#FFFBEA',
  },
  topRank: {
    backgroundColor: '#F0F9FF',
  },
  rankIndex: {
    width: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  rankName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  rankAmount: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  shareButton: {
    marginHorizontal: 16,
    marginBottom: Spacing.xxl,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
    lineHeight: 16,
  },
  infoHighlight: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});