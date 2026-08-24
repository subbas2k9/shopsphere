import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Home, MapPin } from 'lucide-react';
import api from '../services/api';

export const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderNumber}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [orderNumber]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      
      {/* Confirmation Icon Header */}
      <div className="space-y-4">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Order Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          We've received your order and our fulfillment team is preparing your package for dispatch.
        </p>
      </div>

      {/* Order Info Card */}
      {order && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 text-left space-y-6 shadow-2xl">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 block">Order Number</span>
              <span className="text-base font-mono font-bold text-brand-400">{order.order_number}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Payment Method</span>
              <span className="text-sm font-semibold text-white uppercase">{order.payment_method}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Status</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ordered Items</h3>
            <div className="divide-y divide-gray-800/80">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-xl bg-dark-900 border border-gray-800"
                    />
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">{item.product_name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-gray-100">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping destination summary */}
          <div className="p-4 rounded-2xl bg-dark-900/80 border border-gray-800 space-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>Delivery Address</span>
            </div>
            <p className="font-semibold text-gray-200">{order.shipping_name} ({order.shipping_phone})</p>
            <p>{order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
          </div>

          {/* Total Breakdown */}
          <div className="border-t border-gray-800 pt-4 flex justify-between items-baseline text-sm">
            <span className="font-bold text-gray-300">Total Paid</span>
            <span className="text-2xl font-black text-emerald-400">${Number(order.total_amount).toFixed(2)}</span>
          </div>

        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 transition-all text-sm"
        >
          <Package className="w-4 h-4" />
          <span>View My Orders</span>
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass-card hover:border-gray-600 text-gray-200 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

    </div>
  );
};
