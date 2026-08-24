import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Sparkles,
  PackageOpen
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { showToast } from '../components/common/Toast';

export const CartPage = () => {
  const navigate = useNavigate();
  const { items, totals, updateQuantity, removeFromCart, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SPHERE20') {
      setDiscountPercent(20);
      showToast('🎉 Coupon SPHERE20 applied! 20% discount activated.', 'success');
    } else {
      showToast('Invalid coupon code. Try SPHERE20', 'error');
    }
  };

  const couponSavings = totals.subtotal * (discountPercent / 100);
  const finalTotal = Math.max(0, totals.total - couponSavings);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mx-auto text-gray-500 border border-gray-800 shadow-xl">
          <PackageOpen className="w-10 h-10 text-brand-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our curated collections to find something exceptional.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 transition-all text-sm hover:scale-105"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-gray-400 mt-1">Review your selected items and proceed to checkout.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const price = Number(item.price) || 0;
            const effectivePrice = item.discount_price ? Number(item.discount_price) : price;
            const itemTotal = effectivePrice * item.quantity;

            return (
              <div
                key={item.id}
                className="glass-panel rounded-2xl p-4 sm:p-5 border border-gray-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-dark-900 border border-gray-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider block">
                      {item.category_name || 'Item'}
                    </span>
                    <Link
                      to={`/products/${item.slug || item.product_id}`}
                      className="text-sm sm:text-base font-bold text-white hover:text-brand-400 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-extrabold text-gray-200">
                        ${effectivePrice.toFixed(2)}
                      </span>
                      {item.discount_price && (
                        <span className="text-xs text-gray-500 line-through">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls and Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-800">
                  
                  {/* Quantity stepper */}
                  <div className="flex items-center bg-dark-900 border border-gray-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                      className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-dark-800 transition-colors text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-white min-w-[32px] text-center font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                      className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-dark-800 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total Price */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-base font-black text-white">
                      ${itemTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-500 hover:text-rose-400 p-2 rounded-lg hover:bg-dark-800 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Continue Shopping Link */}
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-6">
            <h2 className="text-lg font-bold text-white">Order Summary</h2>

            {/* Coupon Code Section */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Coupon code (SPHERE20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 text-xs text-gray-200 uppercase rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                className="bg-dark-800 hover:bg-dark-700 text-brand-400 border border-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                Apply
              </button>
            </form>

            {/* Breakdown */}
            <div className="space-y-3 text-xs border-t border-gray-800 pt-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.totalSavings > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Product Savings</span>
                  <span>-${totals.totalSavings.toFixed(2)}</span>
                </div>
              )}

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount ({discountPercent}%)</span>
                  <span>-${couponSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-300">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-white">
                  {totals.shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    `$${totals.shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Estimated Tax (5%)</span>
                <span className="font-semibold text-white">${totals.tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Amount</span>
                <span className="text-xl font-black text-brand-400">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Notice */}
            <div className="flex items-center gap-2 justify-center text-[11px] text-gray-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Guaranteed 256-bit Secure Checkout</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
