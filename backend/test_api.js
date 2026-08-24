const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok && !data.success) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  console.log('🧪 Starting Full System Integration Verification Tests...\n');

  try {
    // 1. Health check
    console.log('1️⃣ Checking Health Endpoint...');
    const health = await req('/health');
    console.log('✅ Health status:', health);

    // 2. Categories
    console.log('\n2️⃣ Testing Categories...');
    const catRes = await req('/categories');
    console.log(`✅ Loaded ${catRes.categories.length} categories`);

    // 3. Products
    console.log('\n3️⃣ Testing Products Catalog & Filters...');
    const prodRes = await req('/products?limit=6');
    console.log(`✅ Loaded ${prodRes.products.length} products (Total: ${prodRes.pagination.total})`);

    const searchRes = await req('/products?search=headphones');
    console.log(`✅ Search 'headphones': found ${searchRes.products.length} products`);

    const detailRes = await req('/products/1');
    console.log(`✅ Single Product Detail: ${detailRes.product.name} (Gallery images: ${detailRes.product.images?.length})`);

    // 4. Auth - Login Demo Customer
    console.log('\n4️⃣ Testing User Authentication...');
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'john@example.com',
        password: 'User@123'
      }
    });
    const userToken = loginRes.token;
    console.log(`✅ Customer Login Successful! Token received for ${loginRes.user.name}`);

    const userAuthHeaders = { headers: { Authorization: `Bearer ${userToken}` } };

    // Profile check
    const profileRes = await req('/auth/profile', userAuthHeaders);
    console.log(`✅ Profile retrieved: ${profileRes.user.name} (${profileRes.user.city || 'No city'})`);

    // 5. Cart
    console.log('\n5️⃣ Testing Cart Operations...');
    const addCartRes = await req('/cart', {
      method: 'POST',
      body: { productId: 1, quantity: 2 },
      ...userAuthHeaders
    });
    console.log(`✅ Added to cart! Cart items count: ${addCartRes.items.length}, Subtotal: $${addCartRes.totals.subtotal}`);

    const cartRes = await req('/cart', userAuthHeaders);
    console.log(`✅ Retrieved cart. Total items: ${cartRes.itemCount}, Final Total: $${cartRes.totals.total}`);

    // 6. Wishlist
    console.log('\n6️⃣ Testing Wishlist Operations...');
    const wishToggle = await req('/wishlist/toggle', {
      method: 'POST',
      body: { productId: 3 },
      ...userAuthHeaders
    });
    console.log(`✅ Wishlist toggle result: ${wishToggle.message}`);

    const wishList = await req('/wishlist', userAuthHeaders);
    console.log(`✅ Wishlist count: ${wishList.count}`);

    // 7. Order Placement
    console.log('\n7️⃣ Testing Checkout & Order Placement...');
    const orderPayload = {
      shippingName: 'John Doe',
      shippingEmail: 'john@example.com',
      shippingPhone: '+1 (555) 345-6789',
      shippingAddress: '123 Market Street, Apt 4B',
      shippingCity: 'San Francisco',
      shippingState: 'CA',
      shippingPincode: '94103',
      paymentMethod: 'card'
    };

    const orderRes = await req('/orders', {
      method: 'POST',
      body: orderPayload,
      ...userAuthHeaders
    });
    const createdOrder = orderRes.order;
    console.log(`✅ Order Placed! Order #: ${createdOrder.order_number}, Amount: $${createdOrder.total_amount}, Items: ${createdOrder.items?.length}`);

    // Verify user order history
    const myOrdersRes = await req('/orders', userAuthHeaders);
    console.log(`✅ Customer Order History retrieved: ${myOrdersRes.orders.length} orders found.`);

    // 8. Product Review Submission
    console.log('\n8️⃣ Testing Customer Review Submission...');
    const reviewRes = await req('/products/1/reviews', {
      method: 'POST',
      body: {
        rating: 5,
        comment: 'Top quality headphones, crisp high frequencies and deep punchy bass!'
      },
      ...userAuthHeaders
    });
    console.log(`✅ Review submitted! New average rating: ${reviewRes.rating} (${reviewRes.numReviews} total reviews)`);

    // 9. Admin Operations
    console.log('\n9️⃣ Testing Administrator Management Features...');
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@shopsphere.com',
        password: 'Admin@123'
      }
    });
    const adminToken = adminLogin.token;
    const adminAuthHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    const statsRes = await req('/admin/stats', adminAuthHeaders);
    console.log('✅ Admin Stats:', statsRes.stats);

    const adminOrdersRes = await req('/admin/orders', adminAuthHeaders);
    console.log(`✅ Admin Orders List: ${adminOrdersRes.orders.length} orders found.`);

    // Transition order status
    const statusUpdateRes = await req(`/admin/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      body: { status: 'Confirmed' },
      ...adminAuthHeaders
    });
    console.log(`✅ Order status transitioned: ${statusUpdateRes.message}`);

    const adminUsersRes = await req('/admin/users', adminAuthHeaders);
    console.log(`✅ Admin Users List: ${adminUsersRes.users.length} users registered.`);

    console.log('\n======================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.data || error.message);
    process.exit(1);
  }
}

runTests();
