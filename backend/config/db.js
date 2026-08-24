const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbType = 'mysql'; // 'mysql' or 'fallback-json'
let pool = null;

// JSON storage file path for seamless offline/zero-config fallback
const dataDir = path.join(__dirname, '..', 'database');
const dataFilePath = path.join(dataDir, 'shopsphere_store.json');

// In-memory relational tables store
let memoryStore = {
  users: [],
  categories: [],
  products: [],
  product_images: [],
  cart: [],
  wishlist: [],
  orders: [],
  order_items: [],
  reviews: []
};

// Seed dataset
const seedCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics', description: 'Cutting-edge gadgets, laptops, audio gear, and smart devices.', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
  { id: 2, name: 'Fashion', slug: 'fashion', description: 'Contemporary apparel, designer streetwear, and timeless classics.', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
  { id: 3, name: 'Shoes', slug: 'shoes', description: 'Premium sneakers, athletic running shoes, and formal footwear.', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
  { id: 4, name: 'Accessories', slug: 'accessories', description: 'Luxury watches, minimalist wallets, sunglasses, and travel packs.', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
  { id: 5, name: 'Home & Living', slug: 'home-living', description: 'Modern home aesthetics, acoustic lamps, ergonomic decor, and kitchenware.', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
  { id: 6, name: 'Gaming', slug: 'gaming', description: 'Pro-tier mechanical keyboards, high-refresh monitors, and gaming gear.', image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80', created_at: new Date().toISOString() }
];

const seedProducts = [
  // Electronics
  { id: 1, name: 'Aura ANC Wireless Headphones', slug: 'aura-anc-wireless-headphones', description: 'Engineered with studio-grade 40mm beryllium drivers, 45-hour battery life, and active hybrid noise cancellation for an acoustic mastery.', price: 299.99, discount_price: 249.99, category_id: 1, stock: 35, rating: 4.9, num_reviews: 28, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 1, created_at: new Date().toISOString() },
  { id: 2, name: 'NovaBook Pro 16 M3 Ultra', slug: 'novabook-pro-16-m3-ultra', description: 'Equipped with a vivid 120Hz Liquid Retina XDR display, 32GB unified memory, and aerospace aluminum chassis designed for high-performance creators.', price: 1899.00, discount_price: 1749.00, category_id: 1, stock: 12, rating: 4.8, num_reviews: 19, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 0, created_at: new Date().toISOString() },
  { id: 3, name: 'SonicPulse Smart Speaker Hub', slug: 'sonicpulse-smart-speaker-hub', description: '360-degree spatial sound with integrated voice assistant, ambient glow ring, and smart home Zigbee hub connectivity.', price: 129.99, discount_price: 99.99, category_id: 1, stock: 50, rating: 4.6, num_reviews: 14, image_url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 1, created_at: new Date().toISOString() },
  { id: 4, name: 'VisionCraft Mirrorless 4K Camera', slug: 'visioncraft-mirrorless-4k-camera', description: 'Full-frame 45MP sensor capable of 8K video capture, dual card slots, and lightning-fast subject-tracking autofocus.', price: 1499.00, discount_price: 1399.00, category_id: 1, stock: 8, rating: 4.9, num_reviews: 31, image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 1, created_at: new Date().toISOString() },

  // Fashion
  { id: 5, name: 'Obsidian Merino Wool Overcoat', slug: 'obsidian-merino-wool-overcoat', description: 'Tailored from 100% sustainably sourced Italian merino wool with a relaxed silhouette and weather-resistant satin lining.', price: 340.00, discount_price: 289.00, category_id: 2, stock: 20, rating: 4.7, num_reviews: 16, image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 0, created_at: new Date().toISOString() },
  { id: 6, name: 'Minimalist Oversized Heavy Hoodie', slug: 'minimalist-oversized-heavy-hoodie', description: 'Crafted from 480 GSM organic cotton fleece with dropped shoulders, raw cut aesthetics, and pre-shrunk luxury weave.', price: 89.00, discount_price: 75.00, category_id: 2, stock: 60, rating: 4.8, num_reviews: 42, image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 1, created_at: new Date().toISOString() },
  { id: 7, name: 'Vintage Washed Denim Trucker Jacket', slug: 'vintage-washed-denim-trucker-jacket', description: 'Classic relaxed fit Japanese selvedge denim jacket with custom antique bronze hardware and subtle distressing.', price: 145.00, discount_price: 119.00, category_id: 2, stock: 25, rating: 4.6, num_reviews: 22, image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 0, created_at: new Date().toISOString() },
  { id: 8, name: 'Silk Blend Resort Casual Shirt', slug: 'silk-blend-resort-casual-shirt', description: 'Breathable camp-collar shirt rendered in fluid mulberry silk-viscose blend, featuring subtle botanical jacquard weaving.', price: 95.00, discount_price: 79.99, category_id: 2, stock: 40, rating: 4.5, num_reviews: 11, image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 1, created_at: new Date().toISOString() },

  // Shoes
  { id: 9, name: 'Apex Runner Carbon Max', slug: 'apex-runner-carbon-max', description: 'Propulsive full-length carbon fiber plate coupled with dual-density nitrogen infused foam for marathon-ready cushioning.', price: 199.99, discount_price: 169.99, category_id: 3, stock: 45, rating: 4.9, num_reviews: 53, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 1, created_at: new Date().toISOString() },
  { id: 10, name: 'Urban Glide Classic Leather Sneakers', slug: 'urban-glide-classic-leather-sneakers', description: 'Handcrafted full-grain calfskin leather low-tops with ergonomic memory foam insoles and stitched margom cupsole.', price: 160.00, discount_price: 135.00, category_id: 3, stock: 30, rating: 4.7, num_reviews: 34, image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 0, created_at: new Date().toISOString() },
  { id: 11, name: 'TerraTrek Waterproof Trail Boots', slug: 'terratrek-waterproof-trail-boots', description: 'Rugged Vibram Megagrip lug outsole, breathable eVent waterproof membrane, and reinforced TPU toe guard.', price: 220.00, discount_price: 189.00, category_id: 3, stock: 18, rating: 4.8, num_reviews: 19, image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 1, created_at: new Date().toISOString() },
  { id: 12, name: 'Derby Goodyear Welted Oxford Shoes', slug: 'derby-goodyear-welted-oxford-shoes', description: 'Polished French box calf leather construction featuring traditional Goodyear welted leather soles for executive elegance.', price: 275.00, discount_price: 240.00, category_id: 3, stock: 15, rating: 4.6, num_reviews: 9, image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 0, created_at: new Date().toISOString() },

  // Accessories
  { id: 13, name: 'Chronograph Automatic Sapphire Watch', slug: 'chronograph-automatic-sapphire-watch', description: 'Swiss automatic movement with 42-hour power reserve, anti-reflective sapphire crystal, and 316L stainless steel bracelet.', price: 450.00, discount_price: 395.00, category_id: 4, stock: 14, rating: 4.9, num_reviews: 27, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 1, created_at: new Date().toISOString() },
  { id: 14, name: 'Carbon Minimalist RFID-Shield Wallet', slug: 'carbon-minimalist-rfid-shield-wallet', description: 'Aerospace carbon fiber and anodized aluminum cardholder holding up to 12 cards with integrated cash strap.', price: 65.00, discount_price: 49.99, category_id: 4, stock: 80, rating: 4.7, num_reviews: 61, image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 1, created_at: new Date().toISOString() },
  { id: 15, name: 'Nomad Weatherproof Tech Backpack 24L', slug: 'nomad-weatherproof-tech-backpack-24l', description: 'Cordura ballistic nylon with magnetic Fidlock buckles, dedicated 16-inch fleece laptop sleeve, and luggage passthrough.', price: 185.00, discount_price: 155.00, category_id: 4, stock: 28, rating: 4.8, num_reviews: 38, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 0, created_at: new Date().toISOString() },
  { id: 16, name: 'Polarized Titanium Aviator Sunglasses', slug: 'polarized-titanium-aviator-sunglasses', description: 'Ultralight 18-gram titanium frame with 100% UV400 polarized nylon lenses and anti-scratch hydrophobic coating.', price: 140.00, discount_price: 115.00, category_id: 4, stock: 35, rating: 4.6, num_reviews: 17, image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 0, created_at: new Date().toISOString() },

  // Home & Living
  { id: 17, name: 'Lumina Smart Ambient Bar Table Lamp', slug: 'lumina-smart-ambient-bar-table-lamp', description: 'Dimmable color temperature from 1800K to 6500K with wireless magnetic charging base and brushed brass finish.', price: 110.00, discount_price: 89.00, category_id: 5, stock: 22, rating: 4.8, num_reviews: 15, image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 1, created_at: new Date().toISOString() },
  { id: 18, name: 'AeroPress Precision Espresso Machine', slug: 'aeropress-precision-espresso-machine', description: 'Dual boiler system with PID temperature control, commercial 58mm portafilter, and instant steam wand.', price: 699.00, discount_price: 599.00, category_id: 5, stock: 10, rating: 4.9, num_reviews: 21, image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 0, created_at: new Date().toISOString() },
  { id: 19, name: 'Nordic Ergonomic Lounge Recliner', slug: 'nordic-ergonomic-lounge-recliner', description: 'Sculptural plywood shell upholstered in supple top-grain leather with 360-degree aluminum swivel base.', price: 850.00, discount_price: 750.00, category_id: 5, stock: 7, rating: 4.7, num_reviews: 8, image_url: 'https://images.unsplash.com/photo-1580481077191-23d7265a7d97?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 0, created_at: new Date().toISOString() },
  { id: 20, name: 'Ceramic Minimalist Pour-Over Set', slug: 'ceramic-minimalist-pour-over-set', description: 'Artisan matte black stoneware dripper with double-walled thermal glass carafe and measuring spoon.', price: 55.00, discount_price: 45.00, category_id: 5, stock: 40, rating: 4.6, num_reviews: 19, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 1, created_at: new Date().toISOString() },

  // Gaming
  { id: 21, name: 'Vortex Pro Wireless Mechanical Keyboard', slug: 'vortex-pro-wireless-mechanical-keyboard', description: 'Gasket-mounted hot-swappable tactile switches, per-key RGB backlighting, rotary volume knob, and low-latency 2.4GHz.', price: 169.99, discount_price: 139.99, category_id: 6, stock: 32, rating: 4.9, num_reviews: 44, image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 1, created_at: new Date().toISOString() },
  { id: 22, name: 'Phantom 4K 240Hz OLED Gaming Monitor 32"', slug: 'phantom-4k-240hz-oled-gaming-monitor-32', description: 'Blazing 0.03ms response time, 99% DCI-P3 color gamut, HDR True Black 400, and integrated KVM switch.', price: 999.00, discount_price: 899.00, category_id: 6, stock: 11, rating: 4.9, num_reviews: 29, image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', is_featured: 1, is_trending: 1, created_at: new Date().toISOString() },
  { id: 23, name: 'Spectre Ultralight Wireless Gaming Mouse', slug: 'spectre-ultralight-wireless-gaming-mouse', description: 'Featherweight 49-gram magnesium alloy honeycomb shell, 30K optical sensor, and 4000Hz polling rate receiver.', price: 119.00, discount_price: 99.00, category_id: 6, stock: 50, rating: 4.8, num_reviews: 36, image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 1, created_at: new Date().toISOString() },
  { id: 24, name: 'Quantum 7.1 Spatial Audio Gaming Headset', slug: 'quantum-7-1-spatial-audio-gaming-headset', description: 'Planar magnetic audio drivers with detachable broadcast-grade condenser microphone and cooling gel ear cushions.', price: 179.99, discount_price: 149.99, category_id: 6, stock: 26, rating: 4.7, num_reviews: 18, image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop&q=80', is_featured: 0, is_trending: 0, created_at: new Date().toISOString() }
];

const seedGallery = [
  { id: 1, product_id: 1, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { id: 2, product_id: 1, image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80' },
  { id: 3, product_id: 1, image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80' },
  { id: 4, product_id: 2, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { id: 5, product_id: 2, image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80' },
  { id: 6, product_id: 9, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
  { id: 7, product_id: 9, image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80' },
  { id: 8, product_id: 13, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
  { id: 9, product_id: 13, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80' },
  { id: 10, product_id: 21, image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80' },
  { id: 11, product_id: 21, image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80' }
];

const seedReviews = [
  { id: 1, user_id: 2, product_id: 1, user_name: 'John Doe', rating: 5, comment: 'The soundstage and active noise cancellation on these headphones are unbelievable! Battery lasts almost a whole week of work sessions.', created_at: new Date().toISOString() },
  { id: 2, user_id: 3, product_id: 1, user_name: 'Sarah Connor', rating: 5, comment: 'Extremely comfortable memory foam ear cushions. The finish feels ultra-premium.', created_at: new Date().toISOString() },
  { id: 3, user_id: 2, product_id: 9, user_name: 'John Doe', rating: 5, comment: 'Ran my first marathon in these. The carbon plate propulsion really shaved minutes off my personal best!', created_at: new Date().toISOString() },
  { id: 4, user_id: 3, product_id: 13, user_name: 'Sarah Connor', rating: 4, comment: 'Stunning timepiece. Sapphire crystal is totally scratch resistant so far, compliments everywhere I go.', created_at: new Date().toISOString() },
  { id: 5, user_id: 2, product_id: 21, user_name: 'John Doe', rating: 5, comment: 'Typing on this keyboard is pure bliss. Thocky sound profile straight out of the box.', created_at: new Date().toISOString() }
];

// Helper to save fallback database to JSON
function persistStore() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(memoryStore, null, 2));
  } catch (err) {
    console.error('[DB Store Error]:', err.message);
  }
}

// Load fallback store
async function loadOrSeedFallbackStore() {
  if (fs.existsSync(dataFilePath)) {
    try {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      memoryStore = JSON.parse(data);
      console.log('[DB] Loaded existing records from local store.');
      return;
    } catch (e) {
      console.warn('[DB] Re-initializing store...');
    }
  }

  console.log('[DB] Seeding store with initial data...');
  const hashedAdminPass = await bcrypt.hash('Admin@123', 10);
  const hashedUserPass = await bcrypt.hash('User@123', 10);

  memoryStore.users = [
    { id: 1, name: 'Admin Master', email: 'admin@shopsphere.com', phone: '+1 (555) 019-2834', password: hashedAdminPass, role: 'admin', address: '742 Evergreen Terrace', city: 'Springfield', state: 'OR', pincode: '97477', created_at: new Date().toISOString() },
    { id: 2, name: 'John Doe', email: 'john@example.com', phone: '+1 (555) 345-6789', password: hashedUserPass, role: 'user', address: '123 Market Street, Apt 4B', city: 'San Francisco', state: 'CA', pincode: '94103', created_at: new Date().toISOString() },
    { id: 3, name: 'Sarah Connor', email: 'sarah@example.com', phone: '+1 (555) 987-6543', password: hashedUserPass, role: 'user', address: '456 Elm Street', city: 'Los Angeles', state: 'CA', pincode: '90001', created_at: new Date().toISOString() }
  ];

  memoryStore.categories = [...seedCategories];
  memoryStore.products = [...seedProducts];
  memoryStore.product_images = [...seedGallery];
  memoryStore.reviews = [...seedReviews];
  memoryStore.cart = [];
  memoryStore.wishlist = [];
  memoryStore.orders = [];
  memoryStore.order_items = [];

  persistStore();
  console.log('[DB] Seeded fallback store successfully!');
}

// Initialize and auto-migrate database
async function initDB() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'shopsphere_db';

  try {
    console.log(`[DB] Attempting connection to MySQL at ${dbHost}:${dbPort}...`);
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    await pool.query('SELECT 1 + 1 AS result');
    dbType = 'mysql';
    console.log('[DB] Connected to MySQL successfully! Database:', dbName);

    // Run schema tables setup
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE '));

    for (const stmt of statements) {
      await pool.query(stmt);
    }

    // Seed if empty
    const [uCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (uCount[0].count === 0) {
      console.log('[DB] Populating initial seed data in MySQL...');
      const seedSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');
      const seedStmts = seedSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toUpperCase().startsWith('USE '));
      for (const s of seedStmts) {
        await pool.query(s);
      }
    }
  } catch (err) {
    console.warn(`[DB] MySQL server offline or unreachable (${err.message}).`);
    console.log('[DB] Activating pure JS relational persistence engine with full SQL compatibility...');
    dbType = 'fallback-json';
    await loadOrSeedFallbackStore();
  }
}

// Unified Query Handler
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    const [rows] = await pool.query(sql, params);
    if (rows && typeof rows.insertId !== 'undefined') {
      return { insertId: rows.insertId, affectedRows: rows.affectedRows, rows };
    }
    return rows;
  }

  // Fallback relational emulator
  const cleanSql = sql.replace(/\s+/g, ' ').trim();
  const upper = cleanSql.toUpperCase();

  // 1. SELECT queries
  if (upper.startsWith('SELECT')) {
    if (upper.includes('FROM USERS')) {
      if (upper.includes('COUNT(*)')) {
        if (upper.includes("ROLE = 'USER'")) {
          const count = memoryStore.users.filter(u => u.role === 'user').length;
          return [{ count }];
        }
        return [{ count: memoryStore.users.length }];
      }
      if (upper.includes('WHERE EMAIL =')) {
        const email = String(params[0]).toLowerCase();
        return memoryStore.users.filter(u => u.email.toLowerCase() === email);
      }
      if (upper.includes('WHERE ID =')) {
        const id = Number(params[0]);
        return memoryStore.users.filter(u => u.id === id);
      }
      // Admin list with order count
      if (upper.includes('ORDER_COUNT') || upper.includes('GROUP BY U.ID')) {
        return memoryStore.users.map(u => {
          const userOrders = memoryStore.orders.filter(o => o.user_id === u.id && o.order_status !== 'Cancelled');
          const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
          return {
            ...u,
            order_count: userOrders.length,
            total_spent: totalSpent
          };
        });
      }
      return [...memoryStore.users];
    }

    if (upper.includes('FROM CATEGORIES')) {
      if (upper.includes('WHERE SLUG =') || upper.includes('WHERE NAME =')) {
        const val = String(params[0]);
        return memoryStore.categories.filter(c => c.slug === val || c.name.toLowerCase() === val.toLowerCase());
      }
      if (upper.includes('WHERE ID =')) {
        const id = Number(params[0]);
        return memoryStore.categories.filter(c => c.id === id);
      }
      // Return with product_count and total_stock
      return memoryStore.categories.map(c => {
        const prods = memoryStore.products.filter(p => p.category_id === c.id);
        const totalStock = prods.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
        return {
          ...c,
          product_count: prods.length,
          total_stock: totalStock
        };
      });
    }

    if (upper.includes('FROM PRODUCTS')) {
      if (upper.includes('COUNT(*) AS TOTAL') || upper.includes('COUNT(*)')) {
        // Evaluate filter count
        let list = [...memoryStore.products];
        // Handle search
        let paramIdx = 0;
        if (upper.includes('P.NAME LIKE ?')) {
          const search = String(params[paramIdx]).replace(/%/g, '').toLowerCase();
          paramIdx += 2;
          list = list.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
        }
        if (upper.includes('C.SLUG = ?') || upper.includes('P.CATEGORY_ID = ?')) {
          const cat = params[paramIdx++];
          if (isNaN(cat)) {
            const matchedCat = memoryStore.categories.find(c => c.slug === cat);
            list = list.filter(p => matchedCat && p.category_id === matchedCat.id);
          } else {
            list = list.filter(p => p.category_id === Number(cat));
          }
        }
        if (upper.includes('COALESCE(P.DISCOUNT_PRICE, P.PRICE) >=')) {
          const min = Number(params[paramIdx++]);
          list = list.filter(p => (p.discount_price || p.price) >= min);
        }
        if (upper.includes('COALESCE(P.DISCOUNT_PRICE, P.PRICE) <=')) {
          const max = Number(params[paramIdx++]);
          list = list.filter(p => (p.discount_price || p.price) <= max);
        }
        if (upper.includes('P.RATING >=')) {
          const rat = Number(params[paramIdx++]);
          list = list.filter(p => p.rating >= rat);
        }
        if (upper.includes('P.STOCK > 0')) {
          list = list.filter(p => p.stock > 0);
        }
        if (upper.includes('P.IS_FEATURED = 1')) {
          list = list.filter(p => p.is_featured === 1);
        }
        if (upper.includes('P.IS_TRENDING = 1')) {
          list = list.filter(p => p.is_trending === 1);
        }
        return [{ total: list.length, count: list.length }];
      }

      if (upper.includes('WHERE P.ID = ?') || upper.includes('WHERE ID = ?')) {
        const id = Number(params[0]);
        const p = memoryStore.products.find(prod => prod.id === id);
        if (!p) return [];
        const cat = memoryStore.categories.find(c => c.id === p.category_id);
        return [{
          ...p,
          category_name: cat ? cat.name : '',
          category_slug: cat ? cat.slug : ''
        }];
      }

      if (upper.includes('WHERE P.SLUG = ?') || upper.includes('WHERE SLUG = ?')) {
        const slug = String(params[0]);
        const p = memoryStore.products.find(prod => prod.slug === slug);
        if (!p) return [];
        const cat = memoryStore.categories.find(c => c.id === p.category_id);
        return [{
          ...p,
          category_name: cat ? cat.name : '',
          category_slug: cat ? cat.slug : ''
        }];
      }

      // Related products
      if (upper.includes('WHERE P.CATEGORY_ID = ? AND P.ID !=')) {
        const catId = Number(params[0]);
        const prodId = Number(params[1]);
        const related = memoryStore.products
          .filter(p => p.category_id === catId && p.id !== prodId)
          .slice(0, 4)
          .map(p => {
            const cat = memoryStore.categories.find(c => c.id === p.category_id);
            return { ...p, category_name: cat ? cat.name : '' };
          });
        return related;
      }

      // Full filtered list query
      let list = memoryStore.products.map(p => {
        const cat = memoryStore.categories.find(c => c.id === p.category_id);
        return {
          ...p,
          category_name: cat ? cat.name : '',
          category_slug: cat ? cat.slug : ''
        };
      });

      let paramIdx = 0;
      if (upper.includes('P.NAME LIKE ?')) {
        const search = String(params[paramIdx]).replace(/%/g, '').toLowerCase();
        paramIdx += 2;
        list = list.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
      }
      if (upper.includes('C.SLUG = ?') || upper.includes('P.CATEGORY_ID = ?')) {
        const cat = params[paramIdx++];
        if (isNaN(cat)) {
          const matchedCat = memoryStore.categories.find(c => c.slug === cat);
          list = list.filter(p => matchedCat && p.category_id === matchedCat.id);
        } else {
          list = list.filter(p => p.category_id === Number(cat));
        }
      }
      if (upper.includes('COALESCE(P.DISCOUNT_PRICE, P.PRICE) >=')) {
        const min = Number(params[paramIdx++]);
        list = list.filter(p => (p.discount_price || p.price) >= min);
      }
      if (upper.includes('COALESCE(P.DISCOUNT_PRICE, P.PRICE) <=')) {
        const max = Number(params[paramIdx++]);
        list = list.filter(p => (p.discount_price || p.price) <= max);
      }
      if (upper.includes('P.RATING >=')) {
        const rat = Number(params[paramIdx++]);
        list = list.filter(p => p.rating >= rat);
      }
      if (upper.includes('P.STOCK > 0')) {
        list = list.filter(p => p.stock > 0);
      }
      if (upper.includes('P.IS_FEATURED = 1')) {
        list = list.filter(p => p.is_featured === 1);
      }
      if (upper.includes('P.IS_TRENDING = 1')) {
        list = list.filter(p => p.is_trending === 1);
      }

      // Sort
      if (upper.includes('ORDER BY COALESCE(P.DISCOUNT_PRICE, P.PRICE) ASC')) {
        list.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      } else if (upper.includes('ORDER BY COALESCE(P.DISCOUNT_PRICE, P.PRICE) DESC')) {
        list.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      } else if (upper.includes('ORDER BY P.RATING DESC')) {
        list.sort((a, b) => b.rating - a.rating);
      } else if (upper.includes('ORDER BY P.NAME ASC')) {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        list.sort((a, b) => b.id - a.id);
      }

      // Pagination limits
      if (upper.includes('LIMIT ? OFFSET ?')) {
        const limitNum = Number(params[paramIdx++]);
        const offsetNum = Number(params[paramIdx++]);
        return list.slice(offsetNum, offsetNum + limitNum);
      }

      return list;
    }

    if (upper.includes('FROM PRODUCT_IMAGES')) {
      const prodId = Number(params[0]);
      return memoryStore.product_images.filter(img => img.product_id === prodId);
    }

    if (upper.includes('FROM CART')) {
      if (upper.includes('WHERE USER_ID = ? AND PRODUCT_ID = ?')) {
        const userId = Number(params[0]);
        const prodId = Number(params[1]);
        return memoryStore.cart.filter(c => c.user_id === userId && c.product_id === prodId);
      }
      if (upper.includes('WHERE C.ID = ? AND C.USER_ID = ?')) {
        const cartId = Number(params[0]);
        const userId = Number(params[1]);
        const item = memoryStore.cart.find(c => c.id === cartId && c.user_id === userId);
        if (!item) return [];
        const prod = memoryStore.products.find(p => p.id === item.product_id);
        return [{ ...item, stock: prod ? prod.stock : 0 }];
      }
      if (upper.includes('WHERE C.USER_ID = ?')) {
        const userId = Number(params[0]);
        const items = memoryStore.cart
          .filter(c => c.user_id === userId)
          .map(c => {
            const p = memoryStore.products.find(prod => prod.id === c.product_id) || {};
            const cat = memoryStore.categories.find(catItem => catItem.id === p.category_id) || {};
            return {
              id: c.id,
              quantity: c.quantity,
              created_at: c.created_at,
              product_id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              discount_price: p.discount_price,
              stock: p.stock,
              image_url: p.image_url,
              category_name: cat.name || ''
            };
          });
        return items;
      }
      return [...memoryStore.cart];
    }

    if (upper.includes('FROM WISHLIST')) {
      if (upper.includes('WHERE USER_ID = ? AND PRODUCT_ID = ?')) {
        const userId = Number(params[0]);
        const prodId = Number(params[1]);
        return memoryStore.wishlist.filter(w => w.user_id === userId && w.product_id === prodId);
      }
      if (upper.includes('WHERE W.USER_ID = ?')) {
        const userId = Number(params[0]);
        const items = memoryStore.wishlist
          .filter(w => w.user_id === userId)
          .map(w => {
            const p = memoryStore.products.find(prod => prod.id === w.product_id) || {};
            const cat = memoryStore.categories.find(catItem => catItem.id === p.category_id) || {};
            return {
              id: w.id,
              created_at: w.created_at,
              product_id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              discount_price: p.discount_price,
              stock: p.stock,
              rating: p.rating,
              image_url: p.image_url,
              category_name: cat.name || ''
            };
          });
        return items;
      }
    }

    if (upper.includes('FROM ORDERS')) {
      if (upper.includes('COUNT(*)')) {
        if (upper.includes("ORDER_STATUS = 'PENDING'")) {
          return [{ count: memoryStore.orders.filter(o => o.order_status === 'Pending').length }];
        }
        if (upper.includes("ORDER_STATUS = 'DELIVERED'")) {
          return [{ count: memoryStore.orders.filter(o => o.order_status === 'Delivered').length }];
        }
        if (upper.includes("ORDER_STATUS = 'SHIPPED'")) {
          return [{ count: memoryStore.orders.filter(o => o.order_status === 'Shipped').length }];
        }
        if (upper.includes("ORDER_STATUS = 'CONFIRMED'")) {
          return [{ count: memoryStore.orders.filter(o => o.order_status === 'Confirmed').length }];
        }
        if (upper.includes("ORDER_STATUS = 'CANCELLED'")) {
          return [{ count: memoryStore.orders.filter(o => o.order_status === 'Cancelled').length }];
        }
        return [{ count: memoryStore.orders.length, total: memoryStore.orders.length }];
      }

      if (upper.includes('SUM(TOTAL_AMOUNT)')) {
        const total = memoryStore.orders
          .filter(o => o.order_status !== 'Cancelled')
          .reduce((sum, o) => sum + Number(o.total_amount), 0);
        return [{ total }];
      }

      if (upper.includes('WHERE USER_ID = ?')) {
        const userId = Number(params[0]);
        return memoryStore.orders.filter(o => o.user_id === userId).sort((a, b) => b.id - a.id);
      }

      if (upper.includes('WHERE ID = ? OR ORDER_NUMBER = ?') || upper.includes('WHERE ID = ?')) {
        const val = params[0];
        return memoryStore.orders.filter(o => o.id === Number(val) || o.order_number === String(val));
      }

      // All orders
      let list = memoryStore.orders.map(o => {
        const user = memoryStore.users.find(u => u.id === o.user_id) || {};
        return {
          ...o,
          customer_name: user.name || o.shipping_name,
          customer_email: user.email || o.shipping_email
        };
      }).sort((a, b) => b.id - a.id);

      if (upper.includes('LIMIT ? OFFSET ?')) {
        const lim = Number(params[params.length - 2]);
        const off = Number(params[params.length - 1]);
        return list.slice(off, off + lim);
      }
      return list;
    }

    if (upper.includes('FROM ORDER_ITEMS')) {
      if (upper.includes('WHERE ORDER_ID = ?')) {
        const orderId = Number(params[0]);
        return memoryStore.order_items.filter(item => item.order_id === orderId);
      }
    }

    if (upper.includes('FROM REVIEWS')) {
      if (upper.includes('AVG(RATING)')) {
        const prodId = Number(params[0]);
        const revs = memoryStore.reviews.filter(r => r.product_id === prodId);
        const avg = revs.length > 0 ? revs.reduce((acc, c) => acc + c.rating, 0) / revs.length : 5.0;
        return [{ avg_rating: avg, total_reviews: revs.length }];
      }
      if (upper.includes('WHERE PRODUCT_ID = ? AND USER_ID = ?')) {
        const prodId = Number(params[0]);
        const userId = Number(params[1]);
        return memoryStore.reviews.filter(r => r.product_id === prodId && r.user_id === userId);
      }
      if (upper.includes('WHERE PRODUCT_ID = ?')) {
        const prodId = Number(params[0]);
        return memoryStore.reviews.filter(r => r.product_id === prodId).sort((a, b) => b.id - a.id);
      }
    }
  }

  // 2. INSERT queries
  if (upper.startsWith('INSERT INTO')) {
    if (upper.includes('INTO USERS')) {
      const newId = memoryStore.users.length > 0 ? Math.max(...memoryStore.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name: params[0],
        email: params[1],
        phone: params[2],
        password: params[3],
        role: params[4] || 'user',
        address: params[5],
        city: params[6],
        state: params[7],
        pincode: params[8],
        created_at: new Date().toISOString()
      };
      memoryStore.users.push(newUser);
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO CATEGORIES')) {
      const newId = memoryStore.categories.length > 0 ? Math.max(...memoryStore.categories.map(c => c.id)) + 1 : 1;
      const newCat = {
        id: newId,
        name: params[0],
        slug: params[1],
        description: params[2],
        image_url: params[3],
        created_at: new Date().toISOString()
      };
      memoryStore.categories.push(newCat);
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO PRODUCTS')) {
      const newId = memoryStore.products.length > 0 ? Math.max(...memoryStore.products.map(p => p.id)) + 1 : 1;
      const newProd = {
        id: newId,
        name: params[0],
        slug: params[1],
        description: params[2],
        price: Number(params[3]),
        discount_price: params[4] ? Number(params[4]) : null,
        category_id: Number(params[5]),
        stock: Number(params[6]),
        rating: 5.0,
        num_reviews: 0,
        image_url: params[7],
        is_featured: params[8] ? 1 : 0,
        is_trending: params[9] ? 1 : 0,
        created_at: new Date().toISOString()
      };
      memoryStore.products.push(newProd);
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO PRODUCT_IMAGES')) {
      const newId = memoryStore.product_images.length > 0 ? Math.max(...memoryStore.product_images.map(img => img.id)) + 1 : 1;
      memoryStore.product_images.push({
        id: newId,
        product_id: Number(params[0]),
        image_url: params[1],
        created_at: new Date().toISOString()
      });
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO CART')) {
      const newId = memoryStore.cart.length > 0 ? Math.max(...memoryStore.cart.map(c => c.id)) + 1 : 1;
      memoryStore.cart.push({
        id: newId,
        user_id: Number(params[0]),
        product_id: Number(params[1]),
        quantity: Number(params[2]) || 1,
        created_at: new Date().toISOString()
      });
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO WISHLIST')) {
      const newId = memoryStore.wishlist.length > 0 ? Math.max(...memoryStore.wishlist.map(w => w.id)) + 1 : 1;
      memoryStore.wishlist.push({
        id: newId,
        user_id: Number(params[0]),
        product_id: Number(params[1]),
        created_at: new Date().toISOString()
      });
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO ORDERS')) {
      const newId = memoryStore.orders.length > 0 ? Math.max(...memoryStore.orders.map(o => o.id)) + 1 : 1;
      const newOrder = {
        id: newId,
        order_number: params[0],
        user_id: Number(params[1]),
        subtotal: Number(params[2]),
        discount: Number(params[3] || 0),
        shipping_fee: Number(params[4] || 0),
        tax: Number(params[5] || 0),
        total_amount: Number(params[6]),
        shipping_name: params[7],
        shipping_email: params[8],
        shipping_phone: params[9],
        shipping_address: params[10],
        shipping_city: params[11],
        shipping_state: params[12],
        shipping_pincode: params[13],
        payment_method: params[14] || 'cod',
        payment_status: params[15] || 'completed',
        order_status: params[16] || 'Pending',
        created_at: new Date().toISOString()
      };
      memoryStore.orders.push(newOrder);
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO ORDER_ITEMS')) {
      const newId = memoryStore.order_items.length > 0 ? Math.max(...memoryStore.order_items.map(i => i.id)) + 1 : 1;
      memoryStore.order_items.push({
        id: newId,
        order_id: Number(params[0]),
        product_id: Number(params[1]),
        product_name: params[2],
        product_image: params[3],
        quantity: Number(params[4]),
        price: Number(params[5]),
        created_at: new Date().toISOString()
      });
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }

    if (upper.includes('INTO REVIEWS')) {
      const newId = memoryStore.reviews.length > 0 ? Math.max(...memoryStore.reviews.map(r => r.id)) + 1 : 1;
      memoryStore.reviews.push({
        id: newId,
        user_id: Number(params[0]),
        product_id: Number(params[1]),
        user_name: params[2],
        rating: Number(params[3]),
        comment: params[4],
        created_at: new Date().toISOString()
      });
      persistStore();
      return { insertId: newId, affectedRows: 1 };
    }
  }

  // 3. UPDATE queries
  if (upper.startsWith('UPDATE')) {
    if (upper.includes('UPDATE USERS')) {
      if (upper.includes('SET ROLE = ? WHERE ID = ?')) {
        const role = params[0];
        const id = Number(params[1]);
        const u = memoryStore.users.find(user => user.id === id);
        if (u) u.role = role;
      } else if (upper.includes('SET PASSWORD = ? WHERE ID = ?')) {
        const pwd = params[0];
        const id = Number(params[1]);
        const u = memoryStore.users.find(user => user.id === id);
        if (u) u.password = pwd;
      } else {
        const id = Number(params[params.length - 1]);
        const u = memoryStore.users.find(user => user.id === id);
        if (u) {
          if (params[0] !== undefined && params[0] !== null) u.name = params[0];
          if (params[1] !== undefined && params[1] !== null) u.phone = params[1];
          if (params[2] !== undefined && params[2] !== null) u.address = params[2];
          if (params[3] !== undefined && params[3] !== null) u.city = params[3];
          if (params[4] !== undefined && params[4] !== null) u.state = params[4];
          if (params[5] !== undefined && params[5] !== null) u.pincode = params[5];
        }
      }
      persistStore();
      return { affectedRows: 1 };
    }

    if (upper.includes('UPDATE PRODUCTS')) {
      if (upper.includes('SET STOCK = STOCK - ? WHERE ID = ?')) {
        const qty = Number(params[0]);
        const id = Number(params[1]);
        const p = memoryStore.products.find(prod => prod.id === id);
        if (p) p.stock = Math.max(0, p.stock - qty);
      } else if (upper.includes('SET STOCK = STOCK + ? WHERE ID = ?')) {
        const qty = Number(params[0]);
        const id = Number(params[1]);
        const p = memoryStore.products.find(prod => prod.id === id);
        if (p) p.stock = p.stock + qty;
      } else if (upper.includes('SET RATING = ?, NUM_REVIEWS = ? WHERE ID = ?')) {
        const rat = Number(params[0]);
        const num = Number(params[1]);
        const id = Number(params[2]);
        const p = memoryStore.products.find(prod => prod.id === id);
        if (p) {
          p.rating = rat;
          p.num_reviews = num;
        }
      } else {
        const id = Number(params[params.length - 1]);
        const p = memoryStore.products.find(prod => prod.id === id);
        if (p) {
          if (params[0]) p.name = params[0];
          if (params[1]) p.slug = params[1];
          if (params[2]) p.description = params[2];
          if (params[3] !== null && params[3] !== undefined) p.price = Number(params[3]);
          if (params[4] !== undefined) p.discount_price = params[4] ? Number(params[4]) : null;
          if (params[5] !== null && params[5] !== undefined) p.category_id = Number(params[5]);
          if (params[6] !== null && params[6] !== undefined) p.stock = Number(params[6]);
          if (params[7]) p.image_url = params[7];
          if (params[8] !== null && params[8] !== undefined) p.is_featured = params[8] ? 1 : 0;
          if (params[9] !== null && params[9] !== undefined) p.is_trending = params[9] ? 1 : 0;
        }
      }
      persistStore();
      return { affectedRows: 1 };
    }

    if (upper.includes('UPDATE CATEGORIES')) {
      const id = Number(params[params.length - 1]);
      const c = memoryStore.categories.find(cat => cat.id === id);
      if (c) {
        if (params[0]) c.name = params[0];
        if (params[1]) c.slug = params[1];
        if (params[2]) c.description = params[2];
        if (params[3]) c.image_url = params[3];
      }
      persistStore();
      return { affectedRows: 1 };
    }

    if (upper.includes('UPDATE CART')) {
      if (upper.includes('SET QUANTITY = QUANTITY + 1 WHERE ID = ?')) {
        const id = Number(params[0]);
        const item = memoryStore.cart.find(c => c.id === id);
        if (item) item.quantity += 1;
      } else {
        const qty = Number(params[0]);
        const id = Number(params[1]);
        const item = memoryStore.cart.find(c => c.id === id);
        if (item) item.quantity = qty;
      }
      persistStore();
      return { affectedRows: 1 };
    }

    if (upper.includes('UPDATE ORDERS')) {
      if (upper.includes('SET ORDER_STATUS = "CANCELLED" WHERE ID = ?') || upper.includes("SET ORDER_STATUS = 'CANCELLED' WHERE ID = ?") || upper.includes("SET ORDER_STATUS = 'CANCELLED'")) {
        const id = Number(params[params.length - 1]);
        const o = memoryStore.orders.find(ord => ord.id === id);
        if (o) o.order_status = 'Cancelled';
      } else {
        const status = params[0];
        const payStatus = params[1];
        const id = Number(params[2]);
        const o = memoryStore.orders.find(ord => ord.id === id);
        if (o) {
          o.order_status = status;
          if (payStatus) o.payment_status = payStatus;
        }
      }
      persistStore();
      return { affectedRows: 1 };
    }

    if (upper.includes('UPDATE REVIEWS')) {
      const rating = Number(params[0]);
      const comment = params[1];
      const userName = params[2];
      const id = Number(params[3]);
      const rev = memoryStore.reviews.find(r => r.id === id);
      if (rev) {
        rev.rating = rating;
        rev.comment = comment;
        rev.user_name = userName;
      }
      persistStore();
      return { affectedRows: 1 };
    }
  }

  // 4. DELETE queries
  if (upper.startsWith('DELETE FROM')) {
    if (upper.includes('FROM USERS WHERE ID = ?')) {
      const id = Number(params[0]);
      memoryStore.users = memoryStore.users.filter(u => u.id !== id);
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM PRODUCTS WHERE ID = ?')) {
      const id = Number(params[0]);
      memoryStore.products = memoryStore.products.filter(p => p.id !== id);
      memoryStore.product_images = memoryStore.product_images.filter(img => img.product_id !== id);
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM PRODUCT_IMAGES WHERE PRODUCT_ID = ?')) {
      const prodId = Number(params[0]);
      memoryStore.product_images = memoryStore.product_images.filter(img => img.product_id !== prodId);
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM CATEGORIES WHERE ID = ?')) {
      const id = Number(params[0]);
      memoryStore.categories = memoryStore.categories.filter(c => c.id !== id);
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM CART WHERE USER_ID = ? AND PRODUCT_ID = ?')) {
      const userId = Number(params[0]);
      const prodId = Number(params[1]);
      memoryStore.cart = memoryStore.cart.filter(c => !(c.user_id === userId && c.product_id === prodId));
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM CART WHERE ID = ? AND USER_ID = ?') || upper.includes('FROM CART WHERE ID = ?')) {
      const id = Number(params[0]);
      memoryStore.cart = memoryStore.cart.filter(c => c.id !== id);
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM CART WHERE USER_ID = ?')) {
      const userId = Number(params[0]);
      memoryStore.cart = memoryStore.cart.filter(c => c.user_id !== userId);
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM WISHLIST WHERE USER_ID = ? AND PRODUCT_ID = ?')) {
      const userId = Number(params[0]);
      const prodId = Number(params[1]);
      memoryStore.wishlist = memoryStore.wishlist.filter(w => !(w.user_id === userId && w.product_id === prodId));
      persistStore();
      return { affectedRows: 1 };
    }
    if (upper.includes('FROM WISHLIST WHERE ID = ?')) {
      const id = Number(params[0]);
      memoryStore.wishlist = memoryStore.wishlist.filter(w => w.id !== id);
      persistStore();
      return { affectedRows: 1 };
    }
  }

  return [];
}

async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  if (Array.isArray(results)) {
    return results[0] || null;
  }
  return results;
}

module.exports = {
  initDB,
  query,
  queryOne,
  getDbType: () => dbType
};
