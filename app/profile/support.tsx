import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Search, CircleHelp as HelpCircle, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { FAQService } from '@/services/faq';
import type { FAQItem } from '@/types';

export default function SupportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    filterFAQs();
  }, [faqs, searchQuery, selectedCategory]);

  const fetchFAQs = async () => {
    setIsLoading(true);
    try {
      const faqData = await FAQService.getFAQList();
      setFaqs(faqData);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFAQs = () => {
    let filtered = faqs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.title.toLowerCase().includes(query) ||
        faq.content.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(faqs.map(faq => faq.category))];
    return categories;
  };

  const renderFAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <View style={[
        styles.faqItem,
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          borderColor: colors.border,
        }
      ]}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.faqTitleContainer}>
            <HelpCircle size={16} color={colors.primary} />
            <Text style={[styles.faqTitle, { color: colors.text }]}>
              {item.title}
            </Text>
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
              {item.content}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategoryFilter = () => {
    const categories = getCategories();
    
    return (
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === item ? colors.primary : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === item ? '#FFFFFF' : colors.text }
              ]}>
                {item === 'all' ? 'All' : item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <HelpCircle size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery ? 'No results found' : 'No FAQs available'}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {searchQuery 
          ? 'Try adjusting your search terms or browse different categories'
          : 'FAQ content is being updated. Please check back later.'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colorScheme === 'dark' ? colors.card : '#FFFFFF',
          borderBottomColor: colors.border,
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Frequently asked questions
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer,
          { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' }
        ]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search FAQs..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading FAQs...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFaqs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFAQItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            filteredFaqs.length === 0 && styles.emptyListContainer,
          ]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    height: '100%',
  },
  categoryContainer: {
    paddingVertical: Spacing.sm,
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  faqTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  faqTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    lineHeight: 20,
  },
  faqContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});