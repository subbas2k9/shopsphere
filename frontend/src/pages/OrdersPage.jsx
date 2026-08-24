import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronRight,
  RotateCcw,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        showToast('Order cancelled successfully', 'info');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        showToast(res.data.message, 'error');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge-emerald px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'Shipped':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Truck className="w-3 h-3" /> Shipped</span>;
      case 'Confirmed':
        return <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
      case 'Cancelled':
        return <span className="badge-rose px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
      case 'Pending':
      default:
        return <span className="badge-amber px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-16 h-16 text-gray-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Sign In to View Orders</h2>
        <p className="text-sm text-gray-400">Please authenticate to track your shipments and view past receipts.</p>
        <Link to="/login?redirect=/orders" className="inline-block bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Order History</h1>
        <p className="text-xs text-gray-400 mt-1">Track current shipments, view receipts, and manage your past orders.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 h-36 animate-pulse bg-dark-800" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-4 hover:border-gray-700 transition-colors"
            >
              {/* Order Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-800 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Order ID</span>
                    <span className="font-mono font-bold text-brand-400 text-sm">{order.order_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Date Placed</span>
                    <span className="font-semibold text-gray-200">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold text-right">Total Amount</span>
                    <span className="font-extrabold text-white text-sm">${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                  <div>
                    {getStatusBadge(order.order_status)}
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items?.map((item) => (
                    <div key={item.id} className="relative group shrink-0">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        title={`${item.product_name} (Qty: ${item.quantity})`}
                        className="w-14 h-14 object-cover rounded-xl bg-dark-900 border border-gray-800"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-dark-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-700">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {order.order_status === 'Pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-200 border border-gray-700 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>View Receipt</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-16 text-center border border-gray-800 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You haven't placed any orders yet. Discover our latest items and get started.
          </p>
          <Link
            to="/products"
            className="inline-block bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
          >
            Explore Catalog
          </Link>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Receipt - ${selectedOrder.order_number}`}
        >
          <div className="space-y-6 text-xs text-gray-300">
            <div className="flex justify-between items-center bg-dark-900/80 p-4 rounded-xl border border-gray-800">
              <div>
                <p className="text-gray-400">Order Status</p>
                <div className="mt-1">{getStatusBadge(selectedOrder.order_status)}</div>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Payment</p>
                <p className="font-bold text-white uppercase mt-1">{selectedOrder.payment_method}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Items</h4>
              <div className="divide-y divide-gray-800 border-t border-b border-gray-800">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.product_image} alt={it.product_name} className="w-10 h-10 object-cover rounded-lg bg-dark-900" />
                      <div>
                        <p className="font-semibold text-white">{it.product_name}</p>
                        <p className="text-gray-400">Qty: {it.quantity} &bull; ${Number(it.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping details */}
            <div className="p-3 bg-dark-900 rounded-xl border border-gray-800 space-y-1">
              <p className="font-bold text-white">Shipping To</p>
              <p className="text-gray-300">{selectedOrder.shipping_name} ({selectedOrder.shipping_phone})</p>
              <p className="text-gray-400">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_pincode}</p>
            </div>

            {/* Total breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-white">${Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-white">${Number(selectedOrder.shipping_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-semibold text-white">${Number(selectedOrder.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
                <span>Total:</span>
                <span className="text-brand-400 text-base">${Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
