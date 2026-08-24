import {
  mockAuth,
  mockCategories,
  mockProducts,
  mockCart,
  mockWishlist,
  mockOrders,
  mockAdmin
} from './mockDb';

// Simulated latency in milliseconds for realistic UX
const SIMULATED_LATENCY = 60;
const delay = (ms = SIMULATED_LATENCY) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Parse URL and query params
const parseUrl = (url) => {
  const cleanUrl = url.startsWith('/api') ? url.replace('/api', '') : url;
  const [pathWithQuery] = cleanUrl.split('#');
  const [path, queryString] = pathWithQuery.split('?');
  const query = {};
  if (queryString) {
    const params = new URLSearchParams(queryString);
    for (const [key, value] of params.entries()) {
      query[key] = value;
    }
  }
  return { path: path.startsWith('/') ? path : `/${path}`, query };
};

// Router for Mock API Requests
const handleRequest = async (method, rawUrl, data = null) => {
  await delay();
  const { path, query } = parseUrl(rawUrl);

  try {
    // ---------------- AUTH ----------------
    if (path === '/auth/login' && method === 'POST') {
      return mockAuth.login(data?.email, data?.password);
    }
    if (path === '/auth/register' && method === 'POST') {
      return mockAuth.register(data);
    }
    if (path === '/auth/profile' && method === 'GET') {
      return mockAuth.getProfile();
    }
    if (path === '/auth/profile' && method === 'PUT') {
      return mockAuth.updateProfile(data);
    }
    if (path === '/auth/password' && method === 'PUT') {
      return mockAuth.changePassword(data);
    }

    // ---------------- CATEGORIES ----------------
    if (path === '/categories' && method === 'GET') {
      return mockCategories.getAll();
    }
    if (path === '/categories' && method === 'POST') {
      return mockCategories.create(data);
    }
    const catMatch = path.match(/^\/categories\/([^\/]+)$/);
    if (catMatch) {
      const catId = catMatch[1];
      if (method === 'PUT') return mockCategories.update(catId, data);
      if (method === 'DELETE') return mockCategories.delete(catId);
    }

    // ---------------- PRODUCTS ----------------
    if (path === '/products' && method === 'GET') {
      return mockProducts.getAll(query);
    }
    if (path === '/products' && method === 'POST') {
      return mockProducts.create(data);
    }

    // Product reviews: /products/:id/reviews
    const reviewMatch = path.match(/^\/products\/([^\/]+)\/reviews$/);
    if (reviewMatch && method === 'POST') {
      return mockProducts.addReview(reviewMatch[1], data);
    }

    // Single Product: /products/:idOrSlug
    const prodMatch = path.match(/^\/products\/([^\/]+)$/);
    if (prodMatch) {
      const prodIdOrSlug = prodMatch[1];
      if (method === 'GET') return mockProducts.getByIdOrSlug(prodIdOrSlug);
      if (method === 'PUT') return mockProducts.update(prodIdOrSlug, data);
      if (method === 'DELETE') return mockProducts.delete(prodIdOrSlug);
    }

    // ---------------- CART ----------------
    if (path === '/cart' && method === 'GET') {
      return mockCart.getCart();
    }
    if (path === '/cart' && method === 'POST') {
      return mockCart.addItem(data?.productId, data?.quantity);
    }
    if (path === '/cart' && method === 'DELETE') {
      return mockCart.clear();
    }
    const cartMatch = path.match(/^\/cart\/([^\/]+)$/);
    if (cartMatch) {
      const cartItemId = cartMatch[1];
      if (method === 'PUT') return mockCart.updateQuantity(cartItemId, data?.quantity);
      if (method === 'DELETE') return mockCart.removeItem(cartItemId);
    }

    // ---------------- WISHLIST ----------------
    if (path === '/wishlist' && method === 'GET') {
      return mockWishlist.getAll();
    }
    if (path === '/wishlist/toggle' && method === 'POST') {
      return mockWishlist.toggle(data?.productId);
    }
    if (path === '/wishlist/move-to-cart' && method === 'POST') {
      return mockWishlist.moveToCart(data?.productId);
    }
    const wishMatch = path.match(/^\/wishlist\/([^\/]+)$/);
    if (wishMatch && method === 'DELETE') {
      return mockWishlist.remove(wishMatch[1]);
    }

    // ---------------- ORDERS ----------------
    if (path === '/orders' && method === 'GET') {
      return mockOrders.getUserOrders();
    }
    if (path === '/orders' && method === 'POST') {
      return mockOrders.create(data);
    }
    const cancelOrderMatch = path.match(/^\/orders\/([^\/]+)\/cancel$/);
    if (cancelOrderMatch && method === 'PUT') {
      return mockOrders.cancel(cancelOrderMatch[1]);
    }
    const orderMatch = path.match(/^\/orders\/([^\/]+)$/);
    if (orderMatch && method === 'GET') {
      return mockOrders.getByNumber(orderMatch[1]);
    }

    // ---------------- ADMIN ----------------
    if (path === '/admin/stats' && method === 'GET') {
      return mockAdmin.getStats();
    }
    if (path === '/admin/orders' && method === 'GET') {
      return mockAdmin.getOrders(query);
    }
    const adminOrderStatusMatch = path.match(/^\/admin\/orders\/([^\/]+)\/status$/);
    if (adminOrderStatusMatch && method === 'PUT') {
      return mockAdmin.updateOrderStatus(adminOrderStatusMatch[1], data?.status);
    }
    if (path === '/admin/users' && method === 'GET') {
      return mockAdmin.getUsers();
    }
    const adminUserRoleMatch = path.match(/^\/admin\/users\/([^\/]+)\/role$/);
    if (adminUserRoleMatch && method === 'PUT') {
      return mockAdmin.updateUserRole(adminUserRoleMatch[1], data?.role);
    }
    const adminUserMatch = path.match(/^\/admin\/users\/([^\/]+)$/);
    if (adminUserMatch && method === 'DELETE') {
      return mockAdmin.deleteUser(adminUserMatch[1]);
    }

    console.warn(`[Mock API 404] Unhandled route: ${method} ${path}`);
    return { success: false, message: `Route ${method} ${path} not found` };
  } catch (error) {
    console.error(`[Mock API Error] ${method} ${path}:`, error.message);
    throw new Error(error.message || 'Operation failed');
  }
};

// Simulated Axios Instance
const api = {
  get: async (url, config = {}) => {
    const result = await handleRequest('GET', url);
    return { data: result, status: 200, statusText: 'OK' };
  },
  post: async (url, data = {}, config = {}) => {
    const result = await handleRequest('POST', url, data);
    return { data: result, status: 200, statusText: 'OK' };
  },
  put: async (url, data = {}, config = {}) => {
    const result = await handleRequest('PUT', url, data);
    return { data: result, status: 200, statusText: 'OK' };
  },
  delete: async (url, config = {}) => {
    const result = await handleRequest('DELETE', url);
    return { data: result, status: 200, statusText: 'OK' };
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

export default api;
