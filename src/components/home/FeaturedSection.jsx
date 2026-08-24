import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../common/ProductCard';
import { ProductGridSkeleton } from '../common/SkeletonLoader';
import { Sparkles, TrendingUp, Award, ArrowRight } from 'lucide-react';

export const FeaturedSection = ({ products = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState('featured'); // 'featured', 'trending', 'topRated'

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'featured') return p.is_featured === 1;
    if (activeTab === 'trending') return p.is_trending === 1;
    if (activeTab === 'topRated') return (p.rating || 0) >= 4.8;
    return true;
  }).slice(0, 8);

  const displayList = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 8);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Handpicked Essentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Featured & Trending Products
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-dark-800 border border-gray-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'featured'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trending'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('topRated')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'topRated'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Top Rated
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : displayList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl">
            <p className="text-gray-400 text-sm">No products found in this category.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-dark-800 hover:bg-dark-750 text-gray-200 hover:text-white border border-gray-700 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg text-sm group"
          >
            <span>Explore All 24+ Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
