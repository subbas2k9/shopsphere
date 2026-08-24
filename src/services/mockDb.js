import { initialStoreData } from '../data/initialData';

const DB_KEY = 'shopsphere_db_v1';
const CURRENT_USER_KEY = 'shopsphere_current_user';
const TOKEN_KEY = 'shopsphere_token';

// Helper: Deep Clone
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Initialize Database
export const getDb = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = clone(initialStoreData);
      localStorage.setItem(DB_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading DB from localStorage:', err);
    return clone(initialStoreData);
  }
};

export const saveDb = (db) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving DB to localStorage:', err);
  }
};

export const resetDb = () => {
  const initial = clone(initialStoreData);
  localStorage.setItem(DB_KEY, JSON.stringify(initial));
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('shopsphere_guest_cart');
  localStorage.removeItem('shopsphere_guest_wishlist');
  return initial;
};

// Helper: Get Current User from Token
export const getCurrentUser = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const db = getDb();
  
  // Simulated token format: "demo_token_USERID_TIMESTAMP"
  const parts = token.split('_');
  if (parts.length >= 3) {
    const userId = parseInt(parts[2], 10);
    return db.users.find((u) => u.id === userId) || null;
  }
  
  // Fallback to cached user
  const cached = localStorage.getItem(CURRENT_USER_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return db.users.find((u) => u.id === parsed.id) || parsed;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// -------------------------------------------------------------
// AUTH OPERATIONS
// -------------------------------------------------------------
export const mockAuth = {
  login: (email, password) => {
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Demo convenience: If user doesn't exist, create customer
      if (email && email.includes('@')) {
        const newUser = {
          id: db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
          name: email.split('@')[0],
          email: email.toLowerCase(),
          phone: '+1 (555) 000-0000',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
          address: '123 Innovation Way',
          city: 'San Francisco',
          state: 'CA',
          pincode: '94107',
          created_at: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDb(db);
        const token = `demo_token_${newUser.id}_${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        return { success: true, token, user: newUser };
      }
      throw new Error('Invalid email or password');
    }

    const token = `demo_token_${user.id}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, token, user };
  },

  register: (userData) => {
    const db = getDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === userData.email?.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const newUser = {
      id: db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
      name: userData.name || 'New User',
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      role: userData.role || (userData.email.toLowerCase().includes('admin') ? 'admin' : 'user'),
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      pincode: userData.pincode || '',
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    const token = `demo_token_${newUser.id}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true, token, user: newUser };
  },

  getProfile: () => {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return { success: true, user };
  },

  updateProfile: (profileData) => {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const db = getDb();
    const idx = db.users.findIndex((u) => u.id === user.id);
    if (idx === -1) throw new Error('User not found');

    db.users[idx] = {
      ...db.users[idx],
      ...profileData,
      id: user.id,
      email: user.email,
      role: user.role
    };

    saveDb(db);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(db.users[idx]));
    return { success: true, user: db.users[idx] };
  },

  changePassword: (passwords) => {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return { success: true, message: 'Password updated successfully' };
  }
};

// -------------------------------------------------------------
// CATEGORIES OPERATIONS
// -------------------------------------------------------------
export const mockCategories = {
  getAll: () => {
    const db = getDb();
    // Add product counts to each category
    const categoriesWithCount = db.categories.map((cat) => {
      const product_count = db.products.filter((p) => Number(p.category_id) === Number(cat.id)).length;
      return { ...cat, product_count };
    });
    return { success: true, categories: categoriesWithCount };
  },

  create: (catData) => {
    const db = getDb();
    const newId = db.categories.length ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1;
    const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      id: newId,
      name: catData.name,
      slug: slug || `category-${newId}`,
      description: catData.description || '',
      image_url: catData.image_url || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };
    db.categories.push(newCat);
    saveDb(db);
    return { success: true, category: newCat };
  },

  update: (id, catData) => {
    const db = getDb();
    const numId = parseInt(id, 10);
    const idx = db.categories.findIndex((c) => c.id === numId);
    if (idx === -1) throw new Error('Category not found');

    const slug = catData.name ? catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : db.categories[idx].slug;
    db.categories[idx] = {
      ...db.categories[idx],
      ...catData,
      id: numId,
      slug
    };
    saveDb(db);
    return { success: true, category: db.categories[idx] };
  },

  delete: (id) => {
    const db = getDb();
    const numId = parseInt(id, 10);
    db.categories = db.categories.filter((c) => c.id !== numId);
    saveDb(db);
    return { success: true, message: 'Category deleted successfully' };
  }
};

// -------------------------------------------------------------
// PRODUCTS OPERATIONS
// -------------------------------------------------------------
export const mockProducts = {
  getAll: (query = {}) => {
    const db = getDb();
    let prods = [...db.products];

    // Join category names
    prods = prods.map((p) => {
      const cat = db.categories.find((c) => Number(c.id) === Number(p.category_id));
      return {
        ...p,
        category_name: cat ? cat.name : 'General',
        category_slug: cat ? cat.slug : 'general'
      };
    });

    // 1. Search filter
    if (query.search) {
      const term = query.search.toLowerCase().trim();
      prods = prods.filter((p) =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category_name?.toLowerCase().includes(term)
      );
    }

    // 2. Category filter
    if (query.category && query.category !== 'all') {
      const catVal = query.category.toString().toLowerCase();
      prods = prods.filter((p) => {
        const cat = db.categories.find((c) => Number(c.id) === Number(p.category_id));
        return (
          p.category_id.toString() === catVal ||
          cat?.slug.toLowerCase() === catVal ||
          cat?.name.toLowerCase() === catVal
        );
      });
    }

    // 3. Price Filters
    if (query.minPrice) {
      const min = parseFloat(query.minPrice);
      if (!isNaN(min)) {
        prods = prods.filter((p) => (p.discount_price !== null && p.discount_price !== undefined ? p.discount_price : p.price) >= min);
      }
    }
    if (query.maxPrice) {
      const max = parseFloat(query.maxPrice);
      if (!isNaN(max)) {
        prods = prods.filter((p) => (p.discount_price !== null && p.discount_price !== undefined ? p.discount_price : p.price) <= max);
      }
    }

    // 4. Rating filter
    if (query.rating) {
      const minRating = parseFloat(query.rating);
      if (!isNaN(minRating)) {
        prods = prods.filter((p) => (p.rating || 0) >= minRating);
      }
    }

    // 5. In Stock filter
    if (query.inStock === 'true' || query.inStock === true) {
      prods = prods.filter((p) => (p.stock || 0) > 0);
    }

    // 6. Sorting
    const sort = query.sort || 'newest';
    switch (sort) {
      case 'price-low':
        prods.sort((a, b) => {
          const priceA = a.discount_price !== null && a.discount_price !== undefined ? a.discount_price : a.price;
          const priceB = b.discount_price !== null && b.discount_price !== undefined ? b.discount_price : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        prods.sort((a, b) => {
          const priceA = a.discount_price !== null && a.discount_price !== undefined ? a.discount_price : a.price;
          const priceB = b.discount_price !== null && b.discount_price !== undefined ? b.discount_price : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        prods.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
        prods.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'newest':
      default:
        prods.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    const total = prods.length;
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || (query.limit === '100' ? 100 : 12);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = prods.slice(startIndex, startIndex + limit);

    return {
      success: true,
      products: paginatedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages
      },
      featuredProducts: prods.filter((p) => p.is_featured).slice(0, 8),
      trendingProducts: prods.filter((p) => p.is_trending).slice(0, 8)
    };
  },

  getByIdOrSlug: (idOrSlug) => {
    const db = getDb();
    const isNumeric = /^\d+$/.test(idOrSlug);
    const prod = isNumeric
      ? db.products.find((p) => p.id === parseInt(idOrSlug, 10))
      : db.products.find((p) => p.slug === idOrSlug || p.id.toString() === idOrSlug);

    if (!prod) {
      throw new Error('Product not found');
    }

    const cat = db.categories.find((c) => Number(c.id) === Number(prod.category_id));
    const gallery = db.product_images?.filter((img) => Number(img.product_id) === Number(prod.id)).map((img) => img.image_url) || [];
    const images = gallery.length > 0 ? [prod.image_url, ...gallery.filter((g) => g !== prod.image_url)] : [prod.image_url];
    const reviews = db.reviews?.filter((r) => Number(r.product_id) === Number(prod.id)) || [];

    // Related products in same category
    const relatedProducts = db.products
      .filter((p) => Number(p.category_id) === Number(prod.category_id) && p.id !== prod.id)
      .slice(0, 4);

    return {
      success: true,
      product: {
        ...prod,
        category_name: cat ? cat.name : 'General',
        category_slug: cat ? cat.slug : 'general',
        images,
        reviews,
        relatedProducts
      }
    };
  },

  create: (data) => {
    const db = getDb();
    const newId = db.products.length ? Math.max(...db.products.map((p) => p.id)) + 1 : 1;
    const slug = (data.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${newId}`;

    const newProduct = {
      id: newId,
      name: data.name,
      slug,
      description: data.description || '',
      price: parseFloat(data.price) || 0,
      discount_price: data.discount_price ? parseFloat(data.discount_price) : null,
      category_id: parseInt(data.category_id, 10) || 1,
      stock: parseInt(data.stock, 10) || 0,
      rating: 5.0,
      num_reviews: 0,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      is_featured: data.is_featured ? 1 : 0,
      is_trending: data.is_trending ? 1 : 0,
      created_at: new Date().toISOString()
    };

    db.products.unshift(newProduct);

    if (data.galleryUrls) {
      const urls = Array.isArray(data.galleryUrls)
        ? data.galleryUrls
        : data.galleryUrls.split('\n').map((u) => u.trim()).filter(Boolean);
      
      urls.forEach((url) => {
        const imgId = db.product_images.length ? Math.max(...db.product_images.map((i) => i.id)) + 1 : 1;
        db.product_images.push({ id: imgId, product_id: newId, image_url: url });
      });
    }

    saveDb(db);
    return { success: true, product: newProduct };
  },

  update: (id, data) => {
    const db = getDb();
    const numId = parseInt(id, 10);
    const idx = db.products.findIndex((p) => p.id === numId);
    if (idx === -1) throw new Error('Product not found');

    db.products[idx] = {
      ...db.products[idx],
      ...data,
      id: numId,
      price: data.price !== undefined ? parseFloat(data.price) : db.products[idx].price,
      discount_price: data.discount_price !== undefined ? (data.discount_price ? parseFloat(data.discount_price) : null) : db.products[idx].discount_price,
      category_id: data.category_id !== undefined ? parseInt(data.category_id, 10) : db.products[idx].category_id,
      stock: data.stock !== undefined ? parseInt(data.stock, 10) : db.products[idx].stock,
      is_featured: data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : db.products[idx].is_featured,
      is_trending: data.is_trending !== undefined ? (data.is_trending ? 1 : 0) : db.products[idx].is_trending
    };

    if (data.galleryUrls) {
      const urls = Array.isArray(data.galleryUrls)
        ? data.galleryUrls
        : data.galleryUrls.split('\n').map((u) => u.trim()).filter(Boolean);

      db.product_images = db.product_images.filter((img) => Number(img.product_id) !== numId);
      urls.forEach((url) => {
        const imgId = db.product_images.length ? Math.max(...db.product_images.map((i) => i.id)) + 1 : 1;
        db.product_images.push({ id: imgId, product_id: numId, image_url: url });
      });
    }

    saveDb(db);
    return { success: true, product: db.products[idx] };
  },

  delete: (id) => {
    const db = getDb();
    const numId = parseInt(id, 10);
    db.products = db.products.filter((p) => p.id !== numId);
    db.product_images = db.product_images.filter((i) => Number(i.product_id) !== numId);
    db.reviews = db.reviews.filter((r) => Number(r.product_id) !== numId);
    saveDb(db);
    return { success: true, message: 'Product deleted successfully' };
  },

  addReview: (productId, reviewData) => {
    const user = getCurrentUser();
    if (!user) throw new Error('You must be signed in to submit a review');

    const db = getDb();
    const numProdId = parseInt(productId, 10);
    const prod = db.products.find((p) => p.id === numProdId);
    if (!prod) throw new Error('Product not found');

    const newReview = {
      id: db.reviews.length ? Math.max(...db.reviews.map((r) => r.id)) + 1 : 1,
      user_id: user.id,
      product_id: numProdId,
      user_name: user.name || 'Verified Buyer',
      rating: parseInt(reviewData.rating, 10) || 5,
      comment: reviewData.comment || '',
      created_at: new Date().toISOString()
    };

    db.reviews.push(newReview);

    // Recalculate product rating
    const prodReviews = db.reviews.filter((r) => Number(r.product_id) === numProdId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    prod.rating = parseFloat(avg.toFixed(1));
    prod.num_reviews = prodReviews.length;

    saveDb(db);
    return { success: true, review: newReview, message: 'Review added successfully' };
  }
};

// -------------------------------------------------------------
// CART OPERATIONS
// -------------------------------------------------------------
const calculateTotals = (items) => {
  const subtotal = items.reduce((acc, item) => {
    const p = item.discount_price !== null && item.discount_price !== undefined ? Number(item.discount_price) : Number(item.price);
    return acc + p * (Number(item.quantity) || 1);
  }, 0);

  const regularSubtotal = items.reduce((acc, item) => {
    return acc + Number(item.price) * (Number(item.quantity) || 1);
  }, 0);

  const totalSavings = regularSubtotal - subtotal;
  const shippingFee = subtotal > 0 && subtotal < 99 ? 15 : 0;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shippingFee + tax;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalSavings: parseFloat(totalSavings.toFixed(2)),
    shippingFee: parseFloat(shippingFee.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

export const mockCart = {
  getCart: () => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';

    const userCart = db.cart.filter((c) => c.user_id === userId);
    const items = userCart.map((c) => {
      const prod = db.products.find((p) => p.id === Number(c.product_id)) || {};
      return {
        id: c.id,
        user_id: c.user_id,
        product_id: c.product_id,
        name: prod.name || 'Product',
        slug: prod.slug || '',
        price: prod.price || 0,
        discount_price: prod.discount_price,
        stock: prod.stock || 0,
        image_url: prod.image_url || '',
        quantity: c.quantity || 1
      };
    });

    return {
      success: true,
      items,
      totals: calculateTotals(items)
    };
  },

  addItem: (productId, quantity = 1) => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';
    const numProdId = parseInt(productId, 10);
    const prod = db.products.find((p) => p.id === numProdId);
    if (!prod) throw new Error('Product not found');

    const existing = db.cart.find((c) => c.user_id === userId && Number(c.product_id) === numProdId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, prod.stock || 999);
    } else {
      const newId = db.cart.length ? Math.max(...db.cart.map((c) => (typeof c.id === 'number' ? c.id : 0))) + 1 : 1;
      db.cart.push({
        id: newId,
        user_id: userId,
        product_id: numProdId,
        quantity: Math.min(quantity, prod.stock || 999),
        created_at: new Date().toISOString()
      });
    }

    saveDb(db);
    return mockCart.getCart();
  },

  updateQuantity: (cartItemId, quantity) => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';
    const newQty = parseInt(quantity, 10);

    const item = db.cart.find((c) => c.user_id === userId && (c.id === cartItemId || c.id.toString() === cartItemId.toString()));
    if (!item) throw new Error('Cart item not found');

    if (newQty <= 0) {
      db.cart = db.cart.filter((c) => c !== item);
    } else {
      const prod = db.products.find((p) => p.id === Number(item.product_id));
      item.quantity = Math.min(newQty, prod?.stock || 999);
    }

    saveDb(db);
    return mockCart.getCart();
  },

  removeItem: (cartItemId) => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';

    db.cart = db.cart.filter((c) => !(c.user_id === userId && (c.id === cartItemId || c.id.toString() === cartItemId.toString())));
    saveDb(db);
    return mockCart.getCart();
  },

  clear: () => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';

    db.cart = db.cart.filter((c) => c.user_id !== userId);
    saveDb(db);
    return { success: true, message: 'Cart cleared' };
  }
};

