import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Laptop, Shirt, Footprints, Watch, Home, Gamepad2 } from 'lucide-react';

const categoryIcons = {
  electronics: Laptop,
  fashion: Shirt,
  shoes: Footprints,
  accessories: Watch,
  'home-living': Home,
  gaming: Gamepad2
};

export const CategorySection = ({ categories = [] }) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Browse by Popular Category
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Laptop;

            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden glass-card p-4 flex flex-col items-center text-center hover:-translate-y-1.5 transition-all duration-300 border border-gray-800"
              >
                {/* Image Container with circular styling */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-3.5 bg-dark-800 relative p-0.5 border border-gray-700/60 group-hover:border-brand-500/50 transition-colors">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-[14px] group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-dark-950/20 group-hover:bg-transparent transition-colors rounded-[14px]" />
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-200 group-hover:text-brand-400 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-brand-400" />
                  <span className="truncate">{cat.name}</span>
                </div>

                <span className="text-[11px] text-gray-400 mt-0.5">
                  {cat.product_count !== undefined ? `${cat.product_count} Products` : 'Explore'}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
