import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shield, User, RotateCcw, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resetDb } from '../../services/mockDb';
import { showToast } from './Toast';

export const DemoBanner = () => {
  const [visible, setVisible] = useState(true);
  const { user, login, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!visible) return null;

  const handleDemoLogin = async (email, pass, redirectPath) => {
    const res = await login(email, pass);
    if (res.success) {
      showToast(`Logged in as ${res.user.role === 'admin' ? 'Demo Admin' : 'Demo Customer'}`, 'success');
      if (redirectPath) navigate(redirectPath);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data (products, orders, cart) back to original state?')) {
      resetDb();
      showToast('Store data reset to default seed data!', 'success');
      window.location.reload();
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-950 via-dark-900 to-brand-950 border-b border-brand-500/20 text-xs py-1.5 px-4 text-gray-300 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Left Info */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">Vercel Ready React.js SPA</span>
          <span className="hidden sm:inline text-gray-400">&bull; Standalone Frontend with Live In-Browser Storage</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <button
                onClick={() => handleDemoLogin('john@example.com', 'User@123', '/')}
                className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-200 border border-gray-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <User className="w-3 h-3 text-emerald-400" />
                <span>Demo Customer</span>
              </button>
              <button
                onClick={() => handleDemoLogin('admin@shopsphere.com', 'Admin@123', '/admin')}
                className="px-2.5 py-1 rounded-lg bg-brand-600/30 hover:bg-brand-600/40 text-brand-300 border border-brand-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <Shield className="w-3 h-3 text-brand-400" />
                <span>Demo Admin</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">
                Logged in as: <strong className="text-white">{user.name}</strong> ({user.role})
              </span>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="px-2.5 py-1 rounded-lg bg-brand-600 text-white hover:bg-brand-500 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Admin Panel</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <button
                  onClick={() => handleDemoLogin('admin@shopsphere.com', 'Admin@123', '/admin')}
                  className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-brand-300 border border-gray-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  <span>Switch to Admin</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            title="Reset store data to default seed state"
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setVisible(false)}
            title="Dismiss banner"
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