// -------------------------------------------------------------
// WISHLIST OPERATIONS
// -------------------------------------------------------------
export const mockWishlist = {
  getAll: () => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';

    const userWishlist = db.wishlist.filter((w) => w.user_id === userId);
    const items = userWishlist.map((w) => {
      const prod = db.products.find((p) => p.id === Number(w.product_id)) || {};
      return {
        id: w.id,
        user_id: w.user_id,
        product_id: w.product_id,
        name: prod.name || 'Product',
        slug: prod.slug || '',
        price: prod.price || 0,
        discount_price: prod.discount_price,
        stock: prod.stock || 0,
        rating: prod.rating || 5,
        image_url: prod.image_url || ''
      };
    });

    return { success: true, items };
  },

  toggle: (productId) => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';
    const numProdId = parseInt(productId, 10);

    const existingIdx = db.wishlist.findIndex((w) => w.user_id === userId && Number(w.product_id) === numProdId);
    let inWishlist = false;

    if (existingIdx !== -1) {
      db.wishlist.splice(existingIdx, 1);
      inWishlist = false;
    } else {
      const newId = db.wishlist.length ? Math.max(...db.wishlist.map((w) => (typeof w.id === 'number' ? w.id : 0))) + 1 : 1;
      db.wishlist.push({
        id: newId,
        user_id: userId,
        product_id: numProdId,
        created_at: new Date().toISOString()
      });
      inWishlist = true;
    }

    saveDb(db);
    return {
      success: true,
      inWishlist,
      message: inWishlist ? 'Added to wishlist' : 'Removed from wishlist'
    };
  },

  remove: (productId) => {
    const user = getCurrentUser();
    const db = getDb();
    const userId = user ? user.id : 'guest';
    const numProdId = parseInt(productId, 10);

    db.wishlist = db.wishlist.filter((w) => !(w.user_id === userId && Number(w.product_id) === numProdId));
    saveDb(db);
    return { success: true, message: 'Removed from wishlist' };
  },

  moveToCart: (productId) => {
    const numProdId = parseInt(productId, 10);
    mockCart.addItem(numProdId, 1);
    mockWishlist.remove(numProdId);
    return { success: true, message: 'Moved to cart successfully' };
  }
};

