import { create } from 'zustand';
import { WalletBalanceData, WalletTransaction, WalletTransactionsData } from '@/types/api';
import { WalletService } from '@/services/wallet';

interface WalletState {
  // Balance data
  balanceData: WalletBalanceData | null;
  
  // Transactions data
  transactions: WalletTransaction[];
  currentPage: number,
  
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
        page_size: 10,
      });
      // Handle paginati
      set({
        transactions: response.data,
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
    
    if (state.isLoadingMore) return;
    
    const nextPage = state.currentPage + 1;
    
    set({ isLoadingMore: true, transactionsError: null });

    try {
      const response = await WalletService.getWalletTransactions({
        token,
        type: state.activeTransactionType,
        wallet_type: state.activeWalletType,
        page: nextPage,
        page_size: 10,
      });

      const newTransactions = response.data;

      if (newTransactions.length === 0) {
        // 没有更多了
        set({ isLoadingMore: false });
        return;
      }

      set({
        transactions: [...state.transactions, ...response.data],
        currentPage: nextPage,
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
    set({ activeWalletType: type });
  },

  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => {
    set({ activeTransactionType: type });
  },

  clearWalletData: () => {
    set({
      balanceData: null,
      transactions: [],
      currentPage: 0,
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