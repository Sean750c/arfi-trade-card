import { create } from 'zustand';
import { WalletBalanceData, WalletTransaction } from '@/types/api';
import { WalletService } from '@/services/wallet';

interface WalletState {
  // Balance data for both wallet types
  ngnBalanceData: WalletBalanceData | null;
  usdtBalanceData: WalletBalanceData | null;
  
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
  activeWalletType: '1' | '2'; // 1: national currency, 2: USDT
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
  ngnBalanceData: null,
  usdtBalanceData: null,
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

  fetchBalance: async (token: string) => {
    set({ isLoadingBalance: true, balanceError: null });
    
    try {
      const balanceData = await WalletService.getWalletBalance(token);
      
      // Store balance data based on default wallet type
      const defaultType = balanceData.default_wallet_type as '1' | '2';
      
      if (defaultType === '1') {
        set({ 
          ngnBalanceData: balanceData,
          isLoadingBalance: false,
          activeWalletType: defaultType,
        });
      } else {
        set({ 
          usdtBalanceData: balanceData,
          isLoadingBalance: false,
          activeWalletType: defaultType,
        });
      }
      
      // For now, we'll use the same data for both types
      // In a real app, you'd make separate API calls for each wallet type
      set({
        ngnBalanceData: balanceData,
        usdtBalanceData: {
          ...balanceData,
          currency_name: 'USDT',
          total_amount: parseFloat(balanceData.usd_amount),
          withdraw_amount: parseFloat(balanceData.usd_amount),
          rebate_amount: balanceData.usd_rebate_money,
        },
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

      const newTransactions = response.data || [];
      
      set({
        transactions: newTransactions,
        currentPage: 0,
        hasMore: newTransactions.length >= 20,
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

      const newTransactions = response.data || [];

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
      // Reset transactions when switching wallet types
      transactions: [],
      currentPage: 0,
      hasMore: true,
    });
  },

  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => {
    set({ 
      activeTransactionType: type,
      // Reset transactions when changing filter
      transactions: [],
      currentPage: 0,
      hasMore: true,
    });
  },

  getCurrentBalanceData: () => {
    const state = get();
    return state.activeWalletType === '1' ? state.ngnBalanceData : state.usdtBalanceData;
  },

  clearWalletData: () => {
    set({
      ngnBalanceData: null,
      usdtBalanceData: null,
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