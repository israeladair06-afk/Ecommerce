import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartState } from '../../tipos';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  total: 0,
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item: CartItem) => item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = calculateTotal(state.items);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item: CartItem) => item.productId !== action.payload
      );
      state.total = calculateTotal(state.items);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item: CartItem) => item.productId === action.payload.productId
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      state.total = calculateTotal(state.items);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      localStorage.removeItem('cart');
    },
    syncCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.total = calculateTotal(state.items);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, syncCart } =
  cartSlice.actions;
export default cartSlice.reducer;