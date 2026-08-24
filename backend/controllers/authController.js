const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/db');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword, address, city, state, pincode } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await query(
      `INSERT INTO users (name, email, phone, password, role, address, city, state, pincode)
       VALUES (?, ?, ?, ?, 'user', ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        phone || null,
        hashedPassword,
        address || null,
        city || null,
        state || null,
        pincode || null
      ]
    );

    const newUserId = result.insertId;
    const user = await queryOne(
      'SELECT id, name, email, phone, role, address, city, state, pincode, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Fetch user with password
    const user = await queryOne(
      'SELECT id, name, email, phone, password, role, address, city, state, pincode, created_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    // Remove password from returned object
    delete user.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await queryOne(
      'SELECT id, name, email, phone, role, address, city, state, pincode, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;

    await query(
      `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
       address = COALESCE(?, address), city = COALESCE(?, city),
       state = COALESCE(?, state), pincode = COALESCE(?, pincode)
       WHERE id = ?`,
      [name, phone, address, city, state, pincode, req.user.id]
    );

    const updatedUser = await queryOne(
      'SELECT id, name, email, phone, role, address, city, state, pincode, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    // Get current password hash
    const user = await queryOne('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword
};
