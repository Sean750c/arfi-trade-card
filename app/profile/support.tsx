import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Search, CircleHelp as HelpCircle, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFAQStore } from '@/stores/useFAQStore';
import type { FAQItem } from '@/types';
import SafeAreaWrapper from '@/components/UI/SafeAreaWrapper';

// 只保留AnswerHTML组件，兼容web端
interface AnswerHTMLProps {
  html: string;
}

const injectedJS = `
  (function() {
    function sendHeight() {
      var height = document.documentElement.scrollHeight || document.body.scrollHeight;
      window.ReactNativeWebView.postMessage(height);
    }
    sendHeight();
    Array.from(document.images).forEach(function(img) {
      img.addEventListener('load', sendHeight);
      img.addEventListener('error', sendHeight);
    });
    var observer = new MutationObserver(function() {
      sendHeight();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setTimeout(sendHeight, 100);
    setTimeout(sendHeight, 300);
    setTimeout(sendHeight, 600);
    setTimeout(sendHeight, 1000);
  })();
  true;
`;

const AnswerHTML: React.FC<AnswerHTMLProps> = ({ html }) => {
  const [webViewHeight, setWebViewHeight] = useState(40);
  const webViewRef = useRef(null);

  if (Platform.OS === 'web') {
    // 兼容web端，直接渲染HTML
    return (
      <div
        style={{ width: '100%', minHeight: 40, background: '#fff', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, overflow: 'hidden', padding: '16px 12px', fontSize: 15, color: '#333', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <View style={{ width: '100%', minHeight: 40, backgroundColor: '#fff', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, overflow: 'hidden' }}>
      <WebView
        ref={webViewRef}
        source={{
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { margin:0; padding:16px 12px; font-size:15px; color:#333; line-height:1.7; background:#fff; }
                  img { max-width:100%; height:auto; display:block; margin:8px 0; }
                  p { margin:0 0 12px 0; padding:0; }
                  ul,ol { margin:8px 0 8px 20px; }
                </style>
              </head>
              <body>
                ${html}
              </body>
            </html>
          `
        }}
        style={{ width: '100%', height: webViewHeight, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        javaScriptEnabled
        injectedJavaScript={injectedJS}
        onMessage={event => {
          const height = Number(event.nativeEvent.data);
          if (!isNaN(height) && height > 0 && Math.abs(height - webViewHeight) > 2) {
            setWebViewHeight(height);
          }
        }}
      />
    </View>
  );
};

function SupportScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const {
    faqCategories,
    faqList,
    isLoadingFAQList,
    isLoadingMore,
    faqsError,
    fetchFAQCategories,
    fetchFAQList,
    loadMoreFAQs,
  } = useFAQStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Android启用LayoutAnimation
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Filter FAQs based on search and category
  const filteredFaqs = faqList.filter(faq => {
    // Filter by category
    if (selectedCategory !== 'all' && faq.category_name !== selectedCategory) {
      return false;
    }

    // Filter by search query - 只有answer需要移除HTML标签进行搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      const questionText = faq.question; // question是普通文本，不需要过滤
      const answerText = stripHtml(faq.answer);
      return questionText.toLowerCase().includes(query) ||
        answerText.toLowerCase().includes(query);
    }

    return true;
  });

  useEffect(() => {
    fetchFAQCategories();
    fetchFAQList(true).then(() => setHasLoadedOnce(true));
  }, [fetchFAQList, fetchFAQCategories]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFAQCategories();
      await fetchFAQList(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFAQList, fetchFAQCategories]);

  const handleLoadMore = useCallback(() => {
    if (!hasLoadedOnce || isLoadingMore || isLoadingFAQList) return;
    loadMoreFAQs();
  }, [hasLoadedOnce, isLoadingMore, isLoadingFAQList, loadMoreFAQs]);

  const toggleExpanded = (id: number) => {
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getCategories = () => {
    const categories = ['all', ...faqCategories];
    return categories;
  };

  const handleCategoryChange = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(category);
    setExpandedItems(new Set());
  };

  const renderFAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <View
        style={[
          styles.faqItem,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.faqTitleContainer}>
            <HelpCircle size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.faqTitle}>
              {item.question}
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
            <AnswerHTML html={item.answer} />
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
              onPress={() => handleCategoryChange(item)}
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

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more FAQs...
        </Text>
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

  if (faqsError) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.errorContainer}>
          <HelpCircle size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.error }]}>
            Failed to load FAQs
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {faqsError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          backgroundColor: colors.card,
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
          { backgroundColor: colors.card }
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

      {/* FAQ List */}
      <FlatList
        data={filteredFaqs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFAQItem}
        ListEmptyComponent={!isLoadingFAQList ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredFaqs.length === 0 && !isLoadingFAQList && styles.emptyListContainer,
        ]}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={true}
      />

      {/* Loading overlay for initial load */}
      {isLoadingFAQList && faqList.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading FAQs...
          </Text>
        </View>
      )}
    </SafeAreaWrapper>
  );
}

export default function SupportScreen() {
  return <SupportScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    color: '#888',
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
    backgroundColor: '#f3f4f8',
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
    borderColor: '#ececec',
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  faqItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ececec',
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: '#fff',
  },
  faqTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  faqTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    color: '#222',
  },
  faqContent: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#fafbfc',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});