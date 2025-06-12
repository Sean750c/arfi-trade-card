import { create } from 'zustand';
import { WalletBalanceData, WalletTransaction } from '@/types/api';
import { WalletService } from '@/services/wallet';

interface WalletState {
  // Balance data
  balanceData: WalletBalanceData | null;
  
  // Transactions data
  transactions: WalletTransaction[];
  currentPage: number;
  hasMoreTransactions: boolean;
  
  // UI state
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;
  isLoadingMore: boolean;
  balanceError: string | null;
  transactionsError: string | null;
  
  // Filters
  activeWalletType: '1' | '2'; // 1: national currency, 2: USDT
  activeTransactionType: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip';
  
  // Actions
  fetchBalance: (token: string) => Promise<void>;
  fetchTransactions: (token: string, refresh?: boolean) => Promise<void>;
  loadMoreTransactions: (token: string) => Promise<void>;
  setActiveWalletType: (type: '1' | '2') => void;
  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => void;
  clearWalletData: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  balanceData: null,
  transactions: [],
  currentPage: 0,
  hasMoreTransactions: true,
  isLoadingBalance: false,
  isLoadingTransactions: false,
  isLoadingMore: false,
  balanceError: null,
  transactionsError: null,
  activeWalletType: '1',
  activeTransactionType: 'all',

  fetchBalance: async (token: string) => {
    set({ isLoadingBalance: true, balanceError: null });
    
    try {
      const balanceData = await WalletService.getWalletBalance(token);
      set({ 
        balanceData, 
        isLoadingBalance: false,
        // Set default wallet type based on API response
        activeWalletType: balanceData.default_wallet_type as '1' | '2',
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingBalance: false });
        return;
      }
      
      set({
        balanceError: error instanceof Error ? error.message : 'Failed to fetch balance',
        isLoadingBalance: false,
      });
    }
  },

  fetchTransactions: async (token: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingTransactions: true, 
        transactionsError: null,
        transactions: [],
        currentPage: 0,
        hasMoreTransactions: true,
      });
    } else {
      set({ isLoadingTransactions: true, transactionsError: null });
    }

    try {
      const response = await WalletService.getWalletTransactions({
        token,
        type: state.activeTransactionType,
        wallet_type: state.activeWalletType,
        page: 0, // Start from page 0
        page_size: 20,
      });

      const newTransactions = response.data;
      const hasMore = newTransactions.length >= 20;

      set({
        transactions: newTransactions,
        currentPage: 0,
        hasMoreTransactions: hasMore,
        isLoadingTransactions: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingTransactions: false });
        return;
      }
      
      set({
        transactionsError: error instanceof Error ? error.message : 'Failed to fetch transactions',
        isLoadingTransactions: false,
      });
    }
  },

  loadMoreTransactions: async (token: string) => {
    const state = get();
    
    if (state.isLoadingMore || !state.hasMoreTransactions) return;
    
    const nextPage = state.currentPage + 1;
    
    set({ isLoadingMore: true, transactionsError: null });

    try {
      const response = await WalletService.getWalletTransactions({
        token,
        type: state.activeTransactionType,
        wallet_type: state.activeWalletType,
        page: nextPage,
        page_size: 20,
      });

      const newTransactions = response.data;
      const hasMore = newTransactions.length >= 20;

      if (newTransactions.length === 0) {
        set({ 
          isLoadingMore: false,
          hasMoreTransactions: false,
        });
        return;
      }

      set({
        transactions: [...state.transactions, ...newTransactions],
        currentPage: nextPage,
        hasMoreTransactions: hasMore,
        isLoadingMore: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMore: false });
        return;
      }
      
      set({
        transactionsError: error instanceof Error ? error.message : 'Failed to load more transactions',
        isLoadingMore: false,
      });
    }
  },

  setActiveWalletType: (type: '1' | '2') => {
    set({ 
      activeWalletType: type,
      // Reset transactions when switching wallet type
      transactions: [],
      currentPage: 0,
      hasMoreTransactions: true,
    });
  },

  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => {
    set({ 
      activeTransactionType: type,
      // Reset transactions when switching transaction type
      transactions: [],
      currentPage: 0,
      hasMoreTransactions: true,
    });
  },

  clearWalletData: () => {
    set({
      balanceData: null,
      transactions: [],
      currentPage: 0,
      hasMoreTransactions: true,
      isLoadingBalance: false,
      isLoadingTransactions: false,
      isLoadingMore: false,
      balanceError: null,
      transactionsError: null,
      activeWalletType: '1',
      activeTransactionType: 'all',
    });
  },
}));