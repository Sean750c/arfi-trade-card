import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  Pressable,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck as CheckCircle,
  CalendarDays,
  Clock,
  Star,
  Info,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { CheckinRule, RewardType } from '@/types';
import RewardIcon from './RewardIcon';

interface CheckinCalendarProps {
  rules: CheckinRule[] | undefined;
  onCheckin: (ruleId: number) => void;
  onMakeUpSign: (ruleId: number) => void;
  currentDisplayDate: string; // YYYY-MM-DD
  onDateChange: (direction: 'prev' | 'next') => void;
  isLoading: boolean;
  isCheckingIn: boolean;
  userPoints: number;
  currencySymbol: string;
  maxMakeUpSigns: number;
  usedMakeUpSigns: number;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const DAY_WIDTH = screenWidth / 4.5;
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CheckinCalendar({
  rules,
  onCheckin,
  onMakeUpSign,
  currentDisplayDate,
  onDateChange,
  isLoading,
  isCheckingIn,
  userPoints,
  currencySymbol,
  maxMakeUpSigns,
  usedMakeUpSigns,
  hasPrev,
  hasNext,
}: CheckinCalendarProps) {
  const { colors } = useTheme();
  const bodyScrollRef = useRef<ScrollView>(null);
  const headerScrollRef = useRef<ScrollView>(null);
  const lastNavRef = useRef<null | 'prev' | 'next'>(null);
  const [blockedDir, setBlockedDir] = useState<null | 'prev' | 'next'>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{ type: RewardType; value: any; description?: string } | null>(null);

  const [rewardTableVisible, setRewardTableVisible] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const bj = new Date(utc + 8 * 3600 * 1000);
    return `${bj.getFullYear()}-${(bj.getMonth() + 1).toString().padStart(2, '0')}-${bj.getDate().toString().padStart(2, '0')}`;
  }, []);

  const currentDisplayMonthYear = useMemo(() => {
    const d = new Date(currentDisplayDate);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }, [currentDisplayDate]);

  const parseYMD = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const toMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const getDayStatus = (rule: CheckinRule) => {
    const ruleDate = parseYMD(rule.date);
    const todayDate = parseYMD(today);
    const r = toMidnight(ruleDate);
    const t = toMidnight(todayDate);

    if (rule.is_checkin) return 'signed';
    if (r === t) return 'today';
    if (r < t) return 'past';
    return 'future';
  };

  const handleDayPress = (rule: CheckinRule) => {
    const status = getDayStatus(rule);
    if (status === 'today') {
      onCheckin(rule.id);
    } else if (status === 'past' && usedMakeUpSigns < maxMakeUpSigns) {
      onMakeUpSign(rule.id);
    }
  };

  const handleRewardPress = (rule: CheckinRule) => {
    if (rule.extra_reward_type && rule.extra_reward) {
      setSelectedReward({
        type: rule.extra_reward_type,
        value: rule.extra_reward,
        description: 'Extra reward for this day',
      });
      setRewardModalVisible(true);
    }
  };

  useEffect(() => {
    if (!rules || rules.length === 0) {
      setBlockedDir(lastNavRef.current);
    } else {
      setBlockedDir(null);
    }
  }, [rules]);

  useEffect(() => {
    if (!bodyScrollRef.current || !headerScrollRef.current || !rules) return;
    const idx = rules.findIndex((r) => r.date === today);
    const x = Math.max(0, (idx === -1 ? 0 : idx) * DAY_WIDTH);
    bodyScrollRef.current.scrollTo({ x, animated: true });
    headerScrollRef.current.scrollTo({ x, animated: false });
  }, [rules, today]);

  const syncHeaderScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    headerScrollRef.current?.scrollTo({ x, animated: false });
  };

  const canPrev = (hasPrev ?? true) && blockedDir !== 'prev';
  const canNext = (hasNext ?? true) && blockedDir !== 'next';

  const onPressPrev = () => {
    if (!canPrev || isNavigating) return;
    lastNavRef.current = 'prev';
    setIsNavigating(true);
    onDateChange('prev');
    setTimeout(() => setIsNavigating(false), 500);
  };
  const onPressNext = () => {
    if (!canNext || isNavigating) return;
    lastNavRef.current = 'next';
    setIsNavigating(true);
    onDateChange('next');
    setTimeout(() => setIsNavigating(false), 500);
  };

  const renderDay = (rule: CheckinRule) => {
    const date = parseYMD(rule.date);
    const dayOfMonth = date.getDate();
    const status = getDayStatus(rule);
    const isClickable =
      (status === 'today' && !isCheckingIn) ||
      (status === 'past' && usedMakeUpSigns < maxMakeUpSigns && !isCheckingIn);

    let dayStyle: any = {};
    let textStyle: any = { color: colors.text };
    let icon: React.ReactNode = null;

    switch (status) {
      case 'signed':
        dayStyle = { backgroundColor: `${colors.primary}15`, borderColor: colors.primary };
        textStyle = { color: colors.text };
        icon = <CheckCircle size={16} color={colors.primary} />;
        break;
      case 'today':
        dayStyle = { backgroundColor: colors.primary, borderColor: colors.primary };
        textStyle = { color: '#FFFFFF' };
        icon = isCheckingIn ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
        );
        break;
      case 'past':
        dayStyle = { backgroundColor: colors.card, borderColor: colors.border };
        textStyle = { color: colors.text };
        icon =
          !rule.is_checkin && usedMakeUpSigns < maxMakeUpSigns ? (
            <Clock size={16} color={colors.warning} />
          ) : (
            <Clock size={16} color={colors.textSecondary} />
          );
        break;
      case 'future':
        dayStyle = { backgroundColor: `${colors.border}85`, borderColor: `${colors.border}90` };
        textStyle = { color: colors.textSecondary };
        icon = <CalendarDays size={16} color={colors.textSecondary} />;
        break;
    }

    return (
      <TouchableOpacity
        key={rule.id}
        style={[styles.dayContainer, dayStyle, { width: DAY_WIDTH }]}
        onPress={() => {
          if (isClickable) { handleDayPress(rule); return; }
          handleRewardPress(rule);
        }}
        disabled={!isClickable && !rule.extra_reward}
      >
        <Text style={[styles.dayOfMonth, textStyle]}>{dayOfMonth}</Text>

        <View style={styles.rewardInfo}>
          <RewardIcon
            type={RewardType.POINTS}
            value={rule.base_reward}
            size={20}
            iconSize={12}
            fontSize={10}
            showValue={false}
            mode="compact"
          />
          {rule.extra_reward_type && rule.extra_reward && (
            <RewardIcon
              type={rule.extra_reward_type}
              value={rule.extra_reward}
              size={20}
              iconSize={12}
              fontSize={10}
              currencySymbol={currencySymbol}
              showValue={false}
              mode="compact"
            />
          )}
        </View>

        <View style={styles.dayStatusIcon}>{icon}</View>
      </TouchableOpacity>
    );
  };

  const renderWeekHeader = () => {
    if (isLoading) {
      return (
        <View style={[styles.weekHeaderRow, { paddingHorizontal: Spacing.xs }]}>
          {WEEK_DAYS.map((wd) => (
            <Text key={wd} style={[styles.weekHeaderText, { color: colors.textSecondary, width: DAY_WIDTH }]}>
              {wd}
            </Text>
          ))}
        </View>
      );
    }

    return (
      <ScrollView
        ref={headerScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={[styles.weekHeaderRow, { paddingHorizontal: Spacing.xs }]}
      >
        {rules &&
          rules.map((r) => {
            const d = parseYMD(r.date);
            const wd = WEEK_DAYS[(d.getDay() + 6) % 7];
            return (
              <Text key={`wd-${r.id}`} style={[styles.weekHeaderText, { color: colors.textSecondary, width: DAY_WIDTH }]}>
                {wd}
              </Text>
            );
          })}
      </ScrollView>
    );
  };

  // 奖励说明区域
  const rewardLegend = [
    { type: RewardType.POINTS, label: 'Points', color: colors.primary },
    { type: RewardType.CASH, label: 'Cash', color: colors.primary },
    { type: RewardType.COUPON, label: 'Coupon', color: colors.primary },
    { type: RewardType.PHYSICAL_PRODUCT, label: 'Gift', color: colors.primary },
    // { type: RewardType.OTHER, label: 'Other', color: colors.success },
  ];

  const rewardTableData = rules?.map((r) => ({
    date: r.date,
    baseReward: r.base_reward,
    extraReward: r.extra_reward,
    extraType: r.extra_reward_type,
  })) || [];

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* 日历导航 */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity
          onPress={onPressPrev}
          style={[styles.navButton, { backgroundColor: canPrev ? `${colors.primary}35` : colors.border }]}
          disabled={!canPrev || isNavigating}
        >
          <ChevronLeft size={20} color={canPrev ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>

        <Text style={[styles.monthYear, { color: colors.text }]}>{currentDisplayMonthYear}</Text>

        <TouchableOpacity
          onPress={onPressNext}
          style={[styles.navButton, { backgroundColor: !canNext || isNavigating ? colors.border : `${colors.primary}35` }]}
          disabled={!canNext || isNavigating}
        >
          <ChevronRight size={20} color={canNext ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 周头 */}
      {renderWeekHeader()}

      {/* 日历格 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading check-in data...</Text>
        </View>
      ) : (
        <View style={styles.daysGrid}>
          <ScrollView
            ref={bodyScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysGridScroll}
            onScroll={syncHeaderScroll}
            scrollEventThrottle={16}
          >
            {rules && rules.map(renderDay)}
          </ScrollView>
        </View>
      )}

      {(!rules || (rules.length === 0 && !isLoading)) && (
        <Text style={[styles.noActivityText, { color: colors.textSecondary }]}>No check-in data for this period.</Text>
      )}

      {/* 奖励说明区域 */}
      <View style={styles.rewardLegendContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reward Legend</Text>
        <TouchableOpacity style={styles.infoButton} onPress={() => setRewardTableVisible(true)}>
          <Info size={16} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.legendList}>
          {rewardLegend.map((r) => (
            <View key={r.type} style={styles.legendItem}>
              <RewardIcon type={r.type} value={0} size={10} iconSize={12} fontSize={10} color={r.color} showValue={false} />
              <Text style={[styles.legendLabel, { color: colors.text }]}>{r.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 奖励详情弹窗 */}
      <Modal
        transparent
        visible={rewardModalVisible}
        animationType="slide"
        onRequestClose={() => setRewardModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRewardModalVisible(false)}>
          <View style={[styles.bottomModalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRewardModalVisible(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            {selectedReward && (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Reward Details</Text>
                <View style={{ marginBottom: Spacing.sm }}>
                  <Text style={{ color: colors.textSecondary }}>Base Reward:</Text>
                  <Text style={[styles.modalValue, { color: colors.primary }]}>{selectedReward.value}</Text>
                </View>
                {selectedReward.type && selectedReward.value && (
                  <View>
                    <Text style={{ color: colors.textSecondary }}>Extra Reward:</Text>
                    <Text style={[styles.modalValue, { color: colors.success }]}>
                      {RewardType[selectedReward.type]}: {selectedReward.value}
                    </Text>
                  </View>
                )}
                {selectedReward.description && (
                  <Text style={[styles.modalDesc, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                    {selectedReward.description}
                  </Text>
                )}
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* 奖励表格弹窗 */}
      <Modal
        transparent
        visible={rewardTableVisible}
        animationType="slide"
        onRequestClose={() => setRewardTableVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRewardTableVisible(false)}>
          <View style={[styles.bottomModalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRewardTableVisible(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Daily Rewards</Text>

            <ScrollView horizontal style={{ marginTop: Spacing.sm }}>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { minWidth: 80, fontWeight: 'bold' }]}>Date</Text>
                  <Text style={[styles.tableCell, { minWidth: 80, fontWeight: 'bold' }]}>Base</Text>
                  <Text style={[styles.tableCell, { minWidth: 80, fontWeight: 'bold' }]}>Extra</Text>
                  <Text style={[styles.tableCell, { minWidth: 80, fontWeight: 'bold' }]}>Status</Text>
                </View>
                {rewardTableData.map((r, idx) => {
                  const isSigned = rules?.find(rule => rule.date === r.date)?.is_checkin;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.tableRow,
                        { backgroundColor: isSigned ? `${colors.success}20` : `${colors.border}10` },
                      ]}
                    >
                      <Text style={[styles.tableCell, { minWidth: 80, color: colors.text }]}>{r.date}</Text>
                      <Text style={[styles.tableCell, { minWidth: 80, color: colors.primary }]}>{r.baseReward}</Text>
                      <Text style={[styles.tableCell, { minWidth: 80, color: colors.warning }]}>
                        {r.extraReward ? `${RewardType[r.extraType]}: ${r.extraReward}` : '-'}
                      </Text>
                      <View style={[styles.tableRow, { minWidth: 80, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
                        {isSigned ? <CheckCircle size={16} color={colors.success} /> : <Clock size={16} color={colors.textSecondary} />}
                        <Text style={{ marginLeft: 4, color: isSigned ? colors.success : colors.textSecondary }}>
                          {isSigned ? 'Signed' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  daysGrid: {},
  daysGridScroll: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },
  dayContainer: {
    aspectRatio: 1.0,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    minHeight: 90,
  },
  dayOfMonth: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  rewardInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayStatusIcon: {
    marginTop: 4,
  },
  loadingContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  noActivityText: {
    textAlign: 'center',
    marginTop: Spacing.md,
    fontSize: 14,
  },
  rewardLegendContainer: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: 12,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  infoButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  legendList: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  legendLabel: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: Spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  modalValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  bottomModalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.md,
    maxHeight: '80%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
});
