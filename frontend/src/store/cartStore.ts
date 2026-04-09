import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
  customDesignUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, customDesignUrl?: string) => void;
  updateQuantity: (productId: string, customDesignUrl: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find((item) => 
          item.productId === newItem.productId && 
          item.customDesignUrl === newItem.customDesignUrl
        );
        if (existingItem) {
          set({
            items: items.map((item) =>
              (item.productId === newItem.productId && item.customDesignUrl === newItem.customDesignUrl)
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      removeItem: (productId, customDesignUrl) => {
        set({ 
          items: get().items.filter((item) => 
            !(item.productId === productId && item.customDesignUrl === customDesignUrl)
          ) 
        });
      },
      updateQuantity: (productId, customDesignUrl, quantity) => {
        set({
          items: get().items.map((item) =>
            (item.productId === productId && item.customDesignUrl === customDesignUrl) 
              ? { ...item, quantity } 
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          return total + (price * qty);
        }, 0);
      },
    }),
    {
      name: 'clothing-cart-storage',
    }
  )
);
