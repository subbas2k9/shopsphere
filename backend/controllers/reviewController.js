const { query, queryOne } = require('../config/db');

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await query(
      'SELECT id, user_id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [id]
    );

    return res.status(200).json({
      success: true,
      reviews,
      count: reviews.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Submit a new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a rating between 1 and 5 stars' });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please provide a review comment (minimum 3 characters)' });
    }

    const product = await queryOne('SELECT id FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await queryOne('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?', [
      id,
      req.user.id
    ]);

    if (existingReview) {
      await query(
        'UPDATE reviews SET rating = ?, comment = ?, user_name = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
        [numRating, comment.trim(), req.user.name, existingReview.id]
      );
    } else {
      await query(
        'INSERT INTO reviews (user_id, product_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, id, req.user.name, numRating, comment.trim()]
      );
    }

    // Recalculate average rating and review count
    const stats = await queryOne(
      'SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews FROM reviews WHERE product_id = ?',
      [id]
    );

    const newAvg = Number(Number(stats.avg_rating || 5).toFixed(2));
    const newCount = Number(stats.total_reviews || 0);

    await query('UPDATE products SET rating = ?, num_reviews = ? WHERE id = ?', [newAvg, newCount, id]);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      rating: newAvg,
      numReviews: newCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createProductReview
};
