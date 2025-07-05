import { create } from 'zustand';
import { MoneyLogDetail, WalletBalanceData, WalletTransaction } from '@/types';
import { WalletService } from '@/services/wallet';

interface WalletState {
  // Balance data
  balanceData: WalletBalanceData | null;
  
  // Transactions
  isInitialLoad: boolean;
  transactions: WalletTransaction[];
  currentPage: number;
  hasMore: boolean;

  // Order details cache
  logDetails: Record<number, MoneyLogDetail>;
  
  // UI state
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;
  isLoadingMore: boolean;
  isLoadingDetail: boolean;
  balanceError: string | null;
  transactionsError: string | null;
  detailError: string | null;
  
  // Filters
  activeWalletType: '1' | '2'; // 1: NGN, 2: USDT
  activeTransactionType: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip';
  
  // Actions
  fetchBalance: (token: string) => Promise<void>;
  fetchTransactions: (token: string, refresh?: boolean) => Promise<void>;
  loadMoreTransactions: (token: string) => Promise<void>;
  fetchLogDetail: (token: string, logId: number) => Promise<MoneyLogDetail>;
  setActiveWalletType: (type: '1' | '2') => void;
  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => void;
  getCurrentBalanceData: () => WalletBalanceData | null;
  clearWalletData: () => void;
  selectedWithdrawAccount: any | null;
  setSelectedWithdrawAccount: (account: any | null) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  balanceData: null,
  isInitialLoad: true, // 添加这个
  transactions: [],
  currentPage: 0,
  hasMore: true,
  logDetails: {},
  isLoadingBalance: false,
  isLoadingTransactions: false,
  isLoadingMore: false,
  isLoadingDetail: false,
  balanceError: null,
  transactionsError: null,
  detailError: null,
  activeWalletType: '1',
  activeTransactionType: 'all',
  selectedWithdrawAccount: null,

  fetchBalance: async (token: string) => {
    set({ isLoadingBalance: true, balanceError: null });
    
    try {
      const balanceData = await WalletService.getWalletBalance(token);
      set((state) => ({
        ...state,
        balanceData,
        isLoadingBalance: false,
      }));
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingBalance: false });
        return;
      }
      
      set((state) => ({
        ...state,
        balanceError: error instanceof Error ? error.message : 'Failed to fetch balance',
        isLoadingBalance: false,
      }));
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
        isInitialLoad: true, // 标记为初始加载
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

      const transactions = response.data || [];

      set({
        transactions,
        currentPage: 0,
        hasMore: transactions.length >= 20,
        isLoadingTransactions: false,
        isInitialLoad: false, // 初始加载完成
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
    
    if (state.isLoadingMore || !state.hasMore || state.isInitialLoad) return;
    
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

  fetchLogDetail: async (token: string, logId: number): Promise<MoneyLogDetail> => {
    const state = get();
    
    // Return cached detail if available
    if (state.logDetails[logId]) {
      return state.logDetails[logId];
    }

    set({ isLoadingDetail: true, detailError: null });

    try {
      const logDetails = await WalletService.moneyLogDetail({
        token,
        log_id: logId,
      });

      // Cache the detail
      set({
        logDetails: {
          ...state.logDetails,
          [logId]: logDetails,
        },
        isLoadingDetail: false,
      });

      return logDetails;
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingDetail: false });
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch log details';
      set({
        detailError: errorMessage,
        isLoadingDetail: false,
      });
      throw new Error(errorMessage);
    }
  },

  setActiveWalletType: (type: '1' | '2') => {
    set({ 
      activeWalletType: type,
      // Reset transactions when changing wallet type
      transactions: [],
      currentPage: 0,
      hasMore: true,
      isInitialLoad: true,
    });
  },

  setActiveTransactionType: (type: 'all' | 'withdraw' | 'order' | 'transfer' | 'recommend' | 'vip') => {
    set({ 
      activeTransactionType: type,
      // Reset transactions when changing transaction type
      transactions: [],
      currentPage: 0,
      hasMore: true,
      isInitialLoad: true,
    });
  },

  getCurrentBalanceData: () => {
    const state = get();
    return state.balanceData;
  },

  clearWalletData: () => {
    set({
      balanceData: null,
      transactions: [],
      currentPage: 0,
      hasMore: true,
      logDetails: {},
      isLoadingBalance: false,
      isLoadingTransactions: false,
      isLoadingMore: false,
      isLoadingDetail: false,
      balanceError: null,
      transactionsError: null,
      detailError: null,
      activeWalletType: '1',
      activeTransactionType: 'all',
      selectedWithdrawAccount: null,
    });
  },

  setSelectedWithdrawAccount: (account) => set({ selectedWithdrawAccount: account }),
}));