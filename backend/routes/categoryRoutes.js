const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.get('/:idOrSlug', getCategoryById);
router.post('/', protect, requireAdmin, createCategory);
router.put('/:id', protect, requireAdmin, updateCategory);
router.delete('/:id', protect, requireAdmin, deleteCategory);

module.exports = router;
