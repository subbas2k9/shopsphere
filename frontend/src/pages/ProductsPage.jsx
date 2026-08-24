import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';
import { RatingStars } from '../components/common/RatingStars';
import api from '../services/api';
import {
  Filter,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  Grid3X3,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  PackageX
} from 'lucide-react';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters State synced with URL parameters
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  // Local state for mobile filter drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters or search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryParam && categoryParam !== 'all') params.set('category', categoryParam);
        if (searchParam) params.set('search', searchParam);
        if (sortParam) params.set('sort', sortParam);
        if (minPriceParam) params.set('minPrice', minPriceParam);
        if (maxPriceParam) params.set('maxPrice', maxPriceParam);
        if (ratingParam) params.set('rating', ratingParam);
        if (inStockParam) params.set('inStock', 'true');
        params.set('page', pageParam);
        params.set('limit', 12);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products || []);
          setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, searchParam, sortParam, minPriceParam, maxPriceParam, ratingParam, inStockParam, pageParam]);

  // Update URL helper
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'all' || value === false) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', 1); // Reset page on filter change
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    categoryParam !== 'all' ||
    !!searchParam ||
    !!minPriceParam ||
    !!maxPriceParam ||
    !!ratingParam ||
    inStockParam;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner / Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {searchParam ? `Results for "${searchParam}"` : categoryParam !== 'all' ? `${categoryParam.toUpperCase()} Collection` : 'All Products'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Explore our complete selection of curated, premium goods.
        </p>
      </div>

      {/* Main Layout Grid (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-6 sticky top-28">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-400" />
                <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider">Filters</h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateFilter('category', 'all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    categoryParam === 'all'
                      ? 'bg-brand-600/20 text-brand-300 font-bold border border-brand-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      categoryParam === c.slug
                        ? 'bg-brand-600/20 text-brand-300 font-bold border border-brand-500/30'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">({c.product_count || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">Price Range ($)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">Customer Rating</h3>
              <div className="space-y-1.5">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateFilter('rating', ratingParam === String(r) ? '' : String(r))}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      ratingParam === String(r)
                        ? 'bg-brand-600/20 text-brand-300 font-bold border border-brand-500/30'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <RatingStars rating={r} size="xs" />
                      <span>{r}★ & Up</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-4 border-t border-gray-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateFilter('inStock', e.target.checked)}
                  className="rounded border-gray-700 bg-dark-800 text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
              </label>
            </div>

          </div>
        </aside>

        {/* Products Column */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Top Bar: Count, Sort Dropdown & View Mode */}
          <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-gray-800">
            
            {/* Results Count & Mobile Filter Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 border border-gray-700 text-xs font-bold text-gray-200"
              >
                <Filter className="w-3.5 h-3.5 text-brand-400" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>

              <span className="text-xs text-gray-400 font-medium">
                Showing <span className="font-bold text-white">{products.length}</span> of <span className="font-bold text-white">{pagination.total}</span> products
              </span>
            </div>

            {/* Sort & Grid Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortParam}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="bg-dark-800 border border-gray-700 text-xs text-gray-200 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center gap-1 border-l border-gray-800 pl-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-dark-700 text-brand-400' : 'text-gray-400 hover:text-white'}`}
                  aria-label="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-dark-700 text-brand-400' : 'text-gray-400 hover:text-white'}`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
              {categoryParam !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Category: {categoryParam}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('category', 'all')} />
                </span>
              )}
              {searchParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Search: "{searchParam}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('search', '')} />
                </span>
              )}
              {minPriceParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Min: ${minPriceParam}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('minPrice', '')} />
                </span>
              )}
              {maxPriceParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Max: ${maxPriceParam}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('maxPrice', '')} />
                </span>
              )}
              {ratingParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Rating: {ratingParam}★+
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('rating', '')} />
                </span>
              )}
              {inStockParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  In Stock
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('inStock', false)} />
                </span>
              )}
            </div>
          )}

          {/* Product Grid / List */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center border border-gray-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto text-gray-500">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-200">No Products Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                We couldn't find any products matching your specific filters. Try expanding your search criteria or resetting filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', pagination.page - 1)}
                className="p-2.5 rounded-xl bg-dark-800 border border-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateFilter('page', pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === pageNum
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                        : 'bg-dark-800 border border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilter('page', pagination.page + 1)}
                className="p-2.5 rounded-xl bg-dark-800 border border-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-dark-900 h-full p-6 overflow-y-auto space-y-6 border-l border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 className="text-base font-bold text-white">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => { updateFilter('category', 'all'); setMobileFiltersOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs ${categoryParam === 'all' ? 'bg-brand-600 text-white font-bold' : 'text-gray-400'}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { updateFilter('category', c.slug); setMobileFiltersOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs ${categoryParam === c.slug ? 'bg-brand-600 text-white font-bold' : 'text-gray-400'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price inputs */}
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 text-xs text-gray-200 rounded-lg p-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 text-xs text-gray-200 rounded-lg p-2"
                />
              </div>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
