import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { showToast } from '../../components/common/Toast';
import api from '../../services/api';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await api.get(`/admin/orders?${params.toString()}`);
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
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus });
        }
      } else {
        showToast(res.data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge-emerald px-2.5 py-0.5 rounded-full text-[11px] font-bold">Delivered</span>;
      case 'Shipped':
        return <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">Shipped</span>;
      case 'Confirmed':
        return <span className="bg-brand-500/15 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">Confirmed</span>;
      case 'Cancelled':
        return <span className="badge-rose px-2.5 py-0.5 rounded-full text-[11px] font-bold">Cancelled</span>;
      case 'Pending':
      default:
        return <span className="badge-amber px-2.5 py-0.5 rounded-full text-[11px] font-bold">Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-400 mt-1">Review customer orders, transition order statuses, and verify shipping details.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            placeholder="Search order ID or customer..."
            className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-dark-800 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl p-6 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 border-b border-gray-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Change Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-dark-800/40 transition-colors">
                  
                  {/* Order Number & Date */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-brand-400 block">{ord.order_number}</span>
                    <span className="text-[10px] text-gray-500">{new Date(ord.created_at).toLocaleDateString()}</span>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{ord.shipping_name}</p>
                    <p className="text-[10px] text-gray-400">{ord.shipping_phone}</p>
                  </td>

                  {/* Items preview */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-300">
                      {ord.items?.length || 0} Products
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-white">${Number(ord.total_amount).toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 uppercase block">{ord.payment_method}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(ord.order_status)}
                  </td>

                  {/* Status Updater Select */}
                  <td className="py-3.5 px-4">
                    <select
                      value={ord.order_status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className="bg-dark-800 border border-gray-700 text-xs text-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* View Details */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-gray-700 transition-colors"
                      title="Inspect Order"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Inspector - ${selectedOrder.order_number}`}
        >
          <div className="space-y-6 text-xs text-gray-300">
            <div className="grid grid-cols-2 gap-4 bg-dark-900 p-4 rounded-xl border border-gray-800">
              <div>
                <p className="text-gray-400">Customer</p>
                <p className="font-bold text-white text-sm">{selectedOrder.shipping_name}</p>
                <p className="text-gray-400">{selectedOrder.shipping_email}</p>
                <p className="text-gray-400">{selectedOrder.shipping_phone}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Current Status</p>
                <div className="mt-1">{getStatusBadge(selectedOrder.order_status)}</div>
                <p className="text-gray-400 mt-2">Payment: <span className="font-bold text-white uppercase">{selectedOrder.payment_method}</span></p>
              </div>
            </div>

            {/* Destination Address */}
            <div className="p-3 bg-dark-900 rounded-xl border border-gray-800">
              <p className="font-bold text-white mb-1">Destination Address</p>
              <p>{selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}</p>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Order Items</h4>
              <div className="divide-y divide-gray-800 border-t border-b border-gray-800">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.product_image} alt={it.product_name} className="w-10 h-10 object-cover rounded-lg bg-dark-900" />
                      <div>
                        <p className="font-semibold text-white">{it.product_name}</p>
                        <p className="text-gray-400">Qty: {it.quantity} &bull; ${Number(it.price).toFixed(2)} ea</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-800 text-sm">
              <span className="font-bold text-gray-300">Total Order Value:</span>
              <span className="text-xl font-black text-brand-400">${Number(selectedOrder.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
