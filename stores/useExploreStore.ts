import { create } from 'zustand';
import { Activity, Supplier, DataBundle } from '@/types/explore';
import { ExploreService } from '@/services/explore';

interface ExploreState {
  // Activities data
  activities: Activity[];
  isLoadingActivities: boolean;
  activitiesError: string | null;
  
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
  
  // Actions
  fetchActivities: (token?: string, countryId?: number) => Promise<void>;
  fetchSuppliers: (token: string) => Promise<void>;
  fetchDataBundles: (token: string, supplyCode: string) => Promise<void>;
  airtimeRecharge: (token: string, name: string, phone: string, amount: number) => Promise<void>;
  dataRecharge: (token: string, name: string, phone: string, amount: number, serviceId: number) => Promise<void>;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  clearExploreData: () => void;
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  // Initial state
  activities: [],
  isLoadingActivities: false,
  activitiesError: null,
  suppliers: [],
  dataBundles: [],
  isLoadingSuppliers: false,
  isLoadingDataBundles: false,
  isRecharging: false,
  suppliersError: null,
  dataBundlesError: null,
  rechargeError: null,
  selectedSupplier: null,

  fetchActivities: async (token, countryId = 1) => {
    set({ isLoadingActivities: true, activitiesError: null });
    
    try {
      const finderData = await ExploreService.getFinder({
        token,
        country_id: countryId,
      });
      
      set({ 
        activities: finderData.active || [],
        isLoadingActivities: false 
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingActivities: false });
        return;
      }
      
      set({
        activitiesError: error instanceof Error ? error.message : 'Failed to fetch activities',
        isLoadingActivities: false,
      });
    }
  },

  fetchSuppliers: async (token: string) => {
    set({ isLoadingSuppliers: true, suppliersError: null });
    
    try {
      const suppliers = await ExploreService.getSuppliers(token);
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
      const dataBundles = await ExploreService.getDataBundles({
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
      await ExploreService.airtimeRecharge({
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
      await ExploreService.dataRecharge({
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

  clearExploreData: () => {
    set({
      activities: [],
      isLoadingActivities: false,
      activitiesError: null,
      suppliers: [],
      dataBundles: [],
      isLoadingSuppliers: false,
      isLoadingDataBundles: false,
      isRecharging: false,
      suppliersError: null,
      dataBundlesError: null,
      rechargeError: null,
      selectedSupplier: null,
    });
  },
}));