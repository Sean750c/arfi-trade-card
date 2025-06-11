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
  
  // State for managing expanded currencies and selected currency per card
  const [expandedCurrencies, setExpandedCurrencies] = useState<Set<string>>(new Set());
  const [selectedCurrencyPerCard, setSelectedCurrencyPerCard] = useState<Record<number, string>>(() => {
    // Initialize with USD as default for all cards
    const initialSelection: Record<number, string> = {};
    category.list.forEach(currencyGroup => {
      currencyGroup.list.forEach(card => {
        // Find if this card has USD data, otherwise use the first available currency
        const hasUSD = category.list.some(group => 
          group.currency === 'USD' && 
          group.list.some(c => c.card_id === card.card_id)
        );
        initialSelection[card.card_id] = hasUSD ? 'USD' : category.list[0]?.currency || 'USD';
      });
    });
    return initialSelection;
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

  const selectCurrencyForCard = (cardId: number, currency: string) => {
    setSelectedCurrencyPerCard(prev => ({
      ...prev,
      [cardId]: currency,
    }));
  };

  // Get all unique currencies for this category
  const getAllCurrencies = () => {
    const currencies = new Set<string>();
    category.list.forEach(group => {
      currencies.add(group.currency);
    });
    return Array.from(currencies).sort((a, b) => {
      // Prioritize USD first
      if (a === 'USD') return -1;
      if (b === 'USD') return 1;
      return a.localeCompare(b);
    });
  };

  // Get available currencies for a specific card
  const getAvailableCurrenciesForCard = (cardId: number) => {
    const availableCurrencies = new Set<string>();
    category.list.forEach(group => {
      if (group.list.some(card => card.card_id === cardId)) {
        availableCurrencies.add(group.currency);
      }
    });
    return Array.from(availableCurrencies).sort((a, b) => {
      // Prioritize USD first
      if (a === 'USD') return -1;
      if (b === 'USD') return 1;
      return a.localeCompare(b);
    });
  };

  // Get card data for specific currency
  const getCardDataForCurrency = (cardId: number, currency: string): CardRate | null => {
    for (const group of category.list) {
      if (group.currency === currency) {
        const card = group.list.find(c => c.card_id === cardId);
        if (card) return card;
      }
    }
    return null;
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
    const selectedCurrency = selectedCurrencyPerCard[cardId] || 'USD';
    
    if (availableCurrencies.length <= 1) {
      return null; // Don't show tags if only one currency available
    }
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.currencyTags}
        contentContainerStyle={styles.currencyTagsContent}
      >
        {availableCurrencies.map((currency) => {
          const isSelected = selectedCurrency === currency;
          
          return (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyTag,
                {
                  backgroundColor: isSelected ? colors.primary : `${colors.primary}15`,
                  borderColor: isSelected ? colors.primary : 'transparent',
                }
              ]}
              onPress={() => selectCurrencyForCard(cardId, currency)}
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

  const renderCardItem = (cardId: number, isLast: boolean) => {
    const selectedCurrency = selectedCurrencyPerCard[cardId] || 'USD';
    const availableCurrencies = getAvailableCurrenciesForCard(cardId);
    const cardData = getCardDataForCurrency(cardId, selectedCurrency);
    
    // If no data for selected currency, try to find any available data
    const fallbackCardData = cardData || category.list.find(group => 
      group.list.some(card => card.card_id === cardId)
    )?.list.find(card => card.card_id === cardId);
    
    if (!fallbackCardData) {
      return null; // Skip if no data available
    }
    
    const displayCard = cardData || fallbackCardData;
    const bonuses = calculateBonuses(displayCard.rate_detail);
    
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
              {displayCard.name}
            </Text>
            
            {/* Rate Breakdown */}
            <View style={styles.rateBreakdown}>
              <View style={styles.baseRateContainer}>
                <DollarSign size={12} color={colors.textSecondary} />
                <Text style={[styles.baseRateLabel, { color: colors.textSecondary }]}>
                  Base:
                </Text>
                <Text style={[styles.baseRate, { color: colors.text }]}>
                  {displayCard.currency_symbol}{displayCard.rate.toFixed(2)}
                </Text>
                <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
                  per {displayCard.currency}
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
                    (+{displayCard.currency_symbol}{bonuses.vipAmount.toFixed(2)})
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
                    (+{displayCard.currency_symbol}{bonuses.couponAmount.toFixed(2)})
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <View style={styles.optimalRateContainer}>
            <Text style={[styles.optimalRate, { color: colors.primary }]}>
              {displayCard.currency_symbol}{displayCard.optimal_rate}
            </Text>
            <View style={styles.rateIndicator}>
              <TrendingUp size={12} color={colors.success} />
              <Text style={[styles.rateLabel, { color: colors.success }]}>
                Final Rate
              </Text>
            </View>
            
            {/* Total Bonus Percentage */}
            {parseFloat(displayCard.all_per) > 0 && (
              <View style={[styles.totalBonusBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Percent size={10} color={colors.primary} />
                <Text style={[styles.totalBonusText, { color: colors.primary }]}>
                  +{displayCard.all_per}%
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
            {renderCurrencyTags(cardId, availableCurrencies)}
          </View>
        )}
      </View>
    );
  };

  // Get all unique card IDs from all currency groups
  const getAllUniqueCardIds = () => {
    const cardIds = new Set<number>();
    category.list.forEach(group => {
      group.list.forEach(card => {
        cardIds.add(card.card_id);
      });
    });
    return Array.from(cardIds);
  };

  // Get all currencies available for cards in this category
  const allCurrencies = getAllCurrencies();
  const allUniqueCardIds = getAllUniqueCardIds();

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

      {/* Cards Display */}
      <View style={styles.cardsContainer}>
        <View style={styles.cardsHeader}>
          <Text style={[styles.cardsTitle, { color: colors.text }]}>
            Available Cards
          </Text>
          <Text style={[styles.cardCount, { color: colors.textSecondary }]}>
            {allUniqueCardIds.length} cards • {allCurrencies.length} currencies
          </Text>
        </View>
        
        {allUniqueCardIds.slice(0, expandedCurrencies.has('cards') ? allUniqueCardIds.length : 3).map((cardId, index) => 
          renderCardItem(cardId, index === (expandedCurrencies.has('cards') ? allUniqueCardIds.length : 3) - 1)
        )}
        
        {allUniqueCardIds.length > 3 && (
          <TouchableOpacity 
            style={styles.showMoreButton}
            onPress={() => toggleCurrencyExpansion('cards')}
          >
            <Text style={[styles.showMoreText, { color: colors.primary }]}>
              {expandedCurrencies.has('cards') 
                ? 'Show Less' 
                : `+${allUniqueCardIds.length - 3} more cards`
              }
            </Text>
            <ChevronDown 
              size={16} 
              color={colors.primary} 
              style={[
                styles.chevronIcon,
                expandedCurrencies.has('cards') && styles.chevronIconRotated
              ]}
            />
          </TouchableOpacity>
        )}
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