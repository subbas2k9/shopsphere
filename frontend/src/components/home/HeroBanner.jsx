import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';

export const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Glow Ambient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-accent-cyan/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-300 shadow-glow">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Summer 2026 Collection Is Now Live</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Experience Future <br />
              <span className="gradient-accent-text">Crafted Perfection</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover uncompromising precision in audio, powerhouse computing, designer fashion, and ergonomic home tech — engineered for modern lifestyles.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all text-sm"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/products?category=electronics"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass-card hover:border-gray-600 text-gray-200 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all text-sm"
              >
                <span>Latest Electronics</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-gray-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-white">24+</span>
                <span className="text-xs text-gray-400">Curated Goods</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-brand-400">4.9★</span>
                <span className="text-xs text-gray-400">Average Rating</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">100%</span>
                <span className="text-xs text-gray-400">Authentic Gear</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Card with floating elements */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden glass-card border border-gray-700/60 shadow-2xl p-3">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dark-950">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                    alt="Aura ANC Headphones"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent" />
                  
                  {/* Overlay Details */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-xs font-semibold text-brand-400 bg-brand-950/80 border border-brand-500/30 px-2.5 py-1 rounded-full">
                        Deal of the Week
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">Aura ANC Wireless Headphones</h3>
                      <p className="text-xs text-gray-300">Studio Grade Sound &bull; 45h Battery</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 line-through block">$299.99</span>
                      <span className="text-xl font-extrabold text-emerald-400">$249.99</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Review Badge */}
              <div className="absolute -bottom-6 -left-6 bg-dark-800/90 backdrop-blur-xl border border-gray-700/80 p-3.5 rounded-2xl shadow-xl hidden sm:flex items-center gap-3 animate-pulse-slow">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-gray-100 mt-0.5">Verified Buyer Satisfaction</p>
                  <p className="text-[10px] text-gray-400">Free 30-day returns on all items</p>
                </div>
              </div>

              {/* Floating Speed Delivery Badge */}
              <div className="absolute -top-4 -right-4 bg-dark-800/90 backdrop-blur-xl border border-gray-700/80 px-4 py-2.5 rounded-2xl shadow-xl hidden sm:flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-gray-200">Express 2-Day Delivery</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
