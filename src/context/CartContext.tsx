import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/models/product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.inventory.quantity);
        const updatedItems = state.items.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
        return calculateTotals(updatedItems);
      } else {
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity: Math.min(quantity, product.inventory.quantity),
          addedAt: new Date(),
        };
        return calculateTotals([...state.items, newItem]);
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return calculateTotals(updatedItems);
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      
      if (!item) return state;
      
      if (quantity <= 0) {
        return calculateTotals(state.items.filter(item => item.id !== productId));
      }
      
      const validQuantity = Math.min(quantity, item.product.inventory.quantity);
      const updatedItems = state.items.map(item =>
        item.id === productId ? { ...item, quantity: validQuantity } : item
      );
      return calculateTotals(updatedItems);
    }
    
    case 'CLEAR_CART': {
      return { items: [], total: 0, itemCount: 0 };
    }
    
    case 'LOAD_CART': {
      return calculateTotals(action.payload);
    }
    
    default:
      return state;
  }
};

const calculateTotals = (items: CartItem[]): CartState => {
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return { items, total, itemCount };
};

const CART_STORAGE_KEY = 'blytz_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const itemsWithDates = parsedCart.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
            product: {
              ...item.product,
              createdAt: new Date(item.product.createdAt),
              updatedAt: new Date(item.product.updatedAt),
            }
          }));
          dispatch({ type: 'LOAD_CART', payload: itemsWithDates });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    
    saveCart();
  }, [state]);

  const addToCart = (product: Product, quantity: number) => {
    if (product.inventory.quantity <= 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }
    
    if (quantity > product.inventory.quantity) {
      Alert.alert('Insufficient Stock', `Only ${product.inventory.quantity} items available.`);
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = state.items.find(item => item.id === productId);
    if (item && quantity > item.product.inventory.quantity) {
      Alert.alert('Insufficient Stock', `Only ${item.product.inventory.quantity} items available.`);
      return;
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.id === productId);
  };

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.id === productId);
    return item?.quantity || 0;
  };

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};