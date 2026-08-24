import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalSavings: 0,
    shippingFee: 0,
    tax: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  // Helper to calculate cart totals locally
  const calculateLocalTotals = (cartItems) => {
    let subtotal = 0;
    let totalSavings = 0;

    cartItems.forEach((item) => {
      const price = Number(item.price) || 0;
      const effectivePrice = item.discount_price ? Number(item.discount_price) : price;
      const qty = Number(item.quantity) || 1;

      subtotal += effectivePrice * qty;
      if (item.discount_price) {
        totalSavings += (price - Number(item.discount_price)) * qty;
      }
    });

    const shippingFee = subtotal > 100 || cartItems.length === 0 ? 0 : 9.99;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + shippingFee + tax).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalSavings: Number(totalSavings.toFixed(2)),
      shippingFee: Number(shippingFee.toFixed(2)),
      tax,
      total
    };
  };

  // Fetch cart from server or load from local storage
  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await api.get('/cart');
        if (res.data.success) {
          setItems(res.data.items || []);
          setTotals(res.data.totals || calculateLocalTotals(res.data.items || []));
        }
      } catch (err) {
        console.error('[Cart Fetch Error]:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem('shopsphere_guest_cart');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setItems(parsed);
          setTotals(calculateLocalTotals(parsed));
        } catch (e) {
          setItems([]);
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = async (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (isAuthenticated) {
      try {
        const res = await api.post('/cart', { productId: product.id, quantity: qty });
        if (res.data.success) {
          setItems(res.data.items || []);
          setTotals(res.data.totals || calculateLocalTotals(res.data.items || []));
          return { success: true, message: `Added ${product.name} to cart!` };
        }
        return { success: false, message: res.data.message || 'Could not add to cart' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      // Guest cart
      const existingIndex = items.findIndex((i) => i.product_id === product.id || i.id === product.id);
      let updated;

      if (existingIndex > -1) {
        const newQty = items[existingIndex].quantity + qty;
        if (newQty > product.stock) {
          return {
            success: false,
            message: `Only ${product.stock} units available in stock.`
          };
        }
        updated = [...items];
        updated[existingIndex].quantity = newQty;
      } else {
        if (qty > product.stock) {
          return {
            success: false,
            message: `Only ${product.stock} units available in stock.`
          };
        }
        updated = [
          ...items,
          {
            id: `guest_${Date.now()}`,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            discount_price: product.discount_price,
            stock: product.stock,
            image_url: product.image_url,
            quantity: qty
          }
        ];
      }

      setItems(updated);
      setTotals(calculateLocalTotals(updated));
      localStorage.setItem('shopsphere_guest_cart', JSON.stringify(updated));
      return { success: true, message: `Added ${product.name} to cart!` };
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId, quantity, maxStock) => {
    const newQty = parseInt(quantity, 10);
    if (newQty <= 0) return removeFromCart(cartItemId);

    if (maxStock && newQty > maxStock) {
      return { success: false, message: `Maximum available stock is ${maxStock}` };
    }

    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/${cartItemId}`, { quantity: newQty });
        if (res.data.success) {
          setItems(res.data.items || []);
          setTotals(res.data.totals || calculateLocalTotals(res.data.items || []));
          return { success: true };
        }
        return { success: false, message: res.data.message };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      const updated = items.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item));
      setItems(updated);
      setTotals(calculateLocalTotals(updated));
      localStorage.setItem('shopsphere_guest_cart', JSON.stringify(updated));
      return { success: true };
    }
  };

  // Remove single item
  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/${cartItemId}`);
        if (res.data.success) {
          setItems(res.data.items || []);
          setTotals(res.data.totals || calculateLocalTotals(res.data.items || []));
          return { success: true, message: 'Item removed from cart' };
        }
        return { success: false, message: res.data.message };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      const updated = items.filter((item) => item.id !== cartItemId);
      setItems(updated);
      setTotals(calculateLocalTotals(updated));
      localStorage.setItem('shopsphere_guest_cart', JSON.stringify(updated));
      return { success: true, message: 'Item removed from cart' };
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (e) {
        console.error(e);
      }
    }
    setItems([]);
    setTotals({ subtotal: 0, totalSavings: 0, shippingFee: 0, tax: 0, total: 0 });
    localStorage.removeItem('shopsphere_guest_cart');
    return { success: true, message: 'Cart cleared' };
  };

  const itemCount = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);

  const value = {
    items,
    totals,
    itemCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
