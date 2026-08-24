const { query, queryOne } = require('../config/db');

// Helper to calculate totals
const calculateCartTotals = (items) => {
  let subtotal = 0;
  let totalSavings = 0;

  items.forEach((item) => {
    const originalPrice = Number(item.price);
    const effectivePrice = item.discount_price ? Number(item.discount_price) : originalPrice;
    const qty = Number(item.quantity);

    subtotal += effectivePrice * qty;
    if (item.discount_price) {
      totalSavings += (originalPrice - Number(item.discount_price)) * qty;
    }
  });

  // Free shipping over $100, otherwise $9.99
  const shippingFee = subtotal > 100 || items.length === 0 ? 0 : 9.99;
  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% estimated tax
  const total = Number((subtotal + shippingFee + tax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalSavings: Number(totalSavings.toFixed(2)),
    shippingFee: Number(shippingFee.toFixed(2)),
    tax,
    total
  };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const items = await query(
      `SELECT 
        c.id, c.quantity, c.created_at,
        p.id as product_id, p.name, p.slug, p.price, p.discount_price,
        p.stock, p.image_url, cat.name as category_name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN categories cat ON p.category_id = cat.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const totals = calculateCartTotals(items);

    return res.status(200).json({
      success: true,
      items,
      totals,
      itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart or update quantity
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

    // Verify product and check stock
    const product = await queryOne('SELECT id, name, stock FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'This item is currently out of stock' });
    }

    // Check if already in cart
    const existingCartItem = await queryOne(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + qtyToAdd;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock} units available)`
        });
      }

      await query('UPDATE cart SET quantity = ? WHERE id = ?', [newQuantity, existingCartItem.id]);
    } else {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} available)`
        });
      }

      await query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [
        req.user.id,
        productId,
        qtyToAdd
      ]);
    }

    // Return updated cart
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }

    const cartItem = await queryOne(
      `SELECT c.id, c.product_id, p.stock 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.id = ? AND c.user_id = ?`,
      [id, req.user.id]
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (newQty > cartItem.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.stock} units available in stock`
      });
    }

    await query('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, id]);

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await queryOne('SELECT id FROM cart WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    await query('DELETE FROM cart WHERE id = ?', [id]);

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    await query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      items: [],
      totals: { subtotal: 0, totalSavings: 0, shippingFee: 0, tax: 0, total: 0 },
      itemCount: 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