// -------------------------------------------------------------
// ORDERS OPERATIONS
// -------------------------------------------------------------
export const mockOrders = {
  create: (orderPayload) => {
    const user = getCurrentUser();
    if (!user) throw new Error('Please sign in to place an order');

    const db = getDb();
    const cartItems = db.cart.filter((c) => c.user_id === user.id);
    if (cartItems.length === 0) {
      throw new Error('Your cart is empty');
    }

    // Populate order items and calculate totals
    const itemsData = cartItems.map((c) => {
      const prod = db.products.find((p) => p.id === Number(c.product_id)) || {};
      const unitPrice = prod.discount_price !== null && prod.discount_price !== undefined ? Number(prod.discount_price) : Number(prod.price || 0);
      return {
        product_id: prod.id,
        product_name: prod.name,
        product_image: prod.image_url,
        quantity: c.quantity || 1,
        price: unitPrice
      };
    });

    const subtotal = itemsData.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const shipping_fee = subtotal > 0 && subtotal < 99 ? 15 : 0;
    const tax = subtotal * 0.05;
    const total_amount = subtotal + shipping_fee + tax;

    const newOrderId = db.orders.length ? Math.max(...db.orders.map((o) => o.id)) + 1 : 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const order_number = `SS-${dateStr}-${randomCode}`;

    const newOrder = {
      id: newOrderId,
      order_number,
      user_id: user.id,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: 0,
      shipping_fee: parseFloat(shipping_fee.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total_amount: parseFloat(total_amount.toFixed(2)),
      shipping_name: orderPayload.shippingName || user.name,
      shipping_email: orderPayload.shippingEmail || user.email,
      shipping_phone: orderPayload.shippingPhone || user.phone || '+1 (555) 000-0000',
      shipping_address: orderPayload.shippingAddress || user.address || 'Street 1',
      shipping_city: orderPayload.shippingCity || user.city || 'City',
      shipping_state: orderPayload.shippingState || user.state || 'State',
      shipping_pincode: orderPayload.shippingPincode || user.pincode || '00000',
      payment_method: orderPayload.paymentMethod || 'card',
      payment_status: 'completed',
      order_status: 'Confirmed',
      created_at: new Date().toISOString()
    };

    db.orders.unshift(newOrder);

    // Save order items
    itemsData.forEach((it) => {
      const newItemId = db.order_items.length ? Math.max(...db.order_items.map((oi) => oi.id)) + 1 : 1;
      db.order_items.push({
        id: newItemId,
        order_id: newOrderId,
        product_id: it.product_id,
        product_name: it.product_name,
        product_image: it.product_image,
        quantity: it.quantity,
        price: it.price,
        created_at: new Date().toISOString()
      });

      // Decrement stock
      const prod = db.products.find((p) => p.id === it.product_id);
      if (prod) {
        prod.stock = Math.max(0, (prod.stock || 0) - it.quantity);
      }
    });

    // Clear cart
    db.cart = db.cart.filter((c) => c.user_id !== user.id);

    saveDb(db);
    return {
      success: true,
      order: {
        ...newOrder,
        items: itemsData
      },
      message: 'Order placed successfully'
    };
  },

  getUserOrders: () => {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const db = getDb();
    const userOrders = db.orders.filter((o) => o.user_id === user.id);
    
    // Attach order items
    const ordersWithItems = userOrders.map((o) => {
      const items = db.order_items.filter((it) => it.order_id === o.id);
      return { ...o, items };
    });

    return { success: true, orders: ordersWithItems };
  },

  getByNumber: (orderNumber) => {
    const db = getDb();
    const order = db.orders.find((o) => o.order_number === orderNumber || o.id.toString() === orderNumber);
    if (!order) throw new Error('Order not found');

    const items = db.order_items.filter((it) => it.order_id === order.id);
    return { success: true, order: { ...order, items } };
  },

  cancel: (orderId) => {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const db = getDb();
    const numId = parseInt(orderId, 10);
    const order = db.orders.find((o) => o.id === numId && (o.user_id === user.id || user.role === 'admin'));
    if (!order) throw new Error('Order not found');

    if (order.order_status !== 'Pending' && order.order_status !== 'Confirmed') {
      throw new Error(`Cannot cancel order in '${order.order_status}' status`);
    }

    order.order_status = 'Cancelled';
    saveDb(db);
    return { success: true, message: 'Order cancelled successfully', order };
  }
};

// -------------------------------------------------------------
// ADMIN OPERATIONS
// -------------------------------------------------------------
export const mockAdmin = {
  getStats: () => {
    const db = getDb();
    const totalOrders = db.orders.length;
    const totalRevenue = db.orders
      .filter((o) => o.order_status !== 'Cancelled')
      .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    const totalProducts = db.products.length;
    const totalUsers = db.users.length;
    const pendingOrders = db.orders.filter((o) => o.order_status === 'Pending' || o.order_status === 'Confirmed').length;
    const deliveredOrders = db.orders.filter((o) => o.order_status === 'Delivered').length;

    // Recent orders with items
    const recentOrders = db.orders.slice(0, 5).map((o) => {
      const items = db.order_items.filter((it) => it.order_id === o.id);
      return { ...o, items };
    });

    // Category stats
    const categoryStats = db.categories.map((c) => {
      const count = db.products.filter((p) => Number(p.category_id) === Number(c.id)).length;
      return { name: c.name, productCount: count };
    });

    return {
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalProducts,
        totalUsers,
        pendingOrders,
        deliveredOrders
      },
      recentOrders,
      categoryStats
    };
  },

  getOrders: (queryParams = {}) => {
    const db = getDb();
    let ordersList = [...db.orders];

    if (queryParams.status && queryParams.status !== 'all') {
      ordersList = ordersList.filter((o) => o.order_status.toLowerCase() === queryParams.status.toLowerCase());
    }

    if (queryParams.search) {
      const q = queryParams.search.toLowerCase();
      ordersList = ordersList.filter((o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.shipping_name?.toLowerCase().includes(q) ||
        o.shipping_email?.toLowerCase().includes(q)
      );
    }

    const ordersWithItems = ordersList.map((o) => {
      const items = db.order_items.filter((it) => it.order_id === o.id);
      return { ...o, items };
    });

    return { success: true, orders: ordersWithItems };
  },

  updateOrderStatus: (orderId, status) => {
    const db = getDb();
    const numId = parseInt(orderId, 10);
    const order = db.orders.find((o) => o.id === numId);
    if (!order) throw new Error('Order not found');

    order.order_status = status;
    saveDb(db);
    return { success: true, message: `Order status updated to ${status}`, order };
  },

  getUsers: () => {
    const db = getDb();
    return { success: true, users: db.users };
  },

  updateUserRole: (userId, role) => {
    const db = getDb();
    const numId = parseInt(userId, 10);
    const user = db.users.find((u) => u.id === numId);
    if (!user) throw new Error('User not found');

    user.role = role;
    saveDb(db);
    return { success: true, message: `User role updated to ${role}`, user };
  },

  deleteUser: (userId) => {
    const db = getDb();
    const numId = parseInt(userId, 10);
    db.users = db.users.filter((u) => u.id !== numId);
    saveDb(db);
    return { success: true, message: 'User deleted successfully' };
  }
};
