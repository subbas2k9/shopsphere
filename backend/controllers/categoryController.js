const { query, queryOne } = require('../config/db');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all categories with product count
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await query(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.image_url, c.created_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID or slug
// @route   GET /api/categories/:idOrSlug
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let category;

    if (!isNaN(idOrSlug)) {
      category = await queryOne('SELECT * FROM categories WHERE id = ?', [Number(idOrSlug)]);
    } else {
      category = await queryOne('SELECT * FROM categories WHERE slug = ?', [idOrSlug]);
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    let slug = slugify(name);
    const existing = await queryOne('SELECT id FROM categories WHERE slug = ? OR name = ?', [slug, name]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }

    const result = await query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [name.trim(), slug, description || null, image_url || null]
    );

    const newCategory = await queryOne('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    const existing = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name);
    }

    await query(
      `UPDATE categories SET
        name = COALESCE(?, name),
        slug = ?,
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url)
       WHERE id = ?`,
      [name, slug, description, image_url, id]
    );

    const updatedCategory = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT id FROM categories WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await query('DELETE FROM categories WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
