import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Check
} from 'lucide-react';
import { showToast } from './Toast';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('🎉 Thank you for subscribing! Your 20% discount code is SPHERE20', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-dark-950 border-t border-gray-800/80 text-gray-400 mt-20">
      {/* Value Proposition Banners */}
      <div className="border-b border-gray-800/60 bg-dark-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-100">Free Worldwide Delivery</h4>
                <p className="text-xs text-gray-400">On all eligible orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-100">100% Authentic Products</h4>
                <p className="text-xs text-gray-400">Directly from certified manufacturers</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
              <div className="p-3 rounded-xl bg-accent-amber/10 text-amber-400 border border-accent-amber/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-100">30-Day Hassle-Free Returns</h4>
                <p className="text-xs text-gray-400">Instant replacements or refunds</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
              <div className="p-3 rounded-xl bg-accent-cyan/10 text-cyan-400 border border-accent-cyan/20">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-100">24/7 Priority Support</h4>
                <p className="text-xs text-gray-400">Live chat & dedicated concierge</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-600/30">
                <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-brand-400" />
                </div>
              </div>
              <span className="text-2xl font-extrabold text-white">
                Shop<span className="text-brand-400">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Discover cutting-edge electronics, high-fashion apparel, pro gaming setups, and modern living essentials curated for taste and performance.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2">
                Join our VIP Club for Exclusive Deals
              </h5>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-dark-800 border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-1.5 shadow-lg shadow-brand-600/20 transition-all shrink-0"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-gray-100 uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics & Audio</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-white transition-colors">Designer Apparel</Link></li>
              <li><Link to="/products?category=shoes" className="hover:text-white transition-colors">Footwear & Sneakers</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-white transition-colors">Watches & Leather</Link></li>
              <li><Link to="/products?category=home-living" className="hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=gaming" className="hover:text-white transition-colors">Gaming Gear</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-gray-100 uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">User Profile</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Account Login</Link></li>
            </ul>
          </div>

          {/* Security & Badges */}
          <div>
            <h4 className="text-sm font-bold text-gray-100 uppercase tracking-wider mb-4">Payment Methods</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-gray-300">
              <span className="p-2 rounded-lg bg-dark-800 border border-gray-800">VISA</span>
              <span className="p-2 rounded-lg bg-dark-800 border border-gray-800">MC</span>
              <span className="p-2 rounded-lg bg-dark-800 border border-gray-800">AMEX</span>
              <span className="p-2 rounded-lg bg-dark-800 border border-gray-800">APPLE</span>
              <span className="p-2 rounded-lg bg-dark-800 border border-gray-800">PAYPAL</span>
              <span className="p-2 rounded-lg bg-dark-800 border border-gray-800">COD</span>
            </div>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              Protected by 256-bit SSL encryption. All transactions are securely processed.
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-10 mt-10 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
