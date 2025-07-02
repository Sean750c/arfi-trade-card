import React, { useEffect, useState, useRef } from 'react';
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
  Modal,
  Animated,
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
import * as Clipboard from 'expo-clipboard';
import { Share as RNShare } from 'react-native';
import MyInvitesList from '@/components/invite/MyInvitesList';

function AnimatedNumber({value, style, prefix = ''}: {value: number, style?: any, prefix?: string}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
    const id = anim.addListener(({value}) => setDisplay(value));
    return () => anim.removeListener(id);
  }, [value]);
  return <Text style={style}>{prefix}{Math.round(display)}</Text>;
}

function ReferScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    inviteInfo,
    inviteRank,
    fetchInviteInfo,
    fetchInviteRank,
    isReceivingInviteRebate,
  } = useInviteStore();

  const [showInvitesModal, setShowInvitesModal] = useState(false);

  // 新增Animated.Value用于奖励数字
  const totalRewardsAnim = useRef(new Animated.Value(0)).current;
  const availableAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user?.token) {
      fetchInviteInfo(user.token);
      fetchInviteRank(user.token);
    }
  }, [user?.token, fetchInviteInfo, fetchInviteRank]);

  useEffect(() => {
    if (inviteInfo) {
      Animated.timing(totalRewardsAnim, {
        toValue: inviteInfo.referred_total_bonus ?? 0,
        duration: 800,
        useNativeDriver: false,
      }).start();
      Animated.timing(availableAnim, {
        toValue: inviteInfo.can_receive_money ?? 0,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [inviteInfo]);

  // Claim reward
  const handleReceive = () => {
    setShowInvitesModal(true);
  };

  // 复制链接
  const handleCopyLink = async () => {
    if (inviteInfo?.act_url) {
      await Clipboard.setStringAsync(inviteInfo.act_url);
      Alert.alert('Copied', 'Referral link copied!');
    }
  };

  // 分享链接
  const handleShare = async () => {
    try {
      if (inviteInfo?.act_url) {
        await RNShare.share({ message: inviteInfo.act_url });
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  // Render rank
  const renderRankItem = (item: any, idx: number, isMe = false) => (
    <View
      key={item.user_id || idx}
      style={[
        styles.rankItem,
        { backgroundColor: isMe ? colors.warning : idx < 3 ? colors.background : colors.card, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.rankIndex, { color: colors.primary }]}>{item.rank ?? item.top}</Text>
      <Text style={[styles.rankName, { color: colors.text }]}>{item.username}{isMe ? ' (Me)' : ''}</Text>
      <Text style={[styles.rankAmount, { color: colors.success }]}>
        ₦{item.total_amount ?? item.amount}
      </Text>
    </View>
  );

  // ListHeaderComponent
  const renderHeader = () => (
    <>
      {/* Banner */}
      <LinearGradient colors={[colors.primary, colors.card]} style={styles.banner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.bannerBack}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bannerTitle}>Refer & Earn</Text>
        <Text style={styles.bannerSubtitle}>Invite friends and earn rewards together!</Text>
      </LinearGradient>
      {/* Stats Card */}
      <View style={styles.statsCardShadow}>
        <Card style={[styles.statsCard, { backgroundColor: colors.card }]}> 
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <AnimatedNumber value={inviteInfo?.referred_total_bonus ?? 0} style={[styles.statValue, { color: colors.primary }]} prefix="₦" />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Rewards</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{inviteInfo?.invite_friends ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Invited Friends</Text>
            </View>
            <View style={styles.statBox}>
              <AnimatedNumber value={inviteInfo?.can_receive_money ?? 0} style={[styles.statValue, { color: colors.primary }]} prefix="₦" />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Available</Text>
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
        <Card style={[styles.progressCard, { backgroundColor: colors.card }]}> 
          <Text style={[styles.progressTitle, { color: colors.text }]} >Invite Progress</Text>
          <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.progressBarWrap}>
            {inviteInfo.rebate_money_config.map((amount, idx) => {
              const reached = (inviteInfo.invite_friends ?? 0) > idx;
              const current = (inviteInfo.invite_friends ?? 0) === idx;
              return (
                <View key={idx} style={styles.progressStepWrapRow}>
                  <View style={styles.progressStepWrap}>
                    <View
                      style={[
                        styles.progressCircle,
                        { backgroundColor: reached ? colors.primary : current ? colors.warning : colors.background },
                      ]}
                    >
                      <Text style={[
                        styles.progressCircleText,
                        { color: reached || current ? '#fff' : colors.textSecondary },
                      ]}>
                        {idx + 1}
                      </Text>
                    </View>
                    <Text style={[styles.progressStepAmount, { color: colors.primary }]}>₦{amount}</Text>
                  </View>
                  {idx < inviteInfo.rebate_money_config.length - 1 && <View style={[styles.progressLine, { backgroundColor: colors.border }]} />}
                </View>
              );
            })}
          </RNScrollView>

          {/* 奖励说明 */}
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>1. When your friend completes an order of <Text style={[styles.infoHighlight, { color: colors.primary }]} >${inviteInfo.recommend_enough_amount}</Text>.</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>2. They will receive a rebate of <Text style={[styles.infoHighlight, { color: colors.primary }]}>{user?.currency_symbol}{inviteInfo.friend_amount}</Text>.</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>3. You will also receive a rebate of <Text style={[styles.infoHighlight, { color: colors.primary }]}>{user?.currency_symbol}{inviteInfo.self_amount}</Text>.</Text>
        </Card>
      )}
      {/* Referral Link Card */}
      <Card style={[styles.linkCard, { backgroundColor: colors.card }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Referral Link</Text>
        <View style={[styles.linkContainer, { borderColor: colors.border, backgroundColor: colors.background }]}> 
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
    </>
  );

  // ListFooterComponent
  const renderFooter = () => (
    <>
      {/* Invite Rank */}
      <View><Text style={[styles.listSectionTitle, { color: colors.primary }]}>Top Inviters</Text></View>
      <Card style={[styles.rankCard, { backgroundColor: colors.card }]}> 
        {inviteRank && Array.isArray(inviteRank.top_list) && inviteRank.top_list.length > 0 ? inviteRank.top_list.map((item, idx) => (
          <React.Fragment key={item.user_id || idx}>
            {typeof item === 'string' ? <Text style={{ color: colors.text }}>{item}</Text> : renderRankItem(item, idx)}
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
      />
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 32 }}>
        {renderHeader()}
        {renderFooter()}
        <MyInvitesList
          visible={showInvitesModal}
          onClose={() => setShowInvitesModal(false)}
          token={user?.token || ''}
          colors={colors}
        />
      </ScrollView>
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  listSectionTitle: {
    fontSize: 14,
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
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    padding: 0,
    backgroundColor: '#fff',
    overflow: 'hidden',
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
    marginHorizontal: Spacing.lg,
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
  myInvitesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 20,
  },
});