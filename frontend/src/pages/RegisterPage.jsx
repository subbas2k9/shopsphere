import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/common/Toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { level: 0, text: 'None', color: 'bg-gray-700' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { level: 2, text: 'Good', color: 'bg-amber-500' };
    return { level: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await register(formData);
    if (res.success) {
      showToast('🎉 Account registered successfully! Welcome to ShopSphere.', 'success');
      navigate(redirect);
    } else {
      setErrorMsg(res.message || 'Registration failed');
      showToast(res.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6 relative overflow-hidden">
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
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
            <p className="text-xs text-gray-400">Join ShopSphere to enjoy personalized shopping and deals.</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Password strength meter */}
              {formData.password && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Strength</span>
                    <span className="font-semibold">{strength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 ${strength.level >= 1 ? strength.color : 'bg-gray-800'}`} />
                    <div className={`h-full flex-1 ${strength.level >= 2 ? strength.color : 'bg-gray-800'}`} />
                    <div className={`h-full flex-1 ${strength.level >= 3 ? strength.color : 'bg-gray-800'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm mt-4"
            >
              {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
            </button>

          </form>

          {/* Link to Login */}
          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-800">
            Already have an account?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-brand-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
