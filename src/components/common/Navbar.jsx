import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ShieldCheck,
  Package,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishCount } = useWishlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  // Menus state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.data.success) {
          setSuggestions(res.data.products || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/products' },
    { name: 'Electronics', path: '/products?category=electronics' },
    { name: 'Fashion', path: '/products?category=fashion' },
    { name: 'Shoes', path: '/products?category=shoes' },
    { name: 'Gaming', path: '/products?category=gaming' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-navbar border-b border-gray-800/80">
      {/* Top Notification Promo Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-600 to-accent-cyan text-white text-xs font-medium py-1.5 px-4 text-center tracking-wide">
        <span className="inline-flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Free Express Shipping on all orders over $100 &bull; Use code <span className="font-bold underline">SPHERE20</span> for 20% off
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-brand-400 group-hover:text-accent-cyan transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight font-sans text-white">
                Shop<span className="text-brand-400">Sphere</span>
              </span>
              <span className="text-[10px] tracking-widest text-gray-400 font-semibold uppercase -mt-1">
                Luxury &bull; Tech &bull; Style
              </span>
            </div>
          </Link>

          {/* Search Bar with live auto-suggestions */}
          <div ref={searchRef} className="relative hidden md:flex flex-1 max-w-lg mx-6">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search premium electronics, sneakers, fashion..."
                className="w-full bg-dark-800/90 text-sm text-gray-200 placeholder-gray-500 pl-11 pr-10 py-2.5 rounded-xl border border-gray-700/60 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                  }}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-dark-800 border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="p-2 border-b border-gray-700/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Suggested Products
                </div>
                <div className="divide-y divide-gray-800">
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug || p.id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 p-3 hover:bg-dark-700/70 transition-colors"
                    >
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg bg-dark-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">{p.name}</p>
                        <p className="text-xs text-brand-400 font-semibold">
                          ${(p.discount_price || p.price).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-2 bg-dark-850 text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                  >
                    View all results for "{searchQuery}" &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl bg-dark-800/80 border border-gray-700/60 text-gray-300 hover:text-white hover:border-gray-600 transition-all hover:scale-105"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-dark-900">
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-dark-800/80 border border-gray-700/60 text-gray-300 hover:text-white hover:border-gray-600 transition-all hover:scale-105"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-dark-900">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-dark-800/80 border border-gray-700/60 hover:border-gray-600 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-gray-200 line-clamp-1 max-w-[100px]">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-brand-400 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-gray-700 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in divide-y divide-gray-700/50">
                    <div className="px-4 py-2.5">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-gray-100 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-400 hover:bg-dark-700/60 font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4 text-brand-400" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-200 hover:bg-dark-700/60"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-200 hover:bg-dark-700/60"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        My Orders
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-dark-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-dark-800 border border-gray-700 text-gray-300 hover:text-white md:hidden"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-gray-200" />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <div className="hidden md:flex items-center justify-center gap-8 py-2.5 border-t border-gray-800/60 text-xs font-medium text-gray-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`hover:text-brand-400 transition-colors ${
                location.pathname + location.search === link.path ? 'text-brand-400 font-bold' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-dark-900/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-dark-800 text-sm text-gray-200 placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl border border-gray-700"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </form>

          {/* Nav Links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-dark-800/60 text-sm text-gray-300 hover:text-white hover:bg-dark-700 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="flex gap-3 pt-3 border-t border-gray-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-dark-800 border border-gray-700 text-sm font-semibold text-gray-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-lg shadow-brand-600/30"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
