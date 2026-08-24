const { query, queryOne } = require('../config/db');

// @desc    Get dashboard metrics, revenue, order breakdown & charts data
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total counts
    const usersCount = await queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const productsCount = await queryOne('SELECT COUNT(*) as count FROM products');
    const ordersCount = await queryOne('SELECT COUNT(*) as count FROM orders');
    
    // Revenue sum (excluding cancelled orders)
    const revenueSum = await queryOne("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE order_status != 'Cancelled'");

    // Status counts
    const pendingOrders = await queryOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Pending'");
    const deliveredOrders = await queryOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered'");
    const shippedOrders = await queryOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Shipped'");
    const confirmedOrders = await queryOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Confirmed'");
    const cancelledOrders = await queryOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Cancelled'");

    // 2. Recent 6 Orders
    const recentOrders = await query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    // 3. Category distribution
    const categoryStats = await query(`
      SELECT c.id, c.name, COUNT(p.id) as product_count, COALESCE(SUM(p.stock), 0) as total_stock
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY product_count DESC
    `);

    // 4. Sales analytics data (Recent 7 days or mock series for rich visualization)
    const salesTimeline = [
      { name: 'Mon', sales: 1250, orders: 8 },
      { name: 'Tue', sales: 1890, orders: 12 },
      { name: 'Wed', sales: 2340, orders: 15 },
      { name: 'Thu', sales: 1980, orders: 11 },
      { name: 'Fri', sales: 3120, orders: 20 },
      { name: 'Sat', sales: 4200, orders: 26 },
      { name: 'Sun', sales: 3850, orders: 22 }
    ];

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: Number(usersCount.count || 0),
        totalProducts: Number(productsCount.count || 0),
        totalOrders: Number(ordersCount.count || 0),
        totalRevenue: Number(Number(revenueSum.total || 0).toFixed(2)),
        pendingOrders: Number(pendingOrders.count || 0),
        confirmedOrders: Number(confirmedOrders.count || 0),
        shippedOrders: Number(shippedOrders.count || 0),
        deliveredOrders: Number(deliveredOrders.count || 0),
        cancelledOrders: Number(cancelledOrders.count || 0)
      },
      recentOrders,
      categoryStats,
      salesTimeline
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    let conditions = ['1 = 1'];
    let params = [];

    if (status && status !== 'all') {
      conditions.push('o.order_status = ?');
      params.push(status);
    }

    if (search && search.trim() !== '') {
      conditions.push('(o.order_number LIKE ? OR o.shipping_name LIKE ? OR o.shipping_email LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const whereClause = conditions.join(' AND ');

    const countSql = `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`;
    const countRes = await query(countSql, params);
    const total = countRes[0] ? countRes[0].total : 0;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const ordersSql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const orders = await query(ordersSql, [...params, limitNum, offset]);

    // Attach items
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
      orders: ordersWithItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const currentOrder = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!currentOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If changing to Cancelled from a non-cancelled status, restore stock
    if (status === 'Cancelled' && currentOrder.order_status !== 'Cancelled') {
      const items = await query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const it of items) {
        await query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
      }
    }

    await query(
      `UPDATE orders SET 
        order_status = ?,
        payment_status = COALESCE(?, payment_status)
       WHERE id = ?`,
      [status, paymentStatus || null, id]
    );

    const updatedOrder = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.city, u.state, u.created_at,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.order_status != 'Cancelled'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be user or admin' });
    }

    if (Number(id) === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot revoke your own admin rights' });
    }

    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    return res.status(200).json({
      success: true,
      message: `User role changed to ${role}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account while logged in' });
    }

    const user = await queryOne('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  deleteUser
};
