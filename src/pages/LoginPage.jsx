import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/common/Toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    if (res.success) {
      showToast(`Welcome back, ${res.user?.name || 'User'}!`, 'success');
      navigate(redirect);
    } else {
      setErrorMsg(res.message || 'Invalid login credentials');
      showToast(res.message || 'Login failed', 'error');
    }
    setLoading(false);
  };

  // Demo Login Helpers
  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setErrorMsg('');

    const res = await login(demoEmail, demoPass);
    if (res.success) {
      showToast(`Logged in as ${res.user.role === 'admin' ? 'Administrator' : 'Customer'}!`, 'success');
      if (res.user.role === 'admin' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } else {
      setErrorMsg(res.message || 'Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-600/20 blur-[70px] pointer-events-none" />

          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-600/30">
                <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              <span className="text-2xl font-extrabold text-white">
                Shop<span className="text-brand-400">Sphere</span>
              </span>
            </Link>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-gray-400">Sign in with your credentials to access your account.</p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-gray-300">Password</label>
                <button
                  type="button"
                  onClick={() => showToast('For demo testing: User@123 or Admin@123', 'info')}
                  className="text-[11px] text-brand-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-brand-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              {loading ? <span>Signing In...</span> : <span>Sign In</span>}
            </button>
          </form>

          {/* Quick Demo Login Box */}
          <div className="p-4 rounded-2xl bg-dark-900/90 border border-gray-800 space-y-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              Quick One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('john@example.com', 'User@123')}
                className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-gray-700 text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@shopsphere.com', 'Admin@123')}
                className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-gray-700 text-xs font-semibold text-brand-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          {/* Link to Register */}
          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-800">
            Don't have an account yet?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-brand-400 font-bold hover:underline">
              Create an Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
