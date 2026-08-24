import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ArrowRight, Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../common/Toast';

export const SpecialOffers = ({ product }) => {
  const { addToCart } = useCart();

  // 24-hour countdown simulation
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealProduct = product || {
    id: 13,
    name: 'Chronograph Automatic Sapphire Watch',
    slug: 'chronograph-automatic-sapphire-watch',
    price: 450.00,
    discount_price: 395.00,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    stock: 14
  };

  const handleQuickBuy = async () => {
    const res = await addToCart(dealProduct, 1);
    if (res.success) {
      showToast(res.message, 'success');
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-brand-500/30 p-6 sm:p-10 lg:p-12 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/15 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Col: Info & Countdown */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Flash Deal of the Day</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Save $55 on the Luxury <br />
                <span className="text-brand-400">Automatic Sapphire Chronograph</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-300 max-w-lg leading-relaxed">
                Precision Swiss engineering meets scratch-resistant sapphire crystal and high-grade 316L stainless steel. Limited inventory available at this special promotional rate.
              </p>

              {/* Countdown Timer Blocks */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>Offer Expires In:</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center bg-dark-900 border border-gray-800 rounded-xl p-3 min-w-[64px]">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Hours</span>
                  </div>
                  <div className="flex flex-col items-center bg-dark-900 border border-gray-800 rounded-xl p-3 min-w-[64px]">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Mins</span>
                  </div>
                  <div className="flex flex-col items-center bg-dark-900 border border-gray-800 rounded-xl p-3 min-w-[64px]">
                    <span className="text-2xl font-extrabold text-brand-400 font-mono">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Secs</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={handleQuickBuy}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-brand-600/30 transition-all text-sm hover:scale-105 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Claim Deal ($395.00)</span>
                </button>
                <Link
                  to={`/products/${dealProduct.slug || dealProduct.id}`}
                  className="inline-flex items-center gap-2 glass-card hover:border-gray-600 text-gray-200 hover:text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

            {/* Right Col: Image spotlight */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden glass-card border border-white/10 p-2 shadow-2xl group">
                <img
                  src={dealProduct.image_url}
                  alt={dealProduct.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  SAVE $55
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
