import { create } from 'zustand';
import { Notice, NoticeListData } from '@/types/api';
import { NotificationService } from '@/services/notification';

interface NotificationState {
  notifications: Notice[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  activeType: 'all' | 'motion' | 'system';
  totalCount: number;
  
  // Actions
  fetchNotifications: (token: string, type?: 'all' | 'motion' | 'system', refresh?: boolean) => Promise<void>;
  loadMoreNotifications: (token: string) => Promise<void>;
  setActiveType: (type: 'all' | 'motion' | 'system') => void;
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

  fetchNotifications: async (token: string, type = 'all', refresh = false) => {
    const state = get();
    
    // If refreshing or changing type, reset pagination
    if (refresh || type !== state.activeType) {
      set({ 
        isLoading: true, 
        error: null, 
        currentPage: 1, 
        activeType: type,
        notifications: refresh ? [] : state.notifications
      });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const data = await NotificationService.getNotifications({
        token,
        type,
        page: 1,
        pageSize: 20,
      });

      set({
        notifications: data.list,
        totalCount: data.total,
        hasMore: data.hasMore,
        currentPage: 1,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  loadMoreNotifications: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMore || !state.hasMore) return;

    set({ isLoadingMore: true, error: null });

    try {
      const nextPage = state.currentPage + 1;
      const data = await NotificationService.getNotifications({
        token,
        type: state.activeType,
        page: nextPage,
        pageSize: 20,
      });

      set({
        notifications: [...state.notifications, ...data.list],
        currentPage: nextPage,
        hasMore: data.hasMore,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load more notifications',
        isLoadingMore: false,
      });
    }
  },

  setActiveType: (type: 'all' | 'motion' | 'system') => {
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