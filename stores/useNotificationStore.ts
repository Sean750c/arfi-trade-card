import { create } from 'zustand';
import { Notice, NoticeListData } from '@/types';
import { NotificationService } from '@/services/notification';

interface NotificationState {
  notifications: Notice[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  activeType: 'all' | 'notice' | 'system';
  totalCount: number;
  pageSize: number;
  
  // Actions
  fetchNotifications: (token: string, type?: 'all' | 'notice' | 'system', refresh?: boolean) => Promise<void>;
  loadMoreNotifications: (token: string) => Promise<void>;
  setActiveType: (type: 'all' | 'notice' | 'system') => void;
  markAsRead: (noticeId: number, token: string) => Promise<void>;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  activeType: 'all',
  totalCount: 0,
  pageSize: 20,

  fetchNotifications: async (token: string, type = 'all', refresh = false) => {
    const state = get();
    
    // If refreshing or changing type, reset pagination
    if (refresh || type !== state.activeType) {
      set({ 
        isLoading: true, 
        error: null, 
        currentPage: 1, 
        activeType: type,
        notifications: refresh ? [] : state.notifications,
        hasMore: true,
      });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const data = await NotificationService.getNotifications({
        token,
        type,
        page: 0,
        page_size: state.pageSize,
      });

      // Determine if there are more pages based on returned data length
      const hasMore = data.length >= state.pageSize;

      set({
        notifications: data,
        totalCount: data.length, // We don't have total count from API, so use current length
        hasMore,
        currentPage: 0,
        isLoading: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Don't set error state for token expiration, as it's handled by redirect
        set({ isLoading: false });
        return;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  loadMoreNotifications: async (token: string) => {
    const state = get();
    
    if (state.isLoading ||state.isLoadingMore || !state.hasMore) return;

    set({ isLoadingMore: true, error: null });

    try {
      const nextPage = state.currentPage + 1;
      const data = await NotificationService.getNotifications({
        token,
        type: state.activeType,
        page: nextPage,
        page_size: state.pageSize,
      });

      // Determine if there are more pages based on returned data length
      const hasMore = data.length >= state.pageSize;

      set({
        notifications: [...state.notifications, ...data],
        currentPage: nextPage,
        hasMore,
        totalCount: state.totalCount + data.length,
        isLoadingMore: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Don't set error state for token expiration, as it's handled by redirect
        set({ isLoadingMore: false });
        return;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Failed to load more notifications',
        isLoadingMore: false,
      });
    }
  },

  setActiveType: (type: 'all' | 'notice' | 'system') => {
    set({ activeType: type });
  },

  markAsRead: async (noticeId: number, token: string) => {
    try {
      await NotificationService.markAsRead(noticeId, token);
      
      // Update local state
      const state = get();
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === noticeId
          ? { ...notification, notice_new: false }
          : notification
      );
      
      set({ notifications: updatedNotifications });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Token expiration is handled by redirect, just log the error
        console.error('Token expired while marking notification as read');
        return;
      }
      
      console.error('Failed to mark notification as read:', error);
    }
  },

  clearNotifications: () => {
    set({
      notifications: [],
      currentPage: 1,
      hasMore: true,
      totalCount: 0,
      error: null,
    });
  },
}));