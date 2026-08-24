import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/common/Toast';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, login, logout } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
        <div className="max-w-md glass-panel rounded-3xl p-8 border border-rose-500/30 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Access Required</h2>
          <p className="text-xs text-gray-400">
            You must be logged in as an administrator to access the management portal.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={async () => {
                const res = await login('admin@shopsphere.com', 'Admin@123');
                if (res.success) {
                  showToast('Logged in as Demo Administrator!', 'success');
                  navigate('/admin');
                }
              }}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Instant Demo Admin</span>
            </button>
            <Link to="/" className="bg-dark-800 text-gray-300 text-xs font-bold px-5 py-2.5 rounded-xl border border-gray-700 flex items-center justify-center">
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Users', path: '/admin/users', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-dark-900 border-r border-gray-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-600/30">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black text-white block leading-tight">
                Shop<span className="text-brand-400">Sphere</span>
              </span>
              <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                Admin Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4 border-t border-gray-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="pt-6 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Store Front</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>

    </div>
  );
};
