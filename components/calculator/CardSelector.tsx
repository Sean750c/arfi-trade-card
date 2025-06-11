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
import { ChevronDown, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { CardCategory, CardItem } from '@/types/api';

interface CardSelectorProps {
  categories: CardCategory[];
  selectedCard: CardItem | null;
  onSelectCard: (card: CardItem) => void;
}

export default function CardSelector({ categories, selectedCard, onSelectCard }: CardSelectorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [modalVisible, setModalVisible] = useState(false);

  const renderCategoryItem = ({ item: category }: { item: CardCategory }) => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        {category.category_image && (
          <Image 
            source={{ uri: category.category_image }} 
            style={styles.categoryImage}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.categoryTitle, { color: colors.text }]}>
          {category.category_name}
        </Text>
      </View>
      
      {category.list.map((card) => (
        <TouchableOpacity
          key={card.card_id}
          style={[
            styles.cardOption,
            { 
              backgroundColor: selectedCard?.card_id === card.card_id 
                ? `${colors.primary}15` 
                : 'transparent',
              borderBottomColor: colors.border,
            }
          ]}
          onPress={() => {
            onSelectCard(card);
            setModalVisible(false);
          }}
        >
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: colors.text }]}>
              {card.name}
            </Text>
            <View style={styles.rateInfo}>
              <Text style={[styles.cardRate, { color: colors.primary }]}>
                ₦{card.rate.toFixed(2)}/$1
              </Text>
              <Text style={[styles.cardUsdtRate, { color: colors.textSecondary }]}>
                USDT {card.usdt_rate.toFixed(4)}/$1
              </Text>
            </View>
          </View>
          {selectedCard?.card_id === card.card_id && (
            <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Select Card Type</Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          { 
            backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
            borderColor: colors.border,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedCard ? (
            <View style={styles.selectedCardInfo}>
              <Text style={[styles.selectedCardName, { color: colors.text }]}>
                {selectedCard.name}
              </Text>
              <Text style={[styles.selectedCardRate, { color: colors.textSecondary }]}>
                ₦{selectedCard.rate.toFixed(2)}/$1
              </Text>
            </View>
          ) : (
            <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
              Choose a gift card
            </Text>
          )}
        </View>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Gift Card
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.category_name}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
            />
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
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  selectorContent: {
    flex: 1,
  },
  selectedCardInfo: {
    gap: 2,
  },
  selectedCardName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  selectedCardRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  placeholder: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryImage: {
    width: 24,
    height: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  rateInfo: {
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
    width: 4,
    height: 20,
    borderRadius: 2,
  },
});