import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { TrendingUp, CheckCircle, Clock, Volume2, X, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useBannerStore } from '@/stores/useBannerStore';
import { Announcement, Transaction } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatDate } from '@/utils/date';

type FeedItem =
  | { type: 'transaction'; data: Transaction }
  | { type: 'announcement'; data: Announcement };

const MAX_ANNOUNCEMENT_LENGTH = 80;

export default function LiveFeedCarousel() {
  const { colors } = useTheme();
  const { announcement, transaction, fetchLiveContentList } = useBannerStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { user } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.token) {
        const countryId = user.country_id || 14;
        fetchLiveContentList(countryId);
      }
    }, [user?.token, fetchLiveContentList])
  );

  // 合并公告和交易数据
  const feedItems: FeedItem[] = [
    ...announcement.map(item => ({
      type: 'announcement' as const,
      data: item,
    })),
    ...transaction.map(transaction => ({
      type: 'transaction' as const,
      data: transaction,
    })),
  ];

  const animateTransition = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    if (feedItems.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % feedItems.length);
      animateTransition();
    }, 3500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fadeAnim, slideAnim, feedItems.length]);

  const handlePrevious = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prevIndex) => (prevIndex - 1 + feedItems.length) % feedItems.length);
    animateTransition();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % feedItems.length);
      animateTransition();
    }, 3500);
  };

  const handleNext = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % feedItems.length);
    animateTransition();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % feedItems.length);
      animateTransition();
    }, 3500);
  };

  if (feedItems.length === 0) return null;

  const currentItem = feedItems[currentIndex];

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return { text, isTruncated: false };
    return {
      text: text.substring(0, maxLength) + '...',
      isTruncated: true,
    };
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 10) {
      return `${diffMin} minutes ago`;
    } else {
      return `10 minutes ago`;
    }
  };

  const hideUsername = (name: string) => {
    if (!name) return '';

    const len = name.length;

    // 不足 5 个字符的名字，直接全部用 * 替代
    if (len < 5) {
      return '*'.repeat(len);
    }

    // 前后各保留最多 2 个字符
    const prefix = name.slice(0, 2);
    const suffix = name.slice(-2);

    return `${prefix}****${suffix}`;
  };

  const renderContent = () => {
    if (currentItem.type === 'transaction') {
      const transaction = currentItem.data;
      return (
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.transactionRow}>
            <View style={styles.transactionInfo}>
              <View style={styles.iconContainer}>
                <CheckCircle size={18} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.username, { color: colors.text }]}>
                  {hideUsername(transaction.username)}
                </Text>
                <Text style={[styles.details, { color: colors.textSecondary }]} numberOfLines={1}>
                  successfully sold{' '}
                  <Text style={[styles.amount, { color: colors.primary }]}>
                    {transaction.amount} {transaction.currency}
                  </Text>
                </Text>
              </View>
            </View>
            <View style={styles.timeContainer}>
              <Clock size={11} color={colors.textSecondary} />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {formatDate(transaction.timeAgo)}
              </Text>
            </View>
          </View>
        </Animated.View>
      );
    } else {
      const announcement = currentItem.data;
      const { text, isTruncated } = truncateText(announcement.content, MAX_ANNOUNCEMENT_LENGTH);

      return (
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.announcementRow}
            onPress={() => isTruncated && setSelectedAnnouncement(announcement.content)}
            activeOpacity={isTruncated ? 0.7 : 1}
          >
            <View style={styles.announcementInfo}>
              <View style={[styles.announcementIcon, { backgroundColor: '#F59E0B15' }]}>
                <Volume2 size={18} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.announcementLabel, { color: colors.textSecondary }]}>
                  Announcement
                </Text>
                <Text style={[styles.announcementText, { color: colors.text }]} numberOfLines={2}>
                  {text}
                </Text>
              </View>
            </View>
            {isTruncated && (
              <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    }
  };

  const renderBadge = () => {
    if (currentItem.type === 'transaction') {
      return (
        <View style={[styles.liveBadge, { backgroundColor: '#10B981' }]}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>LIVE</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.liveBadge, { backgroundColor: '#F59E0B' }]}>
          <Volume2 size={10} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.badgeText}>NEWS</Text>
        </View>
      );
    }
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          {renderBadge()}
          <View style={styles.controls}>
            <View style={styles.indicators}>
              {feedItems.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: idx === currentIndex ? colors.primary : colors.border,
                      width: idx === currentIndex ? 16 : 6,
                    },
                  ]}
                />
              ))}
            </View>
            {feedItems.length > 1 && (
              <View style={styles.arrows}>
                <TouchableOpacity
                  onPress={handlePrevious}
                  style={[styles.arrowButton, { backgroundColor: colors.background }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ChevronLeft size={16} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNext}
                  style={[styles.arrowButton, { backgroundColor: colors.background }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ChevronRight size={16} color={colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {renderContent()}
      </View>

      {/* Announcement Detail Modal */}
      <Modal
        visible={!!selectedAnnouncement}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Volume2 size={24} color="#F59E0B" strokeWidth={2.5} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Announcement
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.background }]}
                onPress={() => setSelectedAnnouncement(null)}
              >
                <X size={20} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalText, { color: colors.text }]}>
                {selectedAnnouncement}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setSelectedAnnouncement(null)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  contentContainer: {
    minHeight: 56,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B98115',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
    lineHeight: 16,
  },
  amount: {
    fontWeight: '700',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  announcementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  announcementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  announcementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  announcementText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    maxHeight: 300,
    marginBottom: Spacing.lg,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  modalButton: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
