import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Building,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/common/Toast';
import api from '../services/api';
import confetti from 'canvas-confetti';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totals, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingEmail: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
    paymentMethod: 'cod', // 'cod' | 'card'
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: ''
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-fill from logged in profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shippingName: user.name || '',
        shippingEmail: user.email || '',
        shippingPhone: user.phone || '',
        shippingAddress: user.address || '',
        shippingCity: user.city || '',
        shippingState: user.state || '',
        shippingPincode: user.pincode || '',
        cardHolder: user.name || ''
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [items, navigate, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.shippingName.trim()) errors.shippingName = 'Full name is required';
    if (!formData.shippingEmail.trim() || !formData.shippingEmail.includes('@')) errors.shippingEmail = 'Valid email is required';
    if (!formData.shippingPhone.trim()) errors.shippingPhone = 'Phone number is required';
    if (!formData.shippingAddress.trim()) errors.shippingAddress = 'Street address is required';
    if (!formData.shippingCity.trim()) errors.shippingCity = 'City is required';
    if (!formData.shippingState.trim()) errors.shippingState = 'State is required';
    if (!formData.shippingPincode.trim()) errors.shippingPincode = 'Pincode is required';

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
        errors.cardNumber = 'Valid 16-digit card number is required';
      }
      if (!formData.cardExpiry || !formData.cardExpiry.includes('/')) {
        errors.cardExpiry = 'Expiry MM/YY is required';
      }
      if (!formData.cardCvv || formData.cardCvv.length < 3) {
        errors.cardCvv = '3-digit CVV required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please login or register to complete your order', 'info');
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!validateForm()) {
      showToast('Please fix the errors in the checkout form', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingName: formData.shippingName,
        shippingEmail: formData.shippingEmail,
        shippingPhone: formData.shippingPhone,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingPincode: formData.shippingPincode,
        paymentMethod: formData.paymentMethod
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        await clearCart();
        showToast('🎉 Order placed successfully!', 'success');
        navigate(`/order-success/${res.data.order.order_number}`);
      } else {
        showToast(res.data.message || 'Order failed', 'error');
      }
    } catch (error) {
      showToast(error.message || 'An error occurred during checkout', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Checkout</h1>
        <p className="text-xs text-gray-400 mt-1">Please enter your shipping address and select a payment method.</p>
      </div>

      {!isAuthenticated && (
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between gap-4 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              Already have a ShopSphere account? Sign in for fast checkout and saved addresses.
            </p>
          </div>
          <Link
            to="/login?redirect=/checkout"
            className="text-xs font-bold text-amber-300 hover:text-white bg-dark-900 px-3.5 py-1.5 rounded-lg border border-amber-500/30 shrink-0"
          >
            Sign In
          </Link>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Shipping & Payment Info */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Shipping Form */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-800">
              <MapPin className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">1. Shipping Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Recipient Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="shippingName"
                    value={formData.shippingName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={`w-full bg-dark-900 border ${validationErrors.shippingName ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-500`}
                  />
                </div>
                {validationErrors.shippingName && <span className="text-[10px] text-rose-400">{validationErrors.shippingName}</span>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="shippingEmail"
                    value={formData.shippingEmail}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full bg-dark-900 border ${validationErrors.shippingEmail ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-500`}
                  />
                </div>
                {validationErrors.shippingEmail && <span className="text-[10px] text-rose-400">{validationErrors.shippingEmail}</span>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-300">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="shippingPhone"
                    value={formData.shippingPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full bg-dark-900 border ${validationErrors.shippingPhone ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-500`}
                  />
                </div>
                {validationErrors.shippingPhone && <span className="text-[10px] text-rose-400">{validationErrors.shippingPhone}</span>}
              </div>

              {/* Street Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-300">Street Address / Apartment / Suite *</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  placeholder="123 Market Street, Apt 4B"
                  className={`w-full bg-dark-900 border ${validationErrors.shippingAddress ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500`}
                />
                {validationErrors.shippingAddress && <span className="text-[10px] text-rose-400">{validationErrors.shippingAddress}</span>}
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">City *</label>
                <input
                  type="text"
                  name="shippingCity"
                  value={formData.shippingCity}
                  onChange={handleChange}
                  placeholder="San Francisco"
                  className={`w-full bg-dark-900 border ${validationErrors.shippingCity ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500`}
                />
                {validationErrors.shippingCity && <span className="text-[10px] text-rose-400">{validationErrors.shippingCity}</span>}
              </div>

              {/* State & Pincode */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">State *</label>
                  <input
                    type="text"
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleChange}
                    placeholder="CA"
                    className={`w-full bg-dark-900 border ${validationErrors.shippingState ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500`}
                  />
                  {validationErrors.shippingState && <span className="text-[10px] text-rose-400">{validationErrors.shippingState}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Pincode *</label>
                  <input
                    type="text"
                    name="shippingPincode"
                    value={formData.shippingPincode}
                    onChange={handleChange}
                    placeholder="94103"
                    className={`w-full bg-dark-900 border ${validationErrors.shippingPincode ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500`}
                  />
                  {validationErrors.shippingPincode && <span className="text-[10px] text-rose-400">{validationErrors.shippingPincode}</span>}
                </div>
              </div>

            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-800">
              <CreditCard className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">2. Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option: Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'cod'
                    ? 'bg-brand-600/15 border-brand-500 text-white shadow-glow'
                    : 'bg-dark-900 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="text-brand-500 focus:ring-brand-500 h-4 w-4 bg-dark-800 border-gray-700"
                  />
                  <div>
                    <span className="text-sm font-bold block">Cash on Delivery</span>
                    <span className="text-[11px] text-gray-400">Pay when your order arrives</span>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-brand-400" />
              </label>

              {/* Option: Credit/Debit Card */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'card'
                    ? 'bg-brand-600/15 border-brand-500 text-white shadow-glow'
                    : 'bg-dark-900 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="text-brand-500 focus:ring-brand-500 h-4 w-4 bg-dark-800 border-gray-700"
                  />
                  <div>
                    <span className="text-sm font-bold block">Credit / Debit Card</span>
                    <span className="text-[11px] text-gray-400">Instant encrypted payment</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-brand-400" />
              </label>
            </div>

            {/* If Card Selected, Show Card Inputs */}
            {formData.paymentMethod === 'card' && (
              <div className="p-5 rounded-2xl bg-dark-900/90 border border-gray-800 space-y-4 animate-fade-in">
                
                {/* Visual Card simulation */}
                <div className="w-full max-w-sm mx-auto h-44 rounded-2xl bg-gradient-to-tr from-brand-800 via-indigo-900 to-dark-950 p-5 text-white shadow-2xl border border-brand-500/30 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold tracking-widest text-brand-300">SHOPSPHERE SECURE</span>
                    <CreditCard className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <span className="font-mono text-base tracking-widest font-bold">
                      {formData.cardNumber || '•••• •••• •••• ••••'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Card Holder</span>
                      <span className="font-semibold">{formData.cardHolder || 'CARDHOLDER NAME'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Expires</span>
                      <span className="font-mono font-semibold">{formData.cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-300">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleChange}
                      placeholder="JOHN DOE"
                      className="w-full bg-dark-800 border border-gray-700 text-xs text-gray-100 uppercase rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-300">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        const matches = v.match(/\d{4,16}/g);
                        const match = matches && matches[0] || '';
                        const parts = [];
                        for (let i = 0, len = match.length; i < len; i += 4) {
                          parts.push(match.substring(i, i + 4));
                        }
                        if (parts.length) {
                          setFormData((prev) => ({ ...prev, cardNumber: parts.join(' ') }));
                        } else {
                          setFormData((prev) => ({ ...prev, cardNumber: v }));
                        }
                      }}
                      placeholder="4532 8921 0392 4819"
                      className={`w-full bg-dark-800 border ${validationErrors.cardNumber ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 font-mono rounded-xl p-2.5 focus:outline-none focus:border-brand-500`}
                    />
                    {validationErrors.cardNumber && <span className="text-[10px] text-rose-400">{validationErrors.cardNumber}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Expiration (MM/YY)</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      maxLength={5}
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      placeholder="08/28"
                      className={`w-full bg-dark-800 border ${validationErrors.cardExpiry ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 font-mono rounded-xl p-2.5 focus:outline-none focus:border-brand-500`}
                    />
                    {validationErrors.cardExpiry && <span className="text-[10px] text-rose-400">{validationErrors.cardExpiry}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">CVV Security Code</label>
                    <input
                      type="password"
                      name="cardCvv"
                      maxLength={4}
                      value={formData.cardCvv}
                      onChange={handleChange}
                      placeholder="849"
                      className={`w-full bg-dark-800 border ${validationErrors.cardCvv ? 'border-rose-500' : 'border-gray-700'} text-xs text-gray-100 font-mono rounded-xl p-2.5 focus:outline-none focus:border-brand-500`}
                    />
                    {validationErrors.cardCvv && <span className="text-[10px] text-rose-400">{validationErrors.cardCvv}</span>}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-6 sticky top-28">
            <h2 className="text-lg font-bold text-white">Order Items ({items.length})</h2>

            {/* Scrollable mini items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-800/60">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-dark-900 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-200">
                    ${((item.discount_price || item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs border-t border-gray-800 pt-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span className="font-semibold text-white">
                  {totals.shippingFee === 0 ? <span className="text-emerald-400 uppercase font-bold text-[10px]">FREE</span> : `$${totals.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax (5%)</span>
                <span className="font-semibold text-white">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total to Pay</span>
                <span className="text-xl font-black text-brand-400">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-dark-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order (${totals.total.toFixed(2)})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-500 text-center">
              By confirming your order, you agree to ShopSphere Terms & Warranty terms.
            </p>
          </div>
        </div>

      </form>

    </div>
  );
};
