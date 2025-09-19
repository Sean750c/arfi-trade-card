import { create } from 'zustand';
import { Supplier, DataBundle, RechargeLogEntry, MerchantEntry, MerchantServiceEntry, MerchantAccountEntry, ServiceType } from '@/types/utilities';
import { UtilitiesService } from '@/services/utilities';

interface UtilitiesState {
  // Recharge data
  suppliers: Supplier[];
  dataBundles: DataBundle[];
  
  // New services data
  merchants: Record<ServiceType, MerchantEntry[]>;
  merchantServices: Record<string, MerchantServiceEntry[]>; // key: merchant_id
  accountDetails: Record<string, MerchantAccountEntry>; // key: merchant_id_customer_no_product_code
  
  isLoadingSuppliers: boolean;
  isLoadingDataBundles: boolean;
  isLoadingMerchants: boolean;
  isLoadingServices: boolean;
  isLoadingAccountDetails: boolean;
  isRecharging: boolean;
  isProcessingPayment: boolean;
  
  suppliersError: string | null;
  dataBundlesError: string | null;
  merchantsError: string | null;
  servicesError: string | null;
  accountDetailsError: string | null;
  rechargeError: string | null;
  paymentError: string | null;
  
  // Selected states
  selectedSupplier: Supplier | null;
  selectedMerchant: Record<ServiceType, MerchantEntry | null>;
  selectedService: Record<string, MerchantServiceEntry | null>; // key: merchant_id

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
  fetchMerchants: (token: string, serviceType: ServiceType) => Promise<void>;
  fetchMerchantServices: (token: string, merchantId: string) => Promise<void>;
  fetchAccountDetails: (token: string, merchantId: string, customerNo: string, productCode: string) => Promise<void>;
  airtimeRecharge: (token: string, name: string, phone: string, amount: number, password: string) => Promise<void>;
  dataRecharge: (token: string, name: string, phone: string, amount: number, serviceId: number, serviceName: string, password: string) => Promise<void>;
  merchantPayment: (token: string, merchantId: string, merchantName: string, customerNo: string, productCode: string, amount: number, type: number, password: string) => Promise<void>;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  setSelectedMerchant: (serviceType: ServiceType, merchant: MerchantEntry | null) => void;
  setSelectedService: (merchantId: string, service: MerchantServiceEntry | null) => void;
  fetchRechargeLogs: (token: string, type: string, refresh?: boolean) => Promise<void>;
  loadMoreRechargeLogs: (token: string, type: string) => Promise<void>;
  clearUtilitiesData: () => void;
}

