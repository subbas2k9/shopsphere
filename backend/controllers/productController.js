const { query, queryOne } = require('../config/db');

// Helper to generate a slug from product title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isTrending,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    let conditions = ['1 = 1'];
    let params = [];

    // Search by title or description
    if (search && search.trim() !== '') {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    // Category filter (id or slug)
    if (category && category !== 'all') {
      if (isNaN(category)) {
        conditions.push('c.slug = ?');
        params.push(category);
      } else {
        conditions.push('p.category_id = ?');
        params.push(Number(category));
      }
    }

    // Price range filters
    if (minPrice && !isNaN(minPrice)) {
      conditions.push('COALESCE(p.discount_price, p.price) >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      conditions.push('COALESCE(p.discount_price, p.price) <= ?');
      params.push(Number(maxPrice));
    }

    // Rating filter
    if (rating && !isNaN(rating)) {
      conditions.push('p.rating >= ?');
      params.push(Number(rating));
    }

    // In-Stock filter
    if (inStock === 'true' || inStock === '1') {
      conditions.push('p.stock > 0');
    }

    // Featured & Trending flags
    if (isFeatured === 'true' || isFeatured === '1') {
      conditions.push('p.is_featured = 1');
    }
    if (isTrending === 'true' || isTrending === '1') {
      conditions.push('p.is_trending = 1');
    }

    const whereClause = conditions.join(' AND ');

    // Sorting
    let orderByClause = 'ORDER BY p.id DESC';
    switch (sort) {
      case 'price_asc':
        orderByClause = 'ORDER BY COALESCE(p.discount_price, p.price) ASC';
        break;
      case 'price_desc':
        orderByClause = 'ORDER BY COALESCE(p.discount_price, p.price) DESC';
        break;
      case 'rating_desc':
        orderByClause = 'ORDER BY p.rating DESC, p.num_reviews DESC';
        break;
      case 'name_asc':
        orderByClause = 'ORDER BY p.name ASC';
        break;
      case 'newest':
      default:
        orderByClause = 'ORDER BY p.created_at DESC, p.id DESC';
        break;
    }

    // Total count query
    const countSql = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `;
    const countResult = await query(countSql, params);
    const total = countResult[0] ? countResult[0].total : 0;

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const offset = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Fetch products
    const productsSql = `
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.discount_price,
        p.category_id, p.stock, p.rating, p.num_reviews, p.image_url,
        p.is_featured, p.is_trending, p.created_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const products = await query(productsSql, [...params, limitNum, offset]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product;

    if (!isNaN(idOrSlug)) {
      product = await queryOne(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [Number(idOrSlug)]
      );
    } else {
      product = await queryOne(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.slug = ?`,
        [idOrSlug]
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch multi-image gallery
    const gallery = await query(
      'SELECT id, image_url FROM product_images WHERE product_id = ? ORDER BY id ASC',
      [product.id]
    );

    // If main image is not in gallery, ensure gallery starts with main image
    let images = gallery.map(img => img.image_url);
    if (!images.includes(product.image_url)) {
      images.unshift(product.image_url);
    }

    // Fetch reviews
    const reviews = await query(
      'SELECT id, user_id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [product.id]
    );

    // Fetch related products in same category
    const relatedProducts = await query(
      `SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.rating, p.image_url, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ?
       LIMIT 4`,
      [product.category_id, product.id]
    );

    return res.status(200).json({
      success: true,
      product: {
        ...product,
        images,
        reviews,
        relatedProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discount_price,
      category_id,
      stock,
      image_url,
      images = [],
      is_featured = 0,
      is_trending = 0
    } = req.body;

    if (!name || !description || price === undefined || !category_id || !image_url) {
      return res.status(400).json({ success: false, message: 'Please provide all required product fields' });
    }

    let slug = slugify(name);
    // Ensure slug uniqueness
    const existing = await queryOne('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await query(
      `INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, image_url, is_featured, is_trending)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description,
        Number(price),
        discount_price ? Number(discount_price) : null,
        Number(category_id),
        stock !== undefined ? Number(stock) : 0,
        image_url,
        is_featured ? 1 : 0,
        is_trending ? 1 : 0
      ]
    );

    const newProductId = result.insertId;

    // Add extra gallery images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        if (imgUrl && imgUrl.trim() !== '') {
          await query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [newProductId, imgUrl.trim()]);
        }
      }
    }

    const newProduct = await queryOne('SELECT * FROM products WHERE id = ?', [newProductId]);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discount_price,
      category_id,
      stock,
      image_url,
      images,
      is_featured,
      is_trending
    } = req.body;

    const existingProduct = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      slug = slugify(name);
    }

    await query(
      `UPDATE products SET
        name = COALESCE(?, name),
        slug = ?,
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        discount_price = ?,
        category_id = COALESCE(?, category_id),
        stock = COALESCE(?, stock),
        image_url = COALESCE(?, image_url),
        is_featured = COALESCE(?, is_featured),
        is_trending = COALESCE(?, is_trending)
       WHERE id = ?`,
      [
        name,
        slug,
        description,
        price !== undefined ? Number(price) : null,
        discount_price !== undefined ? (discount_price ? Number(discount_price) : null) : existingProduct.discount_price,
        category_id !== undefined ? Number(category_id) : null,
        stock !== undefined ? Number(stock) : null,
        image_url,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_trending !== undefined ? (is_trending ? 1 : 0) : null,
        id
      ]
    );

    // Update gallery if specified
    if (Array.isArray(images)) {
      await query('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (const imgUrl of images) {
        if (imgUrl && imgUrl.trim() !== '') {
          await query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [id, imgUrl.trim()]);
        }
      }
    }

    const updatedProduct = await queryOne('SELECT * FROM products WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingProduct = await queryOne('SELECT id FROM products WHERE id = ?', [id]);

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await query('DELETE FROM products WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
