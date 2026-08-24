const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Wishlist operations require user authentication

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/move-to-cart', moveToCart);

module.exports = router;
