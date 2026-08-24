const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require JWT authentication and Admin role
router.use(protect, requireAdmin);

// Dashboard Metrics & Charts
router.get('/stats', getDashboardStats);

// Orders Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
