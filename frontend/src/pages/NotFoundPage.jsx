import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="text-8xl font-black text-brand-500/30 tracking-widest font-mono">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-sm text-gray-400">
            Sorry, the page or item you're looking for doesn't exist or has moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-brand-600/30 transition-all text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 glass-card hover:border-gray-600 text-gray-200 hover:text-white font-semibold px-6 py-3 rounded-xl transition-all text-xs"
          >
            <Search className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
