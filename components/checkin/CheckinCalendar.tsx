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
import { formatLocalDate } from '@/utils/date';

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
  const [selectedRule, setSelectedRule] = useState<CheckinRule | null>(null);

  const [rewardTableVisible, setRewardTableVisible] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return `${formatLocalDate(now)}`;
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
    if (rule) {
      setSelectedRule(rule);
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
        dayStyle = { backgroundColor: `${colors.primary}85`, borderColor: colors.primary };
        textStyle = { color: colors.primary };
        icon = isCheckingIn ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Star size={16} color={colors.primary} fill={colors.primary} />
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
              data={rule.extra_reward_data}
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
    extraData: r.extra_reward_data
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
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setRewardModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Reward Details</Text>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: `${colors.primary}15` }]} 
                onPress={() => setRewardModalVisible(false)}
              >
                <X size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {selectedRule && (
                <>
                  <View style={[styles.rewardDetailCard, { backgroundColor: `${colors.success}10` }]}>
                    <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>Base Reward:</Text>
                    <View style={styles.rewardValueContainer}>
                      <RewardIcon
                        type={RewardType.POINTS}
                        value={selectedRule.base_reward}
                        size={32}
                        iconSize={18}
                        fontSize={16}
                        showValue={true}
                      />
                    </View>
                  </View>
                  
                  {selectedRule.extra_reward && (
                    <View style={[styles.rewardDetailCard, { backgroundColor: `${colors.success}10` }]}>
                      <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>Extra Reward:</Text>
                      <View style={styles.rewardValueContainer}>
                        <RewardIcon
                          type={selectedRule.extra_reward_type}
                          value={selectedRule.extra_reward}
                          data={selectedRule.extra_reward_data}
                          size={32}
                          iconSize={18}
                          fontSize={16}
                          showValue={true}
                        />
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 奖励表格弹窗 */}
      <Modal
        transparent
        visible={rewardTableVisible}
        animationType="slide"
        onRequestClose={() => setRewardTableVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setRewardTableVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Daily Rewards Schedule</Text>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: `${colors.primary}15` }]} 
                onPress={() => setRewardTableVisible(false)}
              >
                <X size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={[styles.tableContainer, { borderColor: colors.border }]}>
                <View style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.tableHeaderCell, styles.dateColumn]}>Date</Text>
                  <Text style={[styles.tableHeaderCell, styles.baseColumn]}>Base</Text>
                  <Text style={[styles.tableHeaderCell, styles.extraColumn]}>Extra</Text>
                  <Text style={[styles.tableHeaderCell, styles.statusColumn]}>Status</Text>
                </View>
                
                <ScrollView 
                  style={styles.tableScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {rewardTableData.map((r, idx) => {
                    const rule = rules?.find(rule => rule.date === r.date);
                    const isSigned = rule?.is_checkin;
                    const status = getDayStatus(rule!);
                    
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.tableRow,
                          { 
                            backgroundColor: isSigned 
                              ? `${colors.success}15` 
                              : status === 'today'
                                ? `${colors.primary}10`
                                : idx % 2 === 0 
                                  ? colors.background 
                                  : colors.card,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
                        <View style={[styles.tableCell, styles.dateColumn]}>
                          <Text style={[styles.tableCellText, { color: colors.text }]}>
                            {parseYMD(r.date).getDate()}
                          </Text>
                          <Text style={[styles.tableCellSubtext, { color: colors.textSecondary }]}>
                            {parseYMD(r.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </Text>
                        </View>
                        
                        <View style={[styles.tableCell, styles.baseColumn]}>
                          <RewardIcon
                            type={RewardType.POINTS}
                            value={r.baseReward}
                            size={24}
                            iconSize={14}
                            fontSize={12}
                            color={colors.primary}
                            showValue={true}
                          />
                        </View>
                        
                        <View style={[styles.tableCell, styles.extraColumn]}>
                          {r.extraReward && r.extraType ? (
                            <RewardIcon
                              type={r.extraType}
                              value={r.extraReward}
                              data={r.extraData}
                              size={24}
                              iconSize={14}
                              fontSize={12}
                              color={colors.warning}
                              showValue={true}
                            />
                          ) : (
                            <Text style={[styles.noExtraText, { color: colors.textSecondary }]}>-</Text>
                          )}
                        </View>
                        
                        <View style={[styles.tableCell, styles.statusColumn]}>
                          <View style={styles.statusContainer}>
                            {isSigned ? (
                              <>
                                <CheckCircle size={14} color={colors.success} />
                                <Text style={[styles.statusText, { color: colors.success }]}>
                                  Signed
                                </Text>
                              </>
                            ) : status === 'today' ? (
                              <>
                                <Star size={14} color={colors.primary} fill={colors.primary} />
                                <Text style={[styles.statusText, { color: colors.primary }]}>
                                  Today
                                </Text>
                              </>
                            ) : status === 'past' ? (
                              <>
                                <Clock size={14} color={colors.warning} />
                                <Text style={[styles.statusText, { color: colors.warning }]}>
                                  Missed
                                </Text>
                              </>
                            ) : (
                              <>
                                <CalendarDays size={14} color={colors.textSecondary} />
                                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                                  Future
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
              
              <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
                <Text style={[styles.infoTitle, { color: colors.primary }]}>
                  💡 Reward Information
                </Text>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  • Base rewards are given daily for check-ins{'\n'}
                  • Extra rewards are special bonuses for certain days{'\n'}
                  • Missed days can be made up using points
                </Text>
              </View>
            </View>
          </View>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    marginBottom: Spacing.lg,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    gap: Spacing.lg,
  },
  rewardDetailCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.sm,
  },
  rewardValueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  tableContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tableHeaderCell: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dateColumn: {
    flex: 0.6,
  },
  baseColumn: {
    flex: 1,
  },
  extraColumn: {
    flex: 1.2,
  },
  statusColumn: {
    flex: 0.8,
  },
  tableScrollView: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  tableCellText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  tableCellSubtext: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  noExtraText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  infoBox: {
    padding: Spacing.lg,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
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
