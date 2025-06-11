import { create } from 'zustand';
import type { ExchangeRatesData } from '@/types/exchange';

interface ExchangeRatesState {
  exchangeData: ExchangeRatesData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdateTime: number;
  
  // Actions
  fetchExchangeRates: (countryId: number, refresh?: boolean) => Promise<void>;
  reset: () => void;
}

// Mock data generator for demonstration
const generateMockExchangeData = (countryId: number): ExchangeRatesData => {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  ];

  const metrics = [
    {
      id: 1,
      name: 'Major Currency Pairs',
      description: 'Primary international currency exchange rates',
      rates: currencies.map(currency => ({
        currency_code: currency.code,
        currency_name: currency.name,
        symbol: currency.symbol,
        current_rate: Math.random() * 1000 + 100,
        change_24h: (Math.random() - 0.5) * 10,
        high_24h: Math.random() * 1100 + 150,
        low_24h: Math.random() * 900 + 50,
        volume_24h: Math.random() * 1000000 + 100000,
      })),
    },
    {
      id: 2,
      name: 'Cryptocurrency Exchange',
      description: 'Digital currency conversion rates',
      rates: [
        {
          currency_code: 'BTC',
          currency_name: 'Bitcoin',
          symbol: '₿',
          current_rate: Math.random() * 50000 + 30000,
          change_24h: (Math.random() - 0.5) * 15,
          high_24h: Math.random() * 55000 + 35000,
          low_24h: Math.random() * 45000 + 25000,
          volume_24h: Math.random() * 10000000 + 1000000,
        },
        {
          currency_code: 'ETH',
          currency_name: 'Ethereum',
          symbol: 'Ξ',
          current_rate: Math.random() * 3000 + 1500,
          change_24h: (Math.random() - 0.5) * 12,
          high_24h: Math.random() * 3500 + 2000,
          low_24h: Math.random() * 2500 + 1000,
          volume_24h: Math.random() * 5000000 + 500000,
        },
        {
          currency_code: 'USDT',
          currency_name: 'Tether',
          symbol: '₮',
          current_rate: 1.0 + (Math.random() - 0.5) * 0.02,
          change_24h: (Math.random() - 0.5) * 0.5,
          high_24h: 1.01,
          low_24h: 0.99,
          volume_24h: Math.random() * 20000000 + 10000000,
        },
      ],
    },
    {
      id: 3,
      name: 'Commodity Prices',
      description: 'Precious metals and commodity exchange rates',
      rates: [
        {
          currency_code: 'GOLD',
          currency_name: 'Gold (per oz)',
          symbol: 'Au$',
          current_rate: Math.random() * 200 + 1800,
          change_24h: (Math.random() - 0.5) * 5,
          high_24h: Math.random() * 220 + 1850,
          low_24h: Math.random() * 180 + 1750,
          volume_24h: Math.random() * 100000 + 50000,
        },
        {
          currency_code: 'SILVER',
          currency_name: 'Silver (per oz)',
          symbol: 'Ag$',
          current_rate: Math.random() * 5 + 20,
          change_24h: (Math.random() - 0.5) * 8,
          high_24h: Math.random() * 6 + 22,
          low_24h: Math.random() * 4 + 18,
          volume_24h: Math.random() * 200000 + 100000,
        },
        {
          currency_code: 'OIL',
          currency_name: 'Crude Oil (per barrel)',
          symbol: 'Oil$',
          current_rate: Math.random() * 20 + 70,
          change_24h: (Math.random() - 0.5) * 6,
          high_24h: Math.random() * 25 + 75,
          low_24h: Math.random() * 15 + 65,
          volume_24h: Math.random() * 500000 + 200000,
        },
      ],
    },
    {
      id: 4,
      name: 'Regional Exchange Rates',
      description: 'Local and regional currency conversion rates',
      rates: [
        {
          currency_code: 'NGN',
          currency_name: 'Nigerian Naira',
          symbol: '₦',
          current_rate: Math.random() * 50 + 750,
          change_24h: (Math.random() - 0.5) * 3,
          high_24h: Math.random() * 60 + 780,
          low_24h: Math.random() * 40 + 720,
          volume_24h: Math.random() * 2000000 + 1000000,
        },
        {
          currency_code: 'GHS',
          currency_name: 'Ghanaian Cedi',
          symbol: '₵',
          current_rate: Math.random() * 2 + 11,
          change_24h: (Math.random() - 0.5) * 4,
          high_24h: Math.random() * 3 + 12,
          low_24h: Math.random() * 1 + 10,
          volume_24h: Math.random() * 800000 + 400000,
        },
        {
          currency_code: 'KES',
          currency_name: 'Kenyan Shilling',
          symbol: 'KSh',
          current_rate: Math.random() * 20 + 130,
          change_24h: (Math.random() - 0.5) * 2,
          high_24h: Math.random() * 25 + 135,
          low_24h: Math.random() * 15 + 125,
          volume_24h: Math.random() * 1500000 + 750000,
        },
      ],
    },
  ];

  return {
    currencies,
    metrics,
    last_updated: Date.now(),
    country_id: countryId,
  };
};

export const useExchangeRatesStore = create<ExchangeRatesState>((set, get) => ({
  exchangeData: null,
  isLoading: false,
  error: null,
  lastUpdateTime: 0,

  fetchExchangeRates: async (countryId: number, refresh = false) => {
    const state = get();
    
    // Avoid repeated calls unless refresh is explicitly requested
    if (!refresh && state.exchangeData && Date.now() - state.lastUpdateTime < 30000) {
      console.log('Using cached exchange rates data');
      return;
    }

    console.log('Fetching exchange rates data, refresh:', refresh, 'countryId:', countryId);
    
    set({ isLoading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data (in real app, this would be an API call)
      const exchangeData = generateMockExchangeData(countryId);
      
      set({
        exchangeData,
        isLoading: false,
        lastUpdateTime: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching exchange rates data:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch exchange rates',
        isLoading: false,
      });
    }
  },

  reset: () => {
    set({
      exchangeData: null,
      isLoading: false,
      error: null,
      lastUpdateTime: 0,
    });
  },
}));