const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { getProductReviews, createProductReview } = require('../controllers/reviewController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:idOrSlug', getProductById);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

// Reviews sub-route
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
