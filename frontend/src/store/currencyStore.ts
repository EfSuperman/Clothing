import { create } from 'zustand';
import axios from 'axios';

interface CurrencyState {
  currency: string;      // e.g., 'PKR', 'USD', 'EUR'
  symbol: string;        // e.g., 'Rs.', '$', '€'
  rate: number;          // Rate from PKR to current currency
  loading: boolean;
  
  setCurrency: (currency: string) => void;
  fetchRate: (currency: string) => Promise<void>;
  detectAndSetCurrency: () => Promise<void>;
  convert: (amountInPKR: number) => string;
}

const currencySymbols: Record<string, string> = {
  PKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'DH',
  SAR: 'SR'
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'PKR',
  symbol: 'Rs.',
  rate: 1,
  loading: true,

  setCurrency: (currency: string) => {
    const symbol = currencySymbols[currency] || currency;
    set({ currency, symbol });
    get().fetchRate(currency);
  },

  fetchRate: async (targetCurrency: string) => {
    if (targetCurrency === 'PKR') {
      set({ rate: 1, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const { data } = await axios.get(`https://open.er-api.com/v6/latest/PKR`);
      const newRate = data.rates[targetCurrency] || 1;
      set({ rate: newRate, loading: false });
    } catch (error) {
      console.error('Failed to fetch exchange rate', error);
      set({ loading: false });
    }
  },

  detectAndSetCurrency: async () => {
    try {
      // Try to detect currency via IP - handle 403 or other failures gracefully
      const response = await axios.get('https://ip-api.com/json').catch(() => null);
      
      if (!response || !response.data) {
        console.warn('IP-API blocked or failed, defaulting to PKR');
        get().setCurrency('PKR');
        return;
      }

      const detectedCurrency = response.data.currency || 'PKR';
      const supportedCurrencies = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];
      const finalCurrency = supportedCurrencies.includes(detectedCurrency) ? detectedCurrency : 'USD';
      
      get().setCurrency(finalCurrency);
    } catch (error) {
      console.warn('Currency detection exception, defaulting to PKR');
      get().setCurrency('PKR');
    }
  },

  convert: (amountInPKR: number) => {
    const { rate, symbol } = get();
    const converted = amountInPKR * rate;
    
    // Format based on currency
    if (get().currency === 'PKR') {
      return `${symbol} ${Math.round(converted).toLocaleString()}`;
    }
    
    return `${symbol}${converted.toFixed(2)}`;
  }
}));
