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
      // Try to detect currency via IP
      const { data } = await axios.get('https://ip-api.com/json');
      const detectedCurrency = data.currency || 'PKR';
      
      // Some countries might have currencies we don't handle well, fallback to USD if not PKR or known
      const supportedCurrencies = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];
      const finalCurrency = supportedCurrencies.includes(detectedCurrency) ? detectedCurrency : 'USD';
      
      get().setCurrency(finalCurrency);
    } catch (error) {
      console.error('IP Detection failed, defaulting to PKR', error);
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
