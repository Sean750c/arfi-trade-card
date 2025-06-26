import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  useColorScheme,
} from 'react-native';
import { ChevronDown, X, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { CardCategory, CardItem } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

interface TwoLevelCardSelectorProps {
  categories: CardCategory[];
  selectedCard: CardItem | null;
  onSelectCard: (card: CardItem) => void;
}

export default function TwoLevelCardSelector({ categories, selectedCard, onSelectCard }: TwoLevelCardSelectorProps) {
  // const colorScheme = useColorScheme() ?? 'light';
  // const colors = Colors[colorScheme];
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | null>(null);

  const handleCategorySelect = (category: CardCategory) => {
    setSelectedCategory(category);
  };

  const handleCardSelect = (card: CardItem) => {
    onSelectCard(card);
    setModalVisible(false);
    setSelectedCategory(null);
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      setModalVisible(false);
    }
  };

  const renderCategoryItem = ({ item: category }: { item: CardCategory }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { borderBottomColor: colors.border }]}
      onPress={() => handleCategorySelect(category)}
    >
      <View style={styles.categoryContent}>
        {category.category_image && (
          <Image 
            source={{ uri: category.category_image }} 
            style={styles.categoryImage}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.categoryName, { color: colors.text }]}>
          {category.category_name}
        </Text>
      </View>
      <View style={styles.categoryMeta}>
        <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
          {category.list.length} cards
        </Text>
        <ChevronDown size={16} color={colors.textSecondary} style={{ transform: [{ rotate: '-90deg' }] }} />
      </View>
    </TouchableOpacity>
  );

  const renderCardItem = ({ item: card }: { item: CardItem }) => (
    <TouchableOpacity
      style={[
        styles.cardItem,
        { 
          backgroundColor: selectedCard?.card_id === card.card_id 
            ? `${colors.primary}15` 
            : 'transparent',
          borderBottomColor: colors.border,
        }
      ]}
      onPress={() => handleCardSelect(card)}
    >
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
          {card.name}
        </Text>
        <View style={styles.rateContainer}>
          <Text style={[styles.cardRate, { color: colors.primary }]}>
            ₦{card.rate.toFixed(2)}
          </Text>
          <Text style={[styles.cardUsdtRate, { color: colors.textSecondary }]}>
            USDT {card.usdt_rate.toFixed(4)}
          </Text>
        </View>
      </View>
      {selectedCard?.card_id === card.card_id && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Gift Card Type</Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedCard ? (
            <View style={styles.selectedCardInfo}>
              <Text style={[styles.selectedCardName, { color: colors.text }]} numberOfLines={1}>
                {selectedCard.name}
              </Text>
              <Text style={[styles.selectedCardRate, { color: colors.textSecondary }]}>
                ₦{selectedCard.rate.toFixed(2)}/$1
              </Text>
            </View>
          ) : (
            <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
              Select gift card type
            </Text>
          )}
        </View>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleBack}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={handleBack}
                style={styles.backButton}
              >
                {selectedCategory ? (
                  <ArrowLeft size={24} color={colors.text} />
                ) : (
                  <X size={24} color={colors.text} />
                )}
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedCategory ? selectedCategory.category_name : 'Select Category'}
              </Text>
              <View style={styles.placeholder} />
            </View>
            
            {!selectedCategory ? (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.category_name}
                renderItem={renderCategoryItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <FlatList
                data={selectedCategory.list}
                keyExtractor={(item) => item.card_id.toString()}
                renderItem={renderCardItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
  },
  selectorContent: {
    flex: 1,
  },
  selectedCardInfo: {
    gap: 2,
  },
  selectedCardName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  selectedCardRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  placeholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    width: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  categoryImage: {
    width: 32,
    height: 32,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderRadius: 6,
    marginBottom: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
    lineHeight: 18,
  },
  rateContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cardRate: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  cardUsdtRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  selectedIndicator: {
    width: 3,
    height: 24,
    borderRadius: 2,
  },
});