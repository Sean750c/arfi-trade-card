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
  Percent
} from 'lucide-react-native';
import Card from '@/components/UI/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { CategoryData, CardRate, CurrencyGroup, RateDetail } from '@/types/api';

interface CategoryCardProps {
  category: CategoryData;
  selectedCurrency: string | null;
  onCurrencyFilter: (currency: string | null) => void;
  onCardPress: (cardId: number, categoryId: number) => void;
}

export default function CategoryCard({ 
  category, 
  selectedCurrency, 
  onCurrencyFilter, 
  onCardPress 
}: CategoryCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expandedCurrencies, setExpandedCurrencies] = useState<Set<string>>(new Set());

  const toggleCurrencyExpansion = (currency: string) => {
    const newExpanded = new Set(expandedCurrencies);
    if (newExpanded.has(currency)) {
      newExpanded.delete(currency);
    } else {
      newExpanded.add(currency);
    }
    setExpandedCurrencies(newExpanded);
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

  const renderCurrencyChips = (currencyGroups: CurrencyGroup[]) => {
    const uniqueCurrencies = Array.from(new Set(currencyGroups.map(group => group.currency)));
    
    if (uniqueCurrencies.length <= 1) return null;
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.currencyChips}
        contentContainerStyle={styles.currencyChipsContent}
      >
        {uniqueCurrencies.map((currency) => (
          <TouchableOpacity
            key={currency}
            style={[
              styles.currencyChip,
              {
                backgroundColor: selectedCurrency === currency ? colors.primary : `${colors.primary}15`,
                borderColor: selectedCurrency === currency ? colors.primary : 'transparent',
              }
            ]}
            onPress={() => onCurrencyFilter(selectedCurrency === currency ? null : currency)}
          >
            <Text style={[
              styles.currencyChipText,
              { color: selectedCurrency === currency ? '#FFFFFF' : colors.primary }
            ]}>
              {currency}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderCardItem = (card: CardRate, isLast: boolean) => {
    const bonuses = calculateBonuses(card.rate_detail);
    
    return (
      <TouchableOpacity
        key={card.card_id}
        style={[
          styles.cardItem,
          { borderBottomColor: colors.border },
          isLast && styles.lastCardItem,
        ]}
        onPress={() => onCardPress(card.card_id, category.category_id)}
      >
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
            {card.name}
          </Text>
          
          {/* Rate Breakdown */}
          <View style={styles.rateBreakdown}>
            <View style={styles.baseRateContainer}>
              <Text style={[styles.baseRateLabel, { color: colors.textSecondary }]}>
                Base:
              </Text>
              <Text style={[styles.baseRate, { color: colors.text }]}>
                {card.currency_symbol}{card.rate.toFixed(2)}
              </Text>
            </View>
            
            {/* VIP Bonus */}
            {bonuses.vipBonus > 0 && (
              <View style={styles.bonusContainer}>
                <Crown size={12} color={colors.secondary} />
                <Text style={[styles.bonusText, { color: colors.secondary }]}>
                  VIP +{bonuses.vipBonus}%
                </Text>
                <Text style={[styles.bonusAmount, { color: colors.secondary }]}>
                  (+{card.currency_symbol}{bonuses.vipAmount.toFixed(2)})
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
                  (+{card.currency_symbol}{bonuses.couponAmount.toFixed(2)})
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.optimalRateContainer}>
          <Text style={[styles.optimalRate, { color: colors.primary }]}>
            {card.currency_symbol}{card.optimal_rate}
          </Text>
          <View style={styles.rateIndicator}>
            <TrendingUp size={12} color={colors.success} />
            <Text style={[styles.rateLabel, { color: colors.success }]}>
              Final Rate
            </Text>
          </View>
          
          {/* Total Bonus Percentage */}
          {parseFloat(card.all_per) > 0 && (
            <View style={[styles.totalBonusBadge, { backgroundColor: `${colors.primary}15` }]}>
              <Percent size={10} color={colors.primary} />
              <Text style={[styles.totalBonusText, { color: colors.primary }]}>
                +{card.all_per}%
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
                  {category.timeout_seconds}
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

      {/* Currency Type Quick Filter */}
      {renderCurrencyChips(category.list)}

      {/* Currency Groups */}
      <View style={styles.currencyGroups}>
        {category.list.map((currencyGroup, index) => {
          const shouldShow = !selectedCurrency || currencyGroup.currency === selectedCurrency;
          if (!shouldShow) return null;

          const isExpanded = expandedCurrencies.has(currencyGroup.currency);
          const displayLimit = isExpanded ? currencyGroup.list.length : 3;
          const hasMore = currencyGroup.list.length > 3;

          return (
            <View key={`${currencyGroup.currency}-${index}`} style={styles.currencyGroup}>
              <View style={styles.currencyHeader}>
                <Text style={[styles.currencyTitle, { color: colors.text }]}>
                  {currencyGroup.currency} Cards
                </Text>
                <Text style={[styles.cardCount, { color: colors.textSecondary }]}>
                  {currencyGroup.list.length} options
                </Text>
              </View>
              
              {currencyGroup.list.slice(0, displayLimit).map((card, cardIndex) => 
                renderCardItem(card, cardIndex === displayLimit - 1 && !hasMore)
              )}
              
              {hasMore && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => toggleCurrencyExpansion(currencyGroup.currency)}
                >
                  <Text style={[styles.showMoreText, { color: colors.primary }]}>
                    {isExpanded 
                      ? 'Show Less' 
                      : `+${currencyGroup.list.length - 3} more ${currencyGroup.currency} cards`
                    }
                  </Text>
                  <ChevronDown 
                    size={16} 
                    color={colors.primary} 
                    style={[
                      styles.chevronIcon,
                      isExpanded && styles.chevronIconRotated
                    ]}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  
  // Currency Chips
  currencyChips: {
    marginBottom: Spacing.md,
  },
  currencyChipsContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  currencyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
  },
  currencyChipText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  
  // Currency Groups
  currencyGroups: {
    gap: Spacing.md,
  },
  currencyGroup: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  currencyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cardCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  
  // Card Items
  cardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  lastCardItem: {
    borderBottomWidth: 0,
  },
  cardInfo: {
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
    gap: Spacing.xs,
  },
  baseRateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  baseRate: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
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