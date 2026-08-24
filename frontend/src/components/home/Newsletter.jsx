import React, { useState } from 'react';
import { Mail, Sparkles, Check } from 'lucide-react';
import { showToast } from '../common/Toast';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('🎉 You are now subscribed! Use coupon SPHERE20 at checkout for 20% off.', 'success');
    setEmail('');
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900 via-dark-850 to-dark-900 border border-brand-500/20 p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-4 border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>VIP Subscriber Privilege</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Unlock 20% Off Your First Order
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mt-3 leading-relaxed">
            Subscribe to our weekly newsletter for early drops, seasonal sales, and member-only coupons. Zero spam, ever.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work or personal email..."
                className="w-full bg-dark-900/90 text-sm text-gray-100 placeholder-gray-500 pl-11 pr-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shrink-0"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Get My Code</span>
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 mt-4">
            By subscribing, you agree to our Terms of Service & Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
