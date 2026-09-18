import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    delivery_fee: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch active cart from backend
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data || { items: [], subtotal: 0, delivery_fee: 0, total: 0 });
    } catch {
      // If error or unauthenticated, maintain empty/local state
      setCart((prev) => prev || { items: [], subtotal: 0, delivery_fee: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Synchronize cart on auth change
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, refreshCart]);

  const addItem = async (itemData) => {
    try {
      const updated = await cartService.addItem(itemData);
      setCart(updated);
      success("Garment added to your cart!");
      return updated;
    } catch (err) {
      toastError(err.message || "Failed to add item to cart.");
      throw err;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const updated = await cartService.updateItemQuantity(itemId, quantity);
      setCart(updated);
      return updated;
    } catch (err) {
      toastError(err.message || "Failed to update quantity.");
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
      success("Item removed from cart.");
      return updated;
    } catch (err) {
      toastError(err.message || "Failed to remove item.");
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [], subtotal: 0, delivery_fee: 0, total: 0 });
    } catch {
      setCart({ items: [], subtotal: 0, delivery_fee: 0, total: 0 });
    }
  };

  const cartCount = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const value = {
    cart,
    cartCount,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
