const { query, queryOne } = require('../config/db');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const items = await query(
      `SELECT 
        w.id, w.created_at,
        p.id as product_id, p.name, p.slug, p.price, p.discount_price,
        p.stock, p.rating, p.image_url, c.name as category_name
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item in wishlist (add/remove)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await queryOne('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await queryOne('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [
      req.user.id,
      productId
    ]);

    let inWishlist = false;

    if (existing) {
      await query('DELETE FROM wishlist WHERE id = ?', [existing.id]);
      inWishlist = false;
    } else {
      await query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, productId]);
      inWishlist = true;
    }

    return res.status(200).json({
      success: true,
      inWishlist,
      message: inWishlist ? 'Product added to wishlist' : 'Product removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await queryOne('SELECT id, stock FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock' });
    }

    // Check cart
    const existingCartItem = await queryOne('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?', [
      req.user.id,
      productId
    ]);

    if (existingCartItem) {
      if (existingCartItem.quantity + 1 <= product.stock) {
        await query('UPDATE cart SET quantity = quantity + 1 WHERE id = ?', [existingCartItem.id]);
      }
    } else {
      await query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)', [req.user.id, productId]);
    }

    // Remove from wishlist
    await query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);

    return res.status(200).json({
      success: true,
      message: 'Product moved to cart successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart
};
