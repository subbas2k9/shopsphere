import React from 'react';
import { RatingStars } from '../common/RatingStars';
import { Quote, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Alexander Wright',
    role: 'Audio Engineer',
    rating: 5,
    comment: 'The Aura ANC Headphones exceeded all my expectations. The frequency response and noise isolation rival studio monitors costing triple the price.',
    product: 'Aura ANC Wireless Headphones',
    avatar: 'A'
  },
  {
    id: 2,
    name: 'Elena Rostova',
    role: 'Marathon Runner',
    rating: 5,
    comment: 'Apex Runner Carbon shoes genuinely improved my pacing. Incredible energy return and breathability during high humidity runs.',
    product: 'Apex Runner Carbon Max',
    avatar: 'E'
  },
  {
    id: 3,
    name: 'Marcus Chen',
    role: 'Software Architect',
    rating: 5,
    comment: 'The Vortex Pro keyboard is a work of art. The switches are buttery smooth, and the aluminum build is rock solid. Delivered in 2 days flat.',
    product: 'Vortex Pro Wireless Keyboard',
    avatar: 'M'
  }
];

export const ReviewsSection = () => {
  return (
    <section className="py-16 bg-dark-950/40 border-y border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
            Customer Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Loved by 15,000+ Discerning Buyers
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Read real, unfiltered experiences from verified customers across the globe.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-gray-800 relative hover:-translate-y-1 transition-transform duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <RatingStars rating={t.rating} size="sm" />
                  <Quote className="w-6 h-6 text-gray-700" />
                </div>

                <p className="text-sm text-gray-300 italic leading-relaxed mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-gray-100 truncate">{t.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-400">{t.role} &bull; <span className="text-brand-400">{t.product}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
