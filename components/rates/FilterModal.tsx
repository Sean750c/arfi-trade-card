import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Modal,
} from 'react-native';
import { X, Filter } from 'lucide-react-native';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import type { CategoryData } from '@/types';

interface FilterModalProps {
  visible: boolean;
  categories: CategoryData[];
  selectedCategory: number | null;
  onClose: () => void;
  onCategorySelect: (categoryId: number | null) => void;
  onClearFilters: () => void;
}

export default function FilterModal({
  visible,
  categories,
  selectedCategory,
  onClose,
  onCategorySelect,
  onClearFilters,
}: FilterModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.filterOverlay}>
        <View style={[styles.filterModal, { backgroundColor: colors.card }]}>
          <View style={styles.filterHeader}>
            <View style={styles.titleContainer}>
              <Filter size={20} color={colors.primary} />
              <Text style={[styles.filterTitle, { color: colors.text }]}>
                Filter by Category
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
            {/* Category Filter Section */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Card Categories
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                Filter cards by their category type
              </Text>
              
              {/* All Categories Option */}
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  { 
                    backgroundColor: !selectedCategory ? colors.primary : 'transparent',
                    borderColor: !selectedCategory ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => onCategorySelect(null)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: !selectedCategory ? '#FFFFFF' : colors.text }
                ]}>
                  All Categories
                </Text>
                {!selectedCategory && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Individual Categories */}
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.category_id}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: selectedCategory === category.category_id ? colors.primary : 'transparent',
                      borderColor: selectedCategory === category.category_id ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => onCategorySelect(category.category_id)}
                >
                  <View style={styles.categoryOptionContent}>
                    <Text style={[
                      styles.filterOptionText,
                      { color: selectedCategory === category.category_id ? '#FFFFFF' : colors.text }
                    ]}>
                      {category.category_name}
                    </Text>
                    <Text style={[
                      styles.categoryDescription,
                      { color: selectedCategory === category.category_id ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                    ]}>
                      {category.list.reduce((total, group) => total + group.list.length, 0)} cards available
                    </Text>
                  </View>
                  {selectedCategory === category.category_id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Clear Filter"
              variant="outline"
              onPress={onClearFilters}
              style={styles.clearButton}
            />
            <Button
              title="Apply Filter"
              onPress={onClose}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
    minHeight: '50%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  scrollContainer: {
    flex: 1,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    minHeight: 56,
  },
  categoryOptionContent: {
    flex: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});