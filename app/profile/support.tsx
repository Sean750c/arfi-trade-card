import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
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

/** -------------------------------------------------------------
 *  Utils
 *  ------------------------------------------------------------- */

// 轻量 HTML 清理（Web 端用）：去掉 script/style 和 on* 事件属性，保留基本结构
function sanitizeHtmlLight(html: string) {
  try {
    if (Platform.OS !== 'web') return html;
    // 移除<script>与<style>内容
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    // 去除 on* 事件属性与 javascript: 协议
    out = out.replace(/\son\w+="[^"]*"/gi, '')
             .replace(/\son\w+='[^']*'/gi, '')
             .replace(/javascript:/gi, '');
    return out;
  } catch {
    return html;
  }
}

// HTML → 纯文本（用于搜索）
function htmlToPlainText(html: string) {
  if (!html) return '';
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ''); // remove tags

  // decode common entities
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&lt;': '<',
    '&gt;': '>',
  };
  text = text.replace(/(&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;)/g, (m) => entities[m] || m);
  return text.replace(/\n{2,}/g, '\n').trim();
}

/** -------------------------------------------------------------
 *  AnswerHTML - 原生端 WebView + Web 端内联渲染
 *  ------------------------------------------------------------- */

interface AnswerHTMLProps {
  html: string;
}

const injectedJS = `
  (function() {
    var frame;
    function postHeight() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function() {
        var body = document.body;
        var docEl = document.documentElement;
        var height = Math.max(
          body.scrollHeight, body.offsetHeight,
          docEl.clientHeight, docEl.scrollHeight, docEl.offsetHeight
        );
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(height || 0));
      });
    }

    function robustReport() {
      postHeight();
      setTimeout(postHeight, 50);
      setTimeout(postHeight, 150);
      setTimeout(postHeight, 300);
      setTimeout(postHeight, 600);
      setTimeout(postHeight, 1000);
      setTimeout(postHeight, 2000);
    }

    // 图片、字体、资源加载完成后再试
    (function watchImages() {
      var imgs = Array.prototype.slice.call(document.images || []);
      imgs.forEach(function(img) {
        img.addEventListener('load', postHeight, { passive: true });
        img.addEventListener('error', postHeight, { passive: true });
      });
    })();

    // 监听 DOM 变化
    try {
      var observer = new MutationObserver(function() { postHeight(); });
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true });
    } catch (e) {}

    // 初次多次上报
    robustReport();

    // 防止选择、缩放带来抖动（根据实际需要开启）
    document.addEventListener('readystatechange', postHeight);
    window.addEventListener('load', robustReport);
  })();
  true;
`;

