import { create } from 'zustand';
import { Supplier, DataBundle, RechargeLogEntry } from '@/types/utilities';
import { UtilitiesService } from '@/services/utilities';

interface UtilitiesState {
  // Recharge data
  suppliers: Supplier[];
  dataBundles: DataBundle[];
  isLoadingSuppliers: boolean;
  isLoadingDataBundles: boolean;
  isRecharging: boolean;
  suppliersError: string | null;
  dataBundlesError: string | null;
  rechargeError: string | null;
  
  // Selected states
  selectedSupplier: Supplier | null;

  // Recharge logs data
  rechargeLogs: RechargeLogEntry[];
  currentRechargeLogsPage: number;
  hasMoreRechargeLogs: boolean;

  isLoadingRechargeLogs: boolean;
  isLoadingMoreRechargeLogs: boolean;
  rechargeLogsError: string | null;
  
  // Actions
  fetchSuppliers: (token: string) => Promise<void>;
  fetchDataBundles: (token: string, supplyCode: string) => Promise<void>;
  airtimeRecharge: (token: string, name: string, phone: string, amount: number) => Promise<void>;
  dataRecharge: (token: string, name: string, phone: string, amount: number, serviceId: number) => Promise<void>;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  fetchRechargeLogs: (token: string, type: string, refresh?: boolean) => Promise<void>;
  loadMoreRechargeLogs: (token: string, type: string) => Promise<void>;
  clearUtilitiesData: () => void;
}

export const useUtilitiesStore = create<UtilitiesState>((set, get) => ({
  // Initial state
  suppliers: [],
  dataBundles: [],
  isLoadingSuppliers: false,
  isLoadingDataBundles: false,
  isRecharging: false,
  suppliersError: null,
  dataBundlesError: null,
  rechargeError: null,
  selectedSupplier: null,
  rechargeLogs: [],
  currentRechargeLogsPage: 0,
  hasMoreRechargeLogs: true,
  isLoadingRechargeLogs: false,
  isLoadingMoreRechargeLogs: false,
  rechargeLogsError: null,

  fetchSuppliers: async (token: string) => {
    set({ isLoadingSuppliers: true, suppliersError: null });
    
    try {
      const suppliers = await UtilitiesService.getSuppliers(token);
      set({ 
        suppliers,
        isLoadingSuppliers: false 
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingSuppliers: false });
        return;
      }
      
      set({
        suppliersError: error instanceof Error ? error.message : 'Failed to fetch suppliers',
        isLoadingSuppliers: false,
      });
    }
  },

  fetchDataBundles: async (token: string, supplyCode: string) => {
    set({ isLoadingDataBundles: true, dataBundlesError: null });
    
    try {
      const dataBundles = await UtilitiesService.getDataBundles({
        token,
        supply_code: supplyCode,
      });
      
      set({ 
        dataBundles,
        isLoadingDataBundles: false 
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingDataBundles: false });
        return;
      }
      
      set({
        dataBundlesError: error instanceof Error ? error.message : 'Failed to fetch data bundles',
        isLoadingDataBundles: false,
      });
    }
  },

  airtimeRecharge: async (token: string, name: string, phone: string, amount: number) => {
    set({ isRecharging: true, rechargeError: null });
    
    try {
      await UtilitiesService.airtimeRecharge({
        token,
        name,
        phone,
        amount,
      });
      
      set({ isRecharging: false });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isRecharging: false });
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to recharge airtime';
      set({
        rechargeError: errorMessage,
        isRecharging: false,
      });
      throw new Error(errorMessage);
    }
  },

  dataRecharge: async (token: string, name: string, phone: string, amount: number, serviceId: number) => {
    set({ isRecharging: true, rechargeError: null });
    
    try {
      await UtilitiesService.dataRecharge({
        token,
        name,
        phone,
        amount,
        service_id: serviceId,
      });
      
      set({ isRecharging: false });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isRecharging: false });
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to recharge data';
      set({
        rechargeError: errorMessage,
        isRecharging: false,
      });
      throw new Error(errorMessage);
    }
  },

  setSelectedSupplier: (supplier: Supplier | null) => {
    set({ 
      selectedSupplier: supplier,
      dataBundles: [], // Clear data bundles when supplier changes
    });
  },

  fetchRechargeLogs: async (token: string, type: string, refresh = false) => {
    const state = get();
    
    if (refresh) {
      set({ 
        isLoadingRechargeLogs: true, 
        rechargeLogsError: null,
        rechargeLogs: [],
        currentRechargeLogsPage: 0,
        hasMoreRechargeLogs: true,
      });
    } else {
      set({ isLoadingRechargeLogs: true, rechargeLogsError: null });
    }

    try {
      const logsData = await UtilitiesService.getRechargeLogs({
        token,
        type,
        page: 0,
        page_size: 10,
      });

      set({
        rechargeLogs: logsData,
        currentRechargeLogsPage: 0,
        hasMoreRechargeLogs: logsData.length >= 10,
        isLoadingRechargeLogs: false,
      });
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingRechargeLogs: false });
        return;
      }
      
      set({
        rechargeLogsError: error instanceof Error ? error.message : 'Failed to fetch recharge logs',
        isLoadingRechargeLogs: false,
      });
    }
  },

  loadMoreRechargeLogs: async (token: string, type: string) => {
    const state = get();
    
    if (state.isLoadingMoreRechargeLogs || !state.hasMoreRechargeLogs) return;
    
    const nextPage = state.currentRechargeLogsPage + 1;
    
    set({ isLoadingMoreRechargeLogs: true, rechargeLogsError: null });

    try {
      const logsData = await UtilitiesService.getRechargeLogs({
        token,
        type,
        page: nextPage,
        page_size: 10,
      });

      if (logsData.length === 0) {
        set({ isLoadingMoreRechargeLogs: false, hasMoreRechargeLogs: false });
        return;
      }

      set(state => ({
        rechargeLogs: [...state.rechargeLogs, ...logsData],
        currentRechargeLogsPage: nextPage,
        hasMoreRechargeLogs: logsData.length >= 10,
        isLoadingMoreRechargeLogs: false,
      }));
      
    } catch (error) {
      // Handle token expiration errors specifically
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMoreRechargeLogs: false });
        return;
      }
      
      set({
        rechargeLogsError: error instanceof Error ? error.message : 'Failed to load more recharge logs',
        isLoadingMoreRechargeLogs: false,
      });
    }
  },

  clearUtilitiesData: () => {
    set({
      suppliers: [],
      dataBundles: [],
      isLoadingSuppliers: false,
      isLoadingDataBundles: false,
      isRecharging: false,
      suppliersError: null,
      dataBundlesError: null,
      rechargeError: null,
      selectedSupplier: null,
      rechargeLogs: [],
      currentRechargeLogsPage: 0,
      hasMoreRechargeLogs: true,
      isLoadingRechargeLogs: false,
      isLoadingMoreRechargeLogs: false,
      rechargeLogsError: null,
    });
  },
}));