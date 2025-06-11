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
import type { CategoryData, CardRate, CurrencyGroup, RateDetail } from '@/types/api';

interface CategoryCardProps {
  category: CategoryData;
  onCardPress: (cardId: number, categoryId: number) => void;
}

export default function CategoryCard({ 
  category, 
  onCardPress 
}: CategoryCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // State for managing expanded currencies and selected tags
  const [expandedCurrencies, setExpandedCurrencies] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Record<number, Set<string>>>(() => {
    // Initialize with USD as default for all cards
    const initialTags: Record<number, Set<string>> = {};
    category.list.forEach(currencyGroup => {
      currencyGroup.list.forEach(card => {
        initialTags[card.card_id] = new Set(['USD']);
      });
    });
    return initialTags;
  });

  const toggleCurrencyExpansion = (currency: string) => {
    const newExpanded = new Set(expandedCurrencies);
    if (newExpanded.has(currency)) {
      newExpanded.delete(currency);
    } else {
      newExpanded.add(currency);
    }
    setExpandedCurrencies(newExpanded);
  };

  const toggleCardTag = (cardId: number, currency: string) => {
    setSelectedTags(prev => {
      const cardTags = new Set(prev[cardId] || new Set());
      
      // If trying to deselect the last tag, prevent it
      if (cardTags.has(currency) && cardTags.size === 1) {
        return prev;
      }
      
      if (cardTags.has(currency)) {
        cardTags.delete(currency);
      } else {
        cardTags.add(currency);
      }
      
      return {
        ...prev,
        [cardId]: cardTags,
      };
    });
  };

  // Get all unique currencies for this category
  const getAllCurrencies = () => {
    const currencies = new Set<string>();
    category.list.forEach(group => {
      currencies.add(group.currency);
    });
    return Array.from(currencies);
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

  const renderCurrencyTags = (cardId: number, availableCurrencies: string[]) => {
    const cardSelectedTags = selectedTags[cardId] || new Set(['USD']);
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.currencyTags}
        contentContainerStyle={styles.currencyTagsContent}
      >
        {availableCurrencies.map((currency) => {
          const isSelected = cardSelectedTags.has(currency);
          const isLastSelected = cardSelectedTags.size === 1 && isSelected;
          
          return (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyTag,
                {
                  backgroundColor: isSelected ? colors.primary : `${colors.primary}15`,
                  borderColor: isSelected ? colors.primary : 'transparent',
                  opacity: isLastSelected ? 0.7 : 1, // Visual hint that last tag can't be removed
                }
              ]}
              onPress={() => toggleCardTag(cardId, currency)}
              disabled={isLastSelected}
            >
              <Text style={[
                styles.currencyTagText,
                { color: isSelected ? '#FFFFFF' : colors.primary }
              ]}>
                {currency}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderCardItem = (card: CardRate, isLast: boolean, availableCurrencies: string[]) => {
    const bonuses = calculateBonuses(card.rate_detail);
    const cardSelectedTags = selectedTags[card.card_id] || new Set(['USD']);
    
    // Only show card if its currency is selected
    if (!cardSelectedTags.has(card.currency)) {
      return null;
    }
    
    return (
      <View
        key={card.card_id}
        style={[
          styles.cardItem,
          { borderBottomColor: colors.border },
          isLast && styles.lastCardItem,
        ]}
      >
        {/* Card Header with Tags */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.cardMainInfo}
            onPress={() => onCardPress(card.card_id, category.category_id)}
          >
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
              {card.name}
            </Text>
            
            {/* Rate Breakdown */}
            <View style={styles.rateBreakdown}>
              <View style={styles.baseRateContainer}>
                <DollarSign size={12} color={colors.textSecondary} />
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
          </TouchableOpacity>
          
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
        </View>
        
        {/* Currency Tags for this card */}
        {availableCurrencies.length > 1 && (
          <View style={styles.cardTagsContainer}>
            <Text style={[styles.tagsLabel, { color: colors.textSecondary }]}>
              Available in:
            </Text>
            {renderCurrencyTags(card.card_id, availableCurrencies)}
          </View>
        )}
      </View>
    );
  };

  // Get all currencies available for cards in this category
  const allCurrencies = getAllCurrencies();

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

      {/* Currency Groups */}
      <View style={styles.currencyGroups}>
        {category.list.map((currencyGroup, index) => {
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
                renderCardItem(card, cardIndex === displayLimit - 1 && !hasMore, allCurrencies)
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
  
  // Currency Tags
  cardTagsContainer: {
    marginTop: Spacing.sm,
  },
  tagsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  currencyTags: {
    marginBottom: Spacing.xs,
  },
  currencyTagsContent: {
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