const AnswerHTML: React.FC<AnswerHTMLProps> = ({ html }) => {
  const [webViewHeight, setWebViewHeight] = useState(40);
  const lastHeightRef = useRef(0);
  const webViewRef = useRef<WebView | null>(null);

  const safeHtml = useMemo(() => sanitizeHtmlLight(html), [html]);

  if (Platform.OS === 'web') {
    // Web 端直接渲染
    return (
      <div
        style={{
          width: '100%',
          minHeight: 40,
          background: '#fff',
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
          overflow: 'hidden',
          padding: '16px 12px',
          fontSize: 15,
          color: '#333',
          lineHeight: 1.7,
          boxSizing: 'border-box',
        }}
        // 已做轻量 sanitize
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }

  const htmlDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          html, body { margin:0; padding:0; background:#fff; }
          body { padding:16px 12px; font-size:15px; color:#333; line-height:1.7; }
          img { max-width:100%; height:auto; display:inline-block; margin:8px 0; }
          p { margin:0 0 12px 0; padding:0; }
          ul,ol { margin:8px 0 8px 20px; }
          table { width:100%; border-collapse: collapse; }
          th, td { padding: 6px; border: 1px solid rgba(0,0,0,0.08); }
          a { word-break: break-word; }
          blockquote { margin: 8px 0; padding-left: 10px; border-left: 3px solid rgba(0,0,0,0.1); }
          pre, code { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        ${safeHtml}
        <script>${injectedJS}</script>
      </body>
    </html>
  `;

  return (
    <View style={{ width: '100%', minHeight: 40, backgroundColor: '#fff', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, overflow: 'hidden' }}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlDoc }}
        style={{ width: '100%', height: webViewHeight, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        javaScriptEnabled
        injectedJavaScript={injectedJS}
        onMessage={(event) => {
          const next = Number(event.nativeEvent.data);
          if (!isNaN(next) && next > 0) {
            // 防抖 + 阈值过滤，避免频繁 setState 抖动
            const last = lastHeightRef.current;
            if (Math.abs(next - last) > 2) {
              lastHeightRef.current = next;
              setWebViewHeight(next);
            }
          }
        }}
        onLoadEnd={() => {
          // 兜底再发一次高度请求
          webViewRef.current?.injectJavaScript('true;');
        }}
        originWhitelist={['*']}
        automaticallyAdjustContentInsets={false}
        javaScriptCanOpenWindowsAutomatically={false}
        allowFileAccess={false}
        allowingReadAccessToURL={undefined}
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
      />
    </View>
  );
};

/** -------------------------------------------------------------
 *  FAQ Item Row （memo 优化）
 *  ------------------------------------------------------------- */

const FAQItemRow = memo(function FAQItemRow({
  item,
  isExpanded,
  onToggle,
  colors,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View
      style={[
        styles.faqItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity style={styles.faqHeader} onPress={() => onToggle(item.id)} activeOpacity={0.7}>
        <View style={styles.faqTitleContainer}>
          <HelpCircle size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.faqTitle}>{item.question}</Text>
        </View>
        {isExpanded ? <ChevronUp size={20} color={colors.textSecondary} /> : <ChevronDown size={20} color={colors.textSecondary} />}
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.faqContent}>
          <AnswerHTML html={item.answer} />
        </View>
      ) : null}
    </View>
  );
}, (prev, next) => {
  // 仅当展开状态和 item 引用都不变时跳过渲染
  return prev.isExpanded === next.isExpanded && prev.item === next.item && prev.colors === next.colors;
});

/** -------------------------------------------------------------
 *  Screen
 *  ------------------------------------------------------------- */

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

  // Android 启用 LayoutAnimation（Android 9+）
  useEffect(() => {
    if (Platform.OS === 'android') {
      const v = Platform.Version as number;
      if (v >= 28 && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchFAQCategories();
    fetchFAQList(true).then(() => setHasLoadedOnce(true));
  }, [fetchFAQList, fetchFAQCategories]);

  // 过滤数据（useMemo 避免频繁计算）
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return faqList.filter((faq) => {
      if (selectedCategory !== 'all' && faq.category_name !== selectedCategory) return false;
      if (!query) return true;
      const plainAnswer = htmlToPlainText(faq.answer);
      return faq.question.toLowerCase().includes(query) || plainAnswer.toLowerCase().includes(query);
    });
  }, [faqList, searchQuery, selectedCategory]);

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

  const toggleExpanded = useCallback((id: number) => {
    // iOS & Android 9+ 才做过渡动画，旧安卓避免闪动
    if (Platform.OS === 'ios' || (Platform.OS === 'android' && (Platform.Version as number) >= 28)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setExpandedItems((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }, []);

  const getCategories = useCallback(() => {
    return ['all', ...faqCategories];
  }, [faqCategories]);

  const handleCategoryChange = useCallback((category: string) => {
    if (Platform.OS === 'ios' || (Platform.OS === 'android' && (Platform.Version as number) >= 28)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSelectedCategory(category);
    setExpandedItems(new Set());
  }, []);

  const renderFAQItem = useCallback(
    ({ item }: { item: FAQItem }) => {
      const isExpanded = expandedItems.has(item.id);
      return <FAQItemRow item={item} isExpanded={isExpanded} onToggle={toggleExpanded} colors={colors} />;
    },
    [expandedItems, toggleExpanded, colors]
  );

  const keyExtractor = useCallback((item: FAQItem) => String(item.id), []);

  const renderCategoryFilter = useCallback(() => {
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
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === item ? '#FFFFFF' : colors.text },
                ]}
              >
                {item === 'all' ? 'All' : item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>
    );
  }, [colors.border, colors.primary, colors.text, getCategories, handleCategoryChange, selectedCategory]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading more FAQs...</Text>
      </View>
    );
  }, [isLoadingMore, colors.primary, colors.textSecondary]);

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <HelpCircle size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {searchQuery ? 'No results found' : 'No FAQs available'}
        </Text>
        <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
          {searchQuery
            ? 'Try adjusting your search terms or browse different categories'
            : 'FAQ content is being updated. Please check back later.'}
        </Text>
      </View>
    ),
    [colors.text, colors.textSecondary, searchQuery]
  );

  if (faqsError) {
    return (
      <SafeAreaWrapper backgroundColor={colors.background}>
        <View style={styles.errorContainer}>
          <HelpCircle size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.error }]}>Failed to load FAQs</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{faqsError}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Frequently asked questions</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: colors.card },
          ]}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search FAQs..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlignVertical="center"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
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
        keyExtractor={keyExtractor}
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
        // WebView 离屏内存问题：仅 Android 开启裁剪提升性能；iOS 关闭以避免滚动闪烁
        removeClippedSubviews={Platform.OS === 'android'}
        bounces={Platform.OS === 'ios' ? true : undefined}
      />

      {/* Loading overlay for initial load */}
      {isLoadingFAQList && faqList.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading FAQs...</Text>
        </View>
      )}
    </SafeAreaWrapper>
  );
}

export default function SupportScreen() {
  return <SupportScreenContent />;
}

/** -------------------------------------------------------------
 *  Styles
 *  ------------------------------------------------------------- */

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