export const useUtilitiesStore = create<UtilitiesState>((set, get) => ({
  // Initial state
  suppliers: [],
  dataBundles: [],
  merchants: {
    [ServiceType.AIRTIME]: [],
    [ServiceType.DATA]: [],
    [ServiceType.CABLE_TV]: [],
    [ServiceType.ELECTRICITY]: [],
    [ServiceType.INTERNET]: [],
    [ServiceType.LOTTERY]: [],
  },
  merchantServices: {},
  accountDetails: {},
  isLoadingSuppliers: false,
  isLoadingDataBundles: false,
  isLoadingMerchants: false,
  isLoadingServices: false,
  isLoadingAccountDetails: false,
  isRecharging: false,
  isProcessingPayment: false,
  suppliersError: null,
  dataBundlesError: null,
  merchantsError: null,
  servicesError: null,
  accountDetailsError: null,
  rechargeError: null,
  paymentError: null,
  selectedSupplier: null,
  selectedMerchant: {
    [ServiceType.AIRTIME]: null,
    [ServiceType.DATA]: null,
    [ServiceType.CABLE_TV]: null,
    [ServiceType.ELECTRICITY]: null,
    [ServiceType.INTERNET]: null,
    [ServiceType.LOTTERY]: null,
  },
  selectedService: {},
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

  fetchMerchants: async (token: string, serviceType: ServiceType) => {
    set({ isLoadingMerchants: true, merchantsError: null });
    
    try {
      const merchants = await UtilitiesService.getMerchants(token, serviceType);
      set(state => ({ 
        merchants: {
          ...state.merchants,
          [serviceType]: merchants,
        },
        isLoadingMerchants: false 
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingMerchants: false });
        return;
      }
      
      set({
        merchantsError: error instanceof Error ? error.message : 'Failed to fetch merchants',
        isLoadingMerchants: false,
      });
    }
  },

  fetchMerchantServices: async (token: string, merchantId: string) => {
    set({ isLoadingServices: true, servicesError: null });
    
    try {
      const services = await UtilitiesService.getMerchantServices(token, merchantId);
      set(state => ({ 
        merchantServices: {
          ...state.merchantServices,
          [merchantId]: services,
        },
        isLoadingServices: false 
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingServices: false });
        return;
      }
      
      set({
        servicesError: error instanceof Error ? error.message : 'Failed to fetch merchant services',
        isLoadingServices: false,
      });
    }
  },

  fetchAccountDetails: async (token: string, merchantId: string, customerNo: string, productCode: string) => {
    set({ isLoadingAccountDetails: true, accountDetailsError: null });
    
    try {
      const details = await UtilitiesService.getMerchantAccountDetails(token, merchantId, customerNo, productCode);
      const key = `${merchantId}_${customerNo}_${productCode}`;
      set(state => ({ 
        accountDetails: {
          ...state.accountDetails,
          [key]: details,
        },
        isLoadingAccountDetails: false 
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isLoadingAccountDetails: false });
        return;
      }
      
      set({
        accountDetailsError: error instanceof Error ? error.message : 'Failed to fetch account details',
        isLoadingAccountDetails: false,
      });
    }
  },

  airtimeRecharge: async (token: string, name: string, phone: string, amount: number, password: string) => {
    set({ isRecharging: true, rechargeError: null });
    
    try {
      await UtilitiesService.airtimeRecharge({
        token,
        name,
        phone,
        amount,
        password,
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

  dataRecharge: async (token: string, name: string, phone: string, amount: number, service_id: number, service_name: string, password: string) => {
    set({ isRecharging: true, rechargeError: null });
    
    try {
      await UtilitiesService.dataRecharge({
        token,
        name,
        phone,
        amount,
        service_id,
        service_name,
        password,
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

  merchantPayment: async (token: string, merchantId: string, merchantName: string, customerNo: string, productCode: string, amount: number, type: number, password: string) => {
    set({ isProcessingPayment: true, paymentError: null });
    
    try {
      await UtilitiesService.merchantPayment({
        token,
        merchant_id: merchantId,
        merchant_name: merchantName,
        customer_no: customerNo,
        product_code: productCode,
        amount,
        type,
        password,
      });
      
      set({ isProcessingPayment: false });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        set({ isProcessingPayment: false });
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      set({
        paymentError: errorMessage,
        isProcessingPayment: false,
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

  setSelectedMerchant: (serviceType: ServiceType, merchant: MerchantEntry | null) => {
    set(state => ({ 
      selectedMerchant: {
        ...state.selectedMerchant,
        [serviceType]: merchant,
      },
      // Clear related data when merchant changes
      merchantServices: merchant ? state.merchantServices : {},
      accountDetails: merchant ? state.accountDetails : {},
    }));
  },

  setSelectedService: (merchantId: string, service: MerchantServiceEntry | null) => {
    set(state => ({ 
      selectedService: {
        ...state.selectedService,
        [merchantId]: service,
      },
    }));
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
      merchants: {
        [ServiceType.AIRTIME]: [],
        [ServiceType.DATA]: [],
        [ServiceType.CABLE_TV]: [],
        [ServiceType.ELECTRICITY]: [],
        [ServiceType.INTERNET]: [],
        [ServiceType.LOTTERY]: [],
      },
      merchantServices: {},
      accountDetails: {},
      isLoadingSuppliers: false,
      isLoadingDataBundles: false,
      isLoadingMerchants: false,
      isLoadingServices: false,
      isLoadingAccountDetails: false,
      isRecharging: false,
      isProcessingPayment: false,
      suppliersError: null,
      dataBundlesError: null,
      merchantsError: null,
      servicesError: null,
      accountDetailsError: null,
      rechargeError: null,
      paymentError: null,
      selectedSupplier: null,
      selectedMerchant: {
        [ServiceType.AIRTIME]: null,
        [ServiceType.DATA]: null,
        [ServiceType.CABLE_TV]: null,
        [ServiceType.ELECTRICITY]: null,
        [ServiceType.INTERNET]: null,
        [ServiceType.LOTTERY]: null,
      },
      selectedService: {},
      rechargeLogs: [],
      currentRechargeLogsPage: 0,
      hasMoreRechargeLogs: true,
      isLoadingRechargeLogs: false,
      isLoadingMoreRechargeLogs: false,
      rechargeLogsError: null,
    });
  },
}));