-- ==========================================================
-- ShopSphere Sample Seed Data
-- ==========================================================

USE shopsphere_db;

-- 1. Insert Initial Users
-- Passwords below are hashed for:
-- admin@shopsphere.com -> Admin@123 ($2a$10$0p2y9R8E3X1jZ0i/2Vj8veb1rIknKk3bU4p2nKzZJdD2Z1e6uG7j2)
-- john@example.com -> User@123 ($2a$10$0p2y9R8E3X1jZ0i/2Vj8veb1rIknKk3bU4p2nKzZJdD2Z1e6uG7j2)

INSERT INTO users (id, name, email, phone, password, role, address, city, state, pincode) VALUES
(1, 'Admin Master', 'admin@shopsphere.com', '+1 (555) 019-2834', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6FeE2aI2zVfF4y06q', 'admin', '742 Evergreen Terrace', 'Springfield', 'OR', '97477'),
(2, 'John Doe', 'john@example.com', '+1 (555) 345-6789', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6FeE2aI2zVfF4y06q', 'user', '123 Market Street, Apt 4B', 'San Francisco', 'CA', '94103'),
(3, 'Sarah Connor', 'sarah@example.com', '+1 (555) 987-6543', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6FeE2aI2zVfF4y06q', 'user', '456 Elm Street', 'Los Angeles', 'CA', '90001')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
(1, 'Electronics', 'electronics', 'Cutting-edge gadgets, laptops, audio gear, and smart devices.', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80'),
(2, 'Fashion', 'fashion', 'Contemporary apparel, designer streetwear, and timeless classics.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80'),
(3, 'Shoes', 'shoes', 'Premium sneakers, athletic running shoes, and formal footwear.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'),
(4, 'Accessories', 'accessories', 'Luxury watches, minimalist wallets, sunglasses, and travel packs.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'),
(5, 'Home & Living', 'home-living', 'Modern home aesthetics, acoustic lamps, ergonomic decor, and kitchenware.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'),
(6, 'Gaming', 'gaming', 'Pro-tier mechanical keyboards, high-refresh monitors, and gaming gear.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Products (24 Items)
INSERT INTO products (id, name, slug, description, price, discount_price, category_id, stock, rating, num_reviews, image_url, is_featured, is_trending) VALUES
-- Electronics
(1, 'Aura ANC Wireless Headphones', 'aura-anc-wireless-headphones', 'Engineered with studio-grade 40mm beryllium drivers, 45-hour battery life, and active hybrid noise cancellation for an unparalleled acoustic experience.', 299.99, 249.99, 1, 35, 4.9, 28, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 1, 1),
(2, 'NovaBook Pro 16 M3 Ultra', 'novabook-pro-16-m3-ultra', 'Equipped with a vivid 120Hz Liquid Retina XDR display, 32GB unified memory, and aerospace aluminum chassis designed for high-performance creators.', 1899.00, 1749.00, 1, 12, 4.8, 19, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 1, 0),
(3, 'SonicPulse Smart Speaker Hub', 'sonicpulse-smart-speaker-hub', '360-degree spatial sound with integrated voice assistant, ambient glow ring, and smart home Zigbee hub connectivity.', 129.99, 99.99, 1, 50, 4.6, 14, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80', 0, 1),
(4, 'VisionCraft Mirrorless 4K Camera', 'visioncraft-mirrorless-4k-camera', 'Full-frame 45MP sensor capable of 8K video capture, dual card slots, and lightning-fast subject-tracking autofocus.', 1499.00, 1399.00, 1, 8, 4.9, 31, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', 1, 1),

-- Fashion
(5, 'Obsidian Merino Wool Overcoat', 'obsidian-merino-wool-overcoat', 'Tailored from 100% sustainably sourced Italian merino wool with a relaxed silhouette and weather-resistant satin lining.', 340.00, 289.00, 2, 20, 4.7, 16, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80', 1, 0),
(6, 'Minimalist Oversized Heavy Hoodie', 'minimalist-oversized-heavy-hoodie', 'Crafted from 480 GSM organic cotton fleece with dropped shoulders, raw cut aesthetics, and pre-shrunk luxury weave.', 89.00, 75.00, 2, 60, 4.8, 42, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', 0, 1),
(7, 'Vintage Washed Denim Trucker Jacket', 'vintage-washed-denim-trucker-jacket', 'Classic relaxed fit Japanese selvedge denim jacket with custom antique bronze hardware and subtle distressing.', 145.00, 119.00, 2, 25, 4.6, 22, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80', 0, 0),
(8, 'Silk Blend Resort Casual Shirt', 'silk-blend-resort-casual-shirt', 'Breathable camp-collar shirt rendered in fluid mulberry silk-viscose blend, featuring subtle botanical jacquard weaving.', 95.00, 79.99, 2, 40, 4.5, 11, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', 0, 1),

-- Shoes
(9, 'Apex Runner Carbon Max', 'apex-runner-carbon-max', 'Propulsive full-length carbon fiber plate coupled with dual-density nitrogen infused foam for marathon-ready cushioning.', 199.99, 169.99, 3, 45, 4.9, 53, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', 1, 1),
(10, 'Urban Glide Classic Leather Sneakers', 'urban-glide-classic-leather-sneakers', 'Handcrafted full-grain calfskin leather low-tops with ergonomic memory foam insoles and stitched margom cupsole.', 160.00, 135.00, 3, 30, 4.7, 34, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80', 1, 0),
(11, 'TerraTrek Waterproof Trail Boots', 'terratrek-waterproof-trail-boots', 'Rugged Vibram Megagrip lug outsole, breathable eVent waterproof membrane, and reinforced TPU toe guard.', 220.00, 189.00, 3, 18, 4.8, 19, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80', 0, 1),
(12, 'Derby Goodyear Welted Oxford Shoes', 'derby-goodyear-welted-oxford-shoes', 'Polished French box calf leather construction featuring traditional Goodyear welted leather soles for executive elegance.', 275.00, 240.00, 3, 15, 4.6, 9, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80', 0, 0),

-- Accessories
(13, 'Chronograph Automatic Sapphire Watch', 'chronograph-automatic-sapphire-watch', 'Swiss automatic movement with 42-hour power reserve, anti-reflective sapphire crystal, and 316L stainless steel bracelet.', 450.00, 395.00, 4, 14, 4.9, 27, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 1, 1),
(14, 'Carbon Minimalist RFID-Shield Wallet', 'carbon-minimalist-rfid-shield-wallet', 'Aerospace carbon fiber and anodized aluminum cardholder holding up to 12 cards with integrated cash strap.', 65.00, 49.99, 4, 80, 4.7, 61, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80', 0, 1),
(15, 'Nomad Weatherproof Tech Backpack 24L', 'nomad-weatherproof-tech-backpack-24l', 'Cordura ballistic nylon with magnetic Fidlock buckles, dedicated 16-inch fleece laptop sleeve, and luggage passthrough.', 185.00, 155.00, 4, 28, 4.8, 38, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 1, 0),
(16, 'Polarized Titanium Aviator Sunglasses', 'polarized-titanium-aviator-sunglasses', 'Ultralight 18-gram titanium frame with 100% UV400 polarized nylon lenses and anti-scratch hydrophobic coating.', 140.00, 115.00, 4, 35, 4.6, 17, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80', 0, 0),

-- Home & Living
(17, 'Lumina Smart Ambient Bar Table Lamp', 'lumina-smart-ambient-bar-table-lamp', 'Dimmable color temperature from 1800K to 6500K with wireless magnetic charging base and brushed brass finish.', 110.00, 89.00, 5, 22, 4.8, 15, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', 1, 1),
(18, 'AeroPress Precision Espresso Machine', 'aeropress-precision-espresso-machine', 'Dual boiler system with PID temperature control, commercial 58mm portafilter, and instant steam wand.', 699.00, 599.00, 5, 10, 4.9, 21, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80', 1, 0),
(19, 'Nordic Ergonomic Lounge Recliner', 'nordic-ergonomic-lounge-recliner', 'Sculptural plywood shell upholstered in supple top-grain leather with 360-degree aluminum swivel base.', 850.00, 750.00, 5, 7, 4.7, 8, 'https://images.unsplash.com/photo-1580481077191-23d7265a7d97?w=800&auto=format&fit=crop&q=80', 0, 0),
(20, 'Ceramic Minimalist Pour-Over Set', 'ceramic-minimalist-pour-over-set', 'Artisan matte black stoneware dripper with double-walled thermal glass carafe and measuring spoon.', 55.00, 45.00, 5, 40, 4.6, 19, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', 0, 1),

-- Gaming
(21, 'Vortex Pro Wireless Mechanical Keyboard', 'vortex-pro-wireless-mechanical-keyboard', 'Gasket-mounted hot-swappable tactile switches, per-key RGB backlighting, rotary volume knob, and low-latency 2.4GHz.', 169.99, 139.99, 6, 32, 4.9, 44, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 1, 1),
(22, 'Phantom 4K 240Hz OLED Gaming Monitor 32"', 'phantom-4k-240hz-oled-gaming-monitor-32', 'Blazing 0.03ms response time, 99% DCI-P3 color gamut, HDR True Black 400, and integrated KVM switch.', 999.00, 899.00, 6, 11, 4.9, 29, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', 1, 1),
(23, 'Spectre Ultralight Wireless Gaming Mouse', 'spectre-ultralight-wireless-gaming-mouse', 'Featherweight 49-gram magnesium alloy honeycomb shell, 30K optical sensor, and 4000Hz polling rate receiver.', 119.00, 99.00, 6, 50, 4.8, 36, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80', 0, 1),
(24, 'Quantum 7.1 Spatial Audio Gaming Headset', 'quantum-7-1-spatial-audio-gaming-headset', 'Planar magnetic audio drivers with detachable broadcast-grade condenser microphone and cooling gel ear cushions.', 179.99, 149.99, 6, 26, 4.7, 18, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop&q=80', 0, 0)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Product Gallery Images
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'),
(1, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'),
(1, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'),
(2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'),
(2, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'),
(9, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'),
(9, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80'),
(13, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'),
(13, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'),
(21, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'),
(21, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80');

-- 5. Insert Sample Customer Reviews
INSERT INTO reviews (user_id, product_id, user_name, rating, comment) VALUES
(2, 1, 'John Doe', 5, 'The soundstage and active noise cancellation on these headphones are unbelievable! Battery lasts almost a whole week of work sessions.'),
(3, 1, 'Sarah Connor', 5, 'Extremely comfortable memory foam ear cushions. The finish feels ultra-premium.'),
(2, 9, 'John Doe', 5, 'Ran my first marathon in these. The carbon plate propulsion really shaved minutes off my personal best!'),
(3, 13, 'Sarah Connor', 4, 'Stunning timepiece. Sapphire crystal is totally scratch resistant so far, compliments everywhere I go.'),
(2, 21, 'John Doe', 5, 'Typing on this keyboard is pure bliss. Thocky sound profile straight out of the box.');
