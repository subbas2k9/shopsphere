import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  User,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react';
import { showToast } from '../../components/common/Toast';
import api from '../../services/api';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchUsers();
      } else {
        showToast(res.data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('User account deleted', 'success');
        fetchUsers();
      } else {
        showToast(res.data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Users Management</h1>
        <p className="text-xs text-gray-400 mt-1">Manage customer profiles, assign administrator privileges, and review purchasing habits.</p>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl p-6 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 border-b border-gray-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-dark-800/40 transition-colors">
                  
                  {/* Avatar & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'badge-primary' : 'bg-dark-800 text-gray-400 border border-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Orders */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-200">{u.order_count || 0} Orders</span>
                  </td>

                  {/* Total Spent */}
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-emerald-400">
                      ${Number(u.total_spent || 0).toFixed(2)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-gray-400">
                    {new Date(u.created_at || Date.now()).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-gray-700 font-semibold text-[11px] transition-colors"
                        title="Toggle role"
                      >
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
