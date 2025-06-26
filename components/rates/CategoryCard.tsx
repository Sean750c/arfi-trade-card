import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
  ScrollView,
} from 'react-native';
import { 
  Star, 
  ChevronDown, 
  TrendingUp,
  Clock,
  Crown,
  Gift,
  Percent,
  DollarSign,
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { CategoryData, CardRate, RateDetail } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

interface CategoryCardProps {
  category: CategoryData;
  onCardPress: (cardId: number, categoryId: number) => void;
}

export default function CategoryCard({ 
  category, 
  onCardPress 
}: CategoryCardProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  
  // State for managing expanded cards
  const [expandedCards, setExpandedCards] = useState(false);
  // State for selected currency (single selection for all cards)
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Get all unique currencies for this category, prioritizing USD
  const allCurrencies = Array.from(
    new Set(category.list.map(group => group.currency))
  ).sort((a, b) => {
    if (a === 'USD') return -1;
    if (b === 'USD') return 1;
    return a.localeCompare(b);
  });

  // Get all unique card IDs from all currency groups
  const allUniqueCardIds = Array.from(
    new Set(
      category.list
        .map(group => group.list.map(card => card.card_id))
        .reduce((acc, cardIds) => acc.concat(cardIds), [])
    )
  );

  // Get card data for the selected currency
  const getCardData = (cardId: number): CardRate | null => {
    const currencyGroup = category.list.find(group => group.currency === selectedCurrency);
    return currencyGroup?.list.find(card => card.card_id === cardId) || null;
  };

  // Calculate VIP and coupon bonuses for display
  const calculateBonuses = (rateDetails: RateDetail[]) => {
    const vipBonus = rateDetails.find(detail => detail.type === 'vip');
    const couponBonus = rateDetails.find(detail => detail.type === 'coupon');
    
    return {
      vipBonus: vipBonus ? parseFloat(vipBonus.per || '0') : 0,
      couponBonus: couponBonus ? parseFloat(couponBonus.per || '0') : 0,
      vipAmount: vipBonus ? parseFloat(vipBonus.rate?.toString() || '0') : 0,
      couponAmount: couponBonus ? parseFloat(couponBonus.rate?.toString() || '0') : 0,
    };
  };

  const renderCardItem = (cardId: number, isLast: boolean) => {
    const cardData = getCardData(cardId);
    if (!cardData) return null;

    const bonuses = calculateBonuses(cardData.rate_detail);
    
    return (
      <View
        key={cardId}
        style={[
          styles.cardItem,
          { borderBottomColor: colors.border },
          isLast && styles.lastCardItem,
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.cardMainInfo}
            onPress={() => onCardPress(cardId, category.category_id)}
          >
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
              {cardData.name}
            </Text>
            
            {/* Rate Breakdown */}
            <View style={styles.rateBreakdown}>
              <View style={styles.baseRateContainer}>
                <DollarSign size={12} color={colors.textSecondary} />
                <Text style={[styles.baseRateLabel, { color: colors.textSecondary }]}>
                  Base:
                </Text>
                <Text style={[styles.baseRate, { color: colors.text }]}>
                  {cardData.currency_symbol}{cardData.rate.toFixed(2)}
                </Text>
                <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
                  per {cardData.currency}
                </Text>
              </View>
              
              {/* VIP Bonus */}
              {bonuses.vipBonus > 0 && (
                <View style={styles.bonusContainer}>
                  <Crown size={12} color={colors.textSecondary} />
                  <Text style={[styles.bonusText, { color: colors.textSecondary }]}>
                    VIP +{bonuses.vipBonus}%
                  </Text>
                  <Text style={[styles.bonusAmount, { color: colors.textSecondary }]}>
                    (+{cardData.currency_symbol}{bonuses.vipAmount.toFixed(2)})
                  </Text>
                </View>
              )}
              
              {/* Coupon Bonus */}
              {bonuses.couponBonus > 0 && (
                <View style={styles.bonusContainer}>
                  <Gift size={12} color={colors.success} />
                  <Text style={[styles.bonusText, { color: colors.success }]}>
                    Coupon +{bonuses.couponBonus}%
                  </Text>
                  <Text style={[styles.bonusAmount, { color: colors.success }]}>
                    (+{cardData.currency_symbol}{bonuses.couponAmount.toFixed(2)})
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <View style={styles.optimalRateContainer}>
            <Text style={[styles.optimalRate, { color: colors.primary }]}>
              {cardData.currency_symbol}{cardData.optimal_rate}
            </Text>
            <View style={styles.rateIndicator}>
              <TrendingUp size={12} color={colors.success} />
              <Text style={[styles.rateLabel, { color: colors.success }]}>
                Final Rate
              </Text>
            </View>
            
            {/* Total Bonus Percentage */}
            {parseFloat(cardData.all_per) > 0 && (
              <View style={[styles.totalBonusBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Percent size={10} color={colors.primary} />
                <Text style={[styles.totalBonusText, { color: colors.primary }]}>
                  +{cardData.all_per}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Card style={styles.categoryCard}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <Image 
            source={{ uri: category.category_logo_img }} 
            style={styles.categoryImage}
            resizeMode="contain"
          />
          <View style={styles.categoryDetails}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {category.category_name}
            </Text>
            <Text style={[styles.categoryIntro, { color: colors.textSecondary }]}>
              {category.category_introduction}
            </Text>
            {category.timeout_seconds !== '0min' && (
              <View style={styles.timeoutBadge}>
                <Clock size={12} color={colors.warning} />
                <Text style={[styles.timeoutText, { color: colors.warning }]}>
                  Processing: {category.timeout_seconds}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Top Rate Display */}
        <View style={styles.topRateContainer}>
          <View style={[styles.topRateBadge, { backgroundColor: colors.primary }]}>
            <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.topRateLabel}>Best Rate</Text>
          </View>
          <Text style={[styles.topRate, { color: colors.primary }]}>
            {category.top_currency_symbol}{category.top_optimal_rate}
          </Text>
          <Text style={[styles.topCurrency, { color: colors.textSecondary }]}>
            per {category.top_currency}
          </Text>
        </View>
      </View>

      {/* Currency Selection */}
      <View style={styles.currencySelectionContainer}>
        <Text style={[styles.currencySelectionLabel, { color: colors.textSecondary }]}>
          Display in:
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.currencyTagsContainer}
        >
          {allCurrencies.map(currency => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyTag,
                {
                  backgroundColor: selectedCurrency === currency 
                    ? colors.primary 
                    : `${colors.primary}15`,
                  borderColor: selectedCurrency === currency 
                    ? colors.primary 
                    : 'transparent',
                }
              ]}
              onPress={() => setSelectedCurrency(currency)}
            >
              <Text style={[
                styles.currencyTagText,
                { color: selectedCurrency === currency ? '#FFFFFF' : colors.primary }
              ]}>
                {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cards Display */}
      <View style={styles.cardsContainer}>
        <View style={styles.cardsHeader}>
          <Text style={[styles.cardsTitle, { color: colors.text }]}>
            Available Cards
          </Text>
          <Text style={[styles.cardCount, { color: colors.textSecondary }]}>
            {allUniqueCardIds.length} cards
          </Text>
        </View>
        
        {allUniqueCardIds
          .map((cardId, index, array) => 
            renderCardItem(cardId, index === array.length - 1)
          )
        }

      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Spacing.md,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.xs,
  },
  categoryIntro: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },
  timeoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeoutText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  topRateContainer: {
    alignItems: 'flex-end',
  },
  topRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: Spacing.xs,
    gap: 2,
  },
  topRateLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  topRate: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  topCurrency: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  
  // Currency Selection
  currencySelectionContainer: {
    marginBottom: Spacing.md,
  },
  currencySelectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  currencyTagsContainer: {
    gap: Spacing.xs,
  },
  currencyTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyTagText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Cards Container
  cardsContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cardCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  
  // Card Items
  cardItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  lastCardItem: {
    borderBottomWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardMainInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  
  // Rate Breakdown
  rateBreakdown: {
    gap: Spacing.xs,
  },
  baseRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  baseRateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  baseRate: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  currencyLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bonusText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  bonusAmount: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Optimal Rate
  optimalRateContainer: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  optimalRate: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  rateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rateLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  totalBonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  totalBonusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  showMoreText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
});