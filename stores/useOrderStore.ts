import { create } from 'zustand';
import { OrderListItem, OrderDetail, OrderSellDetail } from '@/types';
import { OrderService } from '@/services/order';

interface OrderState {
  // Order list data
  orders: OrderListItem[];
  currentPage: number;
  hasMore: boolean;
  
  // Order details cache
  orderDetails: Record<string, OrderDetail>;
  
  // UI state
  isLoadingOrders: boolean;
  isLoadingMore: boolean;
  isLoadingDetail: boolean;
  ordersError: string | null;
  detailError: string | null;
  
  // Filters
  activeStatus: 'all' | 'inprocess' | 'done';
  startTime?: number;
  endTime?: number;
  
  // Actions
  fetchOrders: (token: string, refresh?: boolean) => Promise<void>;
  loadMoreOrders: (token: string) => Promise<void>;
  fetchOrderDetail: (token: string, orderNo: string) => Promise<OrderDetail>;
  setActiveStatus: (status: 'all' | 'inprocess' | 'done') => void;
  setDateRange: (startTime?: number, endTime?: number) => void;
  clearOrders: () => void;
  orderSellDetail?: OrderSellDetail;
  isLoadingOrderSellDetail?: boolean;
  orderSellDetailError?: string | null;
  fetchOrderSellDetail: (token?: string) => Promise<OrderSellDetail>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Initial state
  orders: [],
  currentPage: 0,
  hasMore: true,
  orderDetails: {},
  isLoadingOrders: false,
  isLoadingMore: false,
  isLoadingDetail: false,
  ordersError: null,
  detailError: null,
  activeStatus: 'all',
  orderSellDetail: undefined,
  isLoadingOrderSellDetail: false,
  orderSellDetailError: null,

  fetchOrders: async (token: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingOrders: true, 
        ordersError: null,
        orders: [],
        currentPage: 0,
        hasMore: true,
      });
    } else {
      set({ isLoadingOrders: true, ordersError: null });
    }

    try {
      const orderData = await OrderService.getOrderList({
        token,
        status: state.activeStatus,
        page: 0,
        page_size: 10,
      });

      set({
        orders: orderData,
        currentPage: 0,
        hasMore: orderData.length >= 10,
        isLoadingOrders: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingOrders: false });
        return;
      }
      
      set({
        ordersError: error instanceof Error ? error.message : 'Failed to fetch orders',
        isLoadingOrders: false,
      });
    }
  },

  loadMoreOrders: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMore || !state.hasMore) return;
    
    const nextPage = state.currentPage + 1;
    
    set({ isLoadingMore: true, ordersError: null });

    try {
      const orderData = await OrderService.getOrderList({
        token,
        status: state.activeStatus,
        page: nextPage,
        page_size: 10,
      });

      const newOrders = orderData;

      if (newOrders.length === 0) {
        set({ isLoadingMore: false, hasMore: false });
        return;
      }

      set({
        orders: [...state.orders, ...newOrders],
        currentPage: nextPage,
        hasMore: newOrders.length >= 10,
        isLoadingMore: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMore: false });
        return;
      }
      
      set({
        ordersError: error instanceof Error ? error.message : 'Failed to load more orders',
        isLoadingMore: false,
      });
    }
  },

  fetchOrderDetail: async (token: string, orderNo: string): Promise<OrderDetail> => {
    const state = get();
    
    // Return cached detail if available
    if (state.orderDetails[orderNo]) {
      return state.orderDetails[orderNo];
    }

    set({ isLoadingDetail: true, detailError: null });

    try {
      const orderDetail = await OrderService.getOrderDetail({
        token,
        order_no: orderNo,
      });

      // Cache the detail
      set({
        orderDetails: {
          ...state.orderDetails,
          [orderNo]: orderDetail,
        },
        isLoadingDetail: false,
      });

      return orderDetail;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingDetail: false });
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order details';
      set({
        detailError: errorMessage,
        isLoadingDetail: false,
      });
      throw new Error(errorMessage);
    }
  },

  fetchOrderSellDetail: async (token) => {
    set({ isLoadingOrderSellDetail: true, orderSellDetailError: null });
    try {
      const detail = await OrderService.getOrderSellDetail({ token });
      set({ orderSellDetail: detail, isLoadingOrderSellDetail: false });
      return detail;
    } catch (error) {
      set({
        orderSellDetailError: error instanceof Error ? error.message : 'Failed to fetch order sell detail',
        isLoadingOrderSellDetail: false,
      });
      throw error;
    }
  },

  setActiveStatus: (status: 'all' | 'inprocess' | 'done') => {
    set({ 
      activeStatus: status,
      // Reset orders when changing status
      orders: [],
      currentPage: 0,
      hasMore: true,
    });
  },

  setDateRange: (startTime?: number, endTime?: number) => {
    set({ 
      startTime,
      endTime,
      // Reset orders when changing date range
      orders: [],
      currentPage: 0,
      hasMore: true,
    });
  },

  clearOrders: () => {
    set({
      orders: [],
      currentPage: 0,
      hasMore: true,
      orderDetails: {},
      isLoadingOrders: false,
      isLoadingMore: false,
      isLoadingDetail: false,
      ordersError: null,
      detailError: null,
      activeStatus: 'all',
      startTime: undefined,
      endTime: undefined,
      orderSellDetail: undefined,
      isLoadingOrderSellDetail: false,
      orderSellDetailError: null,
    });
  },

  
}));