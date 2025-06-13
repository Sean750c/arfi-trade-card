import { create } from 'zustand';
import { WalletBalanceData, WalletTransaction } from '@/types/api';
import { WalletService } from '@/services/wallet';

interface WalletState {
  // Balance data
  ngnBalance: WalletBalanceData | null;
  usdtBalance: WalletBalanceData | null;
  
  // Transactions data
  transactions: WalletTransaction[];
  currentPage: number;
  hasMore: boolean;
  
  // UI state
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;
  isLoadingMore: boolean;
  balanceError: string | null;
  transactionsError: string | null;
  
  // Filters
  activeWalletType: '1' | '2'; // 1: NGN, 2: USDT
  activeTransactionType: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip';
  
  // Actions
  fetchBalance: (token: string) => Promise<void>;
  fetchTransactions: (token: string, refresh?: boolean) => Promise<void>;
  loadMoreTransactions: (token: string) => Promise<void>;
  setActiveWalletType: (type: '1' | '2') => void;
  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => void;
  getCurrentBalanceData: () => WalletBalanceData | null;
  clearWalletData: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  ngnBalance: null,
  usdtBalance: null,
  transactions: [],
  currentPage: 0,
  hasMore: true,
  isLoadingBalance: false,
  isLoadingTransactions: false,
  isLoadingMore: false,
  balanceError: null,
  transactionsError: null,
  activeWalletType: '1', // Default to NGN
  activeTransactionType: 'all',

  fetchBalance: async (token: string) => {
    set({ isLoadingBalance: true, balanceError: null });
    
    try {
      const balanceData = await WalletService.getWalletBalance(token);
      
      // Update the appropriate balance based on wallet type
      if (balanceData.default_wallet_type === '1') {
        set({ ngnBalance: balanceData });
      } else {
        set({ usdtBalance: balanceData });
      }
      
      set({ isLoadingBalance: false });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingBalance: false });
        return;
      }
      
      set({
        balanceError: error instanceof Error ? error.message : 'Failed to fetch wallet balance',
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
        hasMore: true,
      });
    } else {
      set({ isLoadingTransactions: true, transactionsError: null });
    }

    try {
      const response = await WalletService.getWalletTransactions({
        token,
        type: state.activeTransactionType,
        wallet_type: state.activeWalletType,
        page: 0,
        page_size: 20,
      });

      set({
        transactions: response.data,
        currentPage: 0,
        hasMore: response.data.length >= 20,
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
    
    if (state.isLoadingMore || !state.hasMore) return;
    
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

      if (newTransactions.length === 0) {
        set({ isLoadingMore: false, hasMore: false });
        return;
      }

      set({
        transactions: [...state.transactions, ...newTransactions],
        currentPage: nextPage,
        hasMore: newTransactions.length >= 20,
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
      // Reset transactions when changing wallet type
      transactions: [],
      currentPage: 0,
      hasMore: true,
    });
  },

  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => {
    set({ 
      activeTransactionType: type,
      // Reset transactions when changing transaction type
      transactions: [],
      currentPage: 0,
      hasMore: true,
    });
  },

  getCurrentBalanceData: () => {
    const state = get();
    return state.activeWalletType === '1' ? state.ngnBalance : state.usdtBalance;
  },

  clearWalletData: () => {
    set({
      ngnBalance: null,
      usdtBalance: null,
      transactions: [],
      currentPage: 0,
      hasMore: true,
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