import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { refreshCart, addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await api.get('/wishlist');
        if (res.data.success) {
          setItems(res.data.items || []);
        }
      } catch (err) {
        console.error('[Wishlist Error]:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem('shopsphere_guest_wishlist');
      if (local) {
        try {
          setItems(JSON.parse(local));
        } catch (e) {
          setItems([]);
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return items.some((item) => (item.product_id === productId || item.id === productId));
  };

  const toggleWishlist = async (product) => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/wishlist/toggle', { productId: product.id });
        if (res.data.success) {
          await fetchWishlist();
          return {
            success: true,
            inWishlist: res.data.inWishlist,
            message: res.data.message
          };
        }
        return { success: false, message: res.data.message };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      const exists = isInWishlist(product.id);
      let updated;
      if (exists) {
        updated = items.filter((i) => (i.product_id !== product.id && i.id !== product.id));
      } else {
        updated = [
          ...items,
          {
            id: `guest_wish_${Date.now()}`,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            discount_price: product.discount_price,
            stock: product.stock,
            rating: product.rating,
            image_url: product.image_url
          }
        ];
      }
      setItems(updated);
      localStorage.setItem('shopsphere_guest_wishlist', JSON.stringify(updated));
      return {
        success: true,
        inWishlist: !exists,
        message: !exists ? 'Added to wishlist' : 'Removed from wishlist'
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/wishlist/${productId}`);
        if (res.data.success) {
          setItems(items.filter((i) => (i.product_id !== productId && i.id !== productId)));
          return { success: true, message: 'Removed from wishlist' };
        }
        return { success: false, message: res.data.message };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      const updated = items.filter((i) => (i.product_id !== productId && i.id !== productId));
      setItems(updated);
      localStorage.setItem('shopsphere_guest_wishlist', JSON.stringify(updated));
      return { success: true, message: 'Removed from wishlist' };
    }
  };

  const moveToCart = async (product) => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/wishlist/move-to-cart', { productId: product.product_id || product.id });
        if (res.data.success) {
          await fetchWishlist();
          await refreshCart();
          return { success: true, message: 'Moved to cart successfully' };
        }
        return { success: false, message: res.data.message };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      // Local move
      await addToCart(product, 1);
      await removeFromWishlist(product.product_id || product.id);
      return { success: true, message: 'Moved to cart' };
    }
  };

  const value = {
    items,
    itemCount: items.length,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    moveToCart,
    refreshWishlist: fetchWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
