# ShopSphere | Standalone React.js E-Commerce Platform (Vercel Ready)

**ShopSphere** is a modern, high-performance **React.js Single-Page Application (SPA)** built with **Vite, React Router, Tailwind CSS, and Lucide Icons**. It runs **100% on the frontend** with zero backend server dependencies, making it directly deployable to **Vercel**, Netlify, GitHub Pages, or any static hosting platform with one click.

---

## 🚀 One-Click Vercel Deployment

### Method 1: Deploy with Vercel CLI
```bash
# Inside the project root or frontend folder:
npx vercel
```

### Method 2: Deploy via GitHub & Vercel Dashboard
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. If asked for the Root Directory, you can leave it as default (Root) or select `frontend`.
5. Click **Deploy**!

---

## ✨ Features & Architecture

### 🛍️ Storefront & Customer Experience
- **Dynamic Homepage**: Obsidian glassmorphism design, featured collections, deal-of-the-day countdown, customer testimonials, and newsletter signup.
- **Product Catalog & Search**: Real-time keyword search, category filter, price range slider, star rating filters, in-stock toggles, and sorting options.
- **Product Detail**: Multi-image thumbnail gallery, live stock limit validation, interactive reviews submission, Add to Cart & Buy Now shortcuts.
- **Cart & Wishlist**: Real-time quantity adjustment, subtotal/shipping/tax calculation, persistent in-browser storage, and wishlist-to-cart migration.
- **Multi-Step Checkout**: Customer address form validation, payment options (Cash on Delivery & Card simulator), celebratory confetti animation, and instant order generation.
- **Orders History & Tracking**: Live order statuses (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`), printable receipt breakdown, and self-service order cancellation.

### 🛡️ Admin Management Portal (`/admin`)
- **Live Revenue & Sales Dashboard**: Metrics for total revenue, active orders, product inventory, and customer count.
- **Product Catalog Management**: Create, edit, and delete products, update prices, stock, images, and featured flags.
- **Category Management**: Create, edit, and delete categories with custom imagery.
- **Order Dispatch**: Review customer delivery details and transition order statuses in real-time.
- **User Management**: Inspect customer accounts, promote/revoke administrator privileges, and delete users.

### 🔑 Demo Credentials (1-Click Instant Login)
- **Administrator**: `admin@shopsphere.com` / `Admin@123`
- **Customer**: `john@example.com` / `User@123`
- *Note:* You can also click the quick **"Demo Admin"** or **"Demo Customer"** buttons on the top demo banner or login page for instant access.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Quick Start
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start local Vite dev server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Footer, Modals, ProductCards)
│   │   ├── context/          # React Contexts (AuthContext, CartContext, WishlistContext)
│   │   ├── data/             # Initial Store Seed Data (products, categories, users, orders)
│   │   ├── layouts/          # MainLayout & AdminLayout with Demo helpers
│   │   ├── pages/            # Public, Customer, and Admin pages
│   │   ├── services/         # mockDb.js (localStorage database) & api.js (Mock API client)
│   │   ├── App.jsx           # React Router route definitions
│   │   └── main.jsx          # React app entry point
│   ├── vercel.json           # Vercel SPA routing rewrite rules
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite build configuration
├── vercel.json               # Root Vercel deployment configuration
├── package.json              # Root build script
└── README.md
```
