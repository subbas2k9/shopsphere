import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Package,
  Heart,
  ShieldCheck,
  LogOut,
  Save,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { showToast } from '../components/common/Toast';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishItems } = useWishlist();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changingPass, setChangingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile(profileData);
    if (res.success) {
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast(res.message || 'Update failed', 'error');
    }
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (passData.newPassword !== passData.confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setChangingPass(true);
    const res = await changePassword(passData);
    if (res.success) {
      showToast('Password changed successfully!', 'success');
      setPassData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } else {
      showToast(res.message || 'Password update failed', 'error');
    }
    setChangingPass(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-16 h-16 text-gray-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
        <p className="text-sm text-gray-400">Please sign in to access your profile and saved addresses.</p>
        <Link to="/login" className="inline-block bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Bar */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-brand-600/30">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
              {user.role === 'admin' && (
                <span className="badge-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            <p className="text-[11px] text-gray-500 mt-1">Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Personal Details & Saved Addresses */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
              <User className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-bold text-white">Personal Information & Address</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-300">Email Address (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-dark-950 border border-gray-800 text-gray-500 rounded-xl p-2.5 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-gray-300">Default Shipping Address</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="123 Market Street, Apt 4B"
                    className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-300">City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-300">State</label>
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      placeholder="CA"
                      className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-300">Pincode</label>
                    <input
                      type="text"
                      value={profileData.pincode}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      placeholder="94103"
                      className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Change Password & Quick Access */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Change Password */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Security & Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">Current Password</label>
                <input
                  type="password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">New Password</label>
                <input
                  type="password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={passData.confirmNewPassword}
                  onChange={(e) => setPassData({ ...passData, confirmNewPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPass}
                  className="w-full bg-dark-800 hover:bg-dark-700 border border-gray-700 text-gray-200 font-bold py-2.5 rounded-xl transition-colors"
                >
                  {changingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links Card */}
          <div className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/orders"
                className="p-3 bg-dark-900 hover:bg-dark-800 rounded-xl border border-gray-800 flex items-center gap-2.5 text-xs text-gray-200 transition-colors"
              >
                <Package className="w-4 h-4 text-brand-400" />
                <span>My Orders</span>
              </Link>
              <Link
                to="/wishlist"
                className="p-3 bg-dark-900 hover:bg-dark-800 rounded-xl border border-gray-800 flex items-center gap-2.5 text-xs text-gray-200 transition-colors"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>My Wishlist ({wishItems.length})</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
