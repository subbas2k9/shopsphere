const { query, queryOne } = require('../config/db');

// Helper to generate a clean order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `SS-${dateStr}-${randomSuffix}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      paymentMethod = 'cod',
      items: directItems
    } = req.body;

    // Validate shipping details
    if (!shippingName || !shippingEmail || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPincode) {
      return res.status(400).json({ success: false, message: 'All shipping information fields are required' });
    }

    let orderProducts = [];

    // If items provided directly in payload, use them; otherwise fetch from user's cart
    if (Array.isArray(directItems) && directItems.length > 0) {
      for (const item of directItems) {
        const prod = await queryOne('SELECT * FROM products WHERE id = ?', [item.productId || item.product_id]);
        if (!prod) {
          return res.status(404).json({ success: false, message: `Product not found (ID: ${item.productId})` });
        }
        orderProducts.push({
          product_id: prod.id,
          name: prod.name,
          image_url: prod.image_url,
          price: prod.discount_price ? Number(prod.discount_price) : Number(prod.price),
          quantity: Number(item.quantity) || 1,
          availableStock: prod.stock
        });
      }
    } else {
      const cartItems = await query(
        `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.discount_price, p.stock, p.image_url
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
        [req.user.id]
      );

      if (cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Your cart is empty' });
      }

      orderProducts = cartItems.map(c => ({
        product_id: c.product_id,
        name: c.name,
        image_url: c.image_url,
        price: c.discount_price ? Number(c.discount_price) : Number(c.price),
        quantity: c.quantity,
        availableStock: c.stock
      }));
    }

    // Check stock for every item before executing
    for (const item of orderProducts) {
      if (item.quantity > item.availableStock) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.name}. (Requested: ${item.quantity}, Available: ${item.availableStock})`
        });
      }
    }

    // Calculations
    const subtotal = orderProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const shippingFee = subtotal > 100 ? 0 : 9.99;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + shippingFee + tax).toFixed(2));
    const orderNumber = generateOrderNumber();

    // Insert Order
    const orderInsertResult = await query(
      `INSERT INTO orders (
        order_number, user_id, subtotal, discount, shipping_fee, tax, total_amount,
        shipping_name, shipping_email, shipping_phone, shipping_address,
        shipping_city, shipping_state, shipping_pincode, payment_method,
        payment_status, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        req.user.id,
        subtotal,
        0,
        shippingFee,
        tax,
        totalAmount,
        shippingName.trim(),
        shippingEmail.trim(),
        shippingPhone.trim(),
        shippingAddress.trim(),
        shippingCity.trim(),
        shippingState.trim(),
        shippingPincode.trim(),
        paymentMethod,
        paymentMethod === 'cod' ? 'pending' : 'completed',
        'Pending'
      ]
    );

    const orderId = orderInsertResult.insertId;

    // Insert Order Items and decrement product stock atomically
    for (const item of orderProducts) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.image_url, item.quantity, item.price]
      );

      // Decrement stock
      await query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear user cart
    await query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    const createdOrder = await queryOne('SELECT * FROM orders WHERE id = ?', [orderId]);
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        ...createdOrder,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Attach items to each order
    const ordersWithItems = await Promise.all(
      orders.map(async (ord) => {
        const items = await query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
        return {
          ...ord,
          items
        };
      })
    );

    return res.status(200).json({
      success: true,
      orders: ordersWithItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await queryOne('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure only the order owner or admin can view
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.order_status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.order_status}`
      });
    }

    // Update order status
    await query('UPDATE orders SET order_status = "Cancelled" WHERE id = ?', [id]);

    // Restore stock for items
    const items = await query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
    for (const it of items) {
      await query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
    }

    return res.status(200).json({
      success: true,
      message: 'Order has been cancelled and stock has been restored.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
};
