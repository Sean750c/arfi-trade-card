import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Filter, 
  Calendar,
  Gift,
  Clock,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  CircleX as XCircle,
  Search,
  TrendingUp,
} from 'lucide-react-native';
import AuthGuard from '@/components/UI/AuthGuard';
import { useTheme } from '@/theme/ThemeContext';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOrderStore } from '@/stores/useOrderStore';
import OrderStatusFilter from '@/components/orders/OrderStatusFilter';
import OrderCard from '@/components/orders/OrderCard';
import type { OrderListItem } from '@/types';

function OrdersScreenContent() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const {
    orders,
    isLoadingOrders,
    isLoadingMore,
    ordersError,
    activeStatus,
    fetchOrders,
    loadMoreOrders,
    setActiveStatus,
  } = useOrderStore();

  const [refreshing, setRefreshing] = useState(false);

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (user?.token) {
      // fetchOrders(user.token, true);
      fetchOrders(user.token, true).then(() => setHasLoadedOnce(true));
    }
  }, [user?.token, activeStatus, fetchOrders]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;

    setRefreshing(true);
    try {
      await fetchOrders(user.token, true);
    } finally {
      setRefreshing(false);
    }
  }, [user?.token, fetchOrders]);

  const handleLoadMore = useCallback(() => {
    if (!hasLoadedOnce || isLoadingMore || isLoadingOrders) return;
    if (user?.token) {
      loadMoreOrders(user.token);
    }
  }, [user?.token, hasLoadedOnce, isLoadingMore, isLoadingOrders, loadMoreOrders]);

  const handleOrderPress = (order: OrderListItem) => {
    router.push(`/orders/${order.order_no}` as any);
  };

  const handleStatusChange = (status: 'all' | 'inprocess' | 'done') => {
    setActiveStatus(status);
  };

  const getStatusStats = () => {
    const stats = {
      all: orders.length,
      inprocess: 0,
      done: 0,
    };

    orders.forEach(order => {
      if (order.status_desc.toLowerCase().includes('pending') || 
          order.status_desc.toLowerCase().includes('processing')) {
        stats.inprocess++;
      } else if (order.status_desc.toLowerCase().includes('succeed') ||
                 order.status_desc.toLowerCase().includes('success') ||
                 order.status_desc.toLowerCase().includes('failed') || 
                 order.status_desc.toLowerCase().includes('completed')) {
        stats.done++;
      }
    });

    return stats;
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more orders...
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Gift size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No orders found
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {activeStatus === 'all' 
          ? "You haven't placed any orders yet. Start trading gift cards to see your orders here."
          : `No ${activeStatus === 'inprocess' ? 'pending' : 'completed'} orders found.`
        }
      </Text>
      {activeStatus === 'all' && (
        <TouchableOpacity
          style={[styles.startTradingButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/sell')}
        >
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.startTradingText}>Start Trading</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (ordersError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.error }]}>
            Failed to load orders
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {ordersError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          shadowColor: 'rgba(0, 0, 0, 0.05)',
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
        </View>
        {/* <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: `${colors.primary}15` }]}
          onPress={() => {
            // TODO: Implement search functionality
          }}
        >
          <Search size={20} color={colors.primary} />
        </TouchableOpacity> */}
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <OrderStatusFilter
          activeStatus={activeStatus}
          onStatusChange={handleStatusChange}
          stats={getStatusStats()}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_no}
        renderItem={({ item }) => (
          <OrderCard 
            order={item} 
            onPress={() => handleOrderPress(item)}
          />
        )}
        ListEmptyComponent={!isLoadingOrders ? renderEmptyState : null}
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
          orders.length === 0 && !isLoadingOrders && styles.emptyListContainer,
        ]}
      />

      {/* Loading overlay for initial load */}
      {isLoadingOrders && orders.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your orders...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function OrdersScreen() {
  return (
    <AuthGuard>
      <OrdersScreenContent />
    </AuthGuard>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
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
    marginBottom: Spacing.xl,
  },
  startTradingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  startTradingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
});