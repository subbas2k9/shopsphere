const jwt = require('jsonwebtoken');
const { queryOne } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_2026');

      const user = await queryOne(
        'SELECT id, name, email, phone, role, address, city, state, pincode, created_at FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or token invalid' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('[AuthMiddleware Error]:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
};

// Optional auth for cart or browsing where user might be logged in or guest
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_2026');
      const user = await queryOne('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore token failure for optional
    }
  }
  next();
};

module.exports = {
  protect,
  requireAdmin,
  optionalAuth
};
