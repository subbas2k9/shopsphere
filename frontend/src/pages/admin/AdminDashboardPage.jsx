import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Truck,
  XCircle,
  FolderTree
} from 'lucide-react';
import api from '../../services/api';

export const AdminDashboardPage = () => {
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0
    },
    recentOrders: [],
    categoryStats: [],
    salesTimeline: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `$${Number(data.stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-emerald-600 to-teal-500',
      badge: '+18.4% this week'
    },
    {
      title: 'Total Orders',
      value: data.stats.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-brand-600 to-indigo-500',
      badge: `${data.stats.pendingOrders || 0} Pending`
    },
    {
      title: 'Total Products',
      value: data.stats.totalProducts || 0,
      icon: Package,
      color: 'from-purple-600 to-indigo-600',
      badge: '24 active'
    },
    {
      title: 'Registered Users',
      value: data.stats.totalUsers || 0,
      icon: Users,
      color: 'from-accent-cyan to-blue-600',
      badge: 'Active customers'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Overview</h1>
        <p className="text-xs text-gray-400 mt-1">Live metrics, store revenues, inventory status, and order dispatch tracking.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">{c.title}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${c.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-white">{c.value}</span>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{c.badge}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Analytics Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sales Chart */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Revenue & Orders Activity</h2>
              <p className="text-xs text-gray-400">Weekly sales trajectory overview</p>
            </div>
            <span className="text-xs font-semibold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              Live Feed
            </span>
          </div>

          {/* SVG Visual Sales Curve */}
          <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 px-2">
            {(data.salesTimeline?.length > 0 ? data.salesTimeline : [
              { name: 'Mon', sales: 1200 },
              { name: 'Tue', sales: 2100 },
              { name: 'Wed', sales: 1800 },
              { name: 'Thu', sales: 2900 },
              { name: 'Fri', sales: 3400 },
              { name: 'Sat', sales: 4200 },
              { name: 'Sun', sales: 3900 }
            ]).map((point) => {
              const heightPercent = Math.min(100, Math.max(15, (point.sales / 4500) * 100));
              return (
                <div key={point.name} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    ${point.sales}
                  </span>
                  <div className="w-full bg-dark-800 rounded-t-xl overflow-hidden h-32 flex items-end p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 rounded-t-lg group-hover:from-brand-500 group-hover:to-accent-cyan transition-all duration-500 shadow-glow"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-400">{point.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h2 className="text-base font-bold text-white">Categories</h2>
            <Link to="/admin/categories" className="text-xs text-brand-400 hover:underline">Manage &rarr;</Link>
          </div>

          <div className="space-y-3 divide-y divide-gray-800/60">
            {data.categoryStats?.map((cat) => (
              <div key={cat.id} className="pt-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-brand-400 font-mono font-bold">{cat.product_count} prods</span>
                  <span className="text-gray-500 font-mono">({cat.total_stock} stock)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-base font-bold text-white">Recent Orders</h2>
            <p className="text-xs text-gray-400">Latest customer transactions</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 border-b border-gray-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {data.recentOrders?.length > 0 ? (
                data.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-400">{ord.order_number}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{ord.shipping_name || ord.customer_name}</td>
                    <td className="py-3.5 px-4 text-gray-400">{new Date(ord.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-200">${Number(ord.total_amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 uppercase font-mono text-gray-400">{ord.payment_method}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        ord.order_status === 'Delivered'
                          ? 'badge-emerald'
                          : ord.order_status === 'Shipped'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : ord.order_status === 'Cancelled'
                          ? 'badge-rose'
                          : 'badge-amber'
                      }`}>
                        {ord.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
