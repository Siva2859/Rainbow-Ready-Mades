import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Package, RefreshCw, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SHOP_INFO } from '../utils/constants';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      success("Profile details updated successfully.");
      setEditing(false);
    } catch (err) {
      toastError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
          Customer Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your contact information, orders, and store support tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Details */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg uppercase">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">{user?.full_name}</h2>
                <span className="text-xs text-slate-400">Verified Customer</span>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-bold text-accent-600 hover:text-accent-700"
              >
                Edit Details
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-accent-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-accent-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-slate-900 hover:bg-accent-600 text-white rounded-xl font-bold transition"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFullName(user?.full_name || '');
                    setPhone(user?.phone || '');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Address</span>
                  <span className="font-medium text-sm text-slate-900">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Number</span>
                  <span className="font-medium text-sm text-slate-900">{user?.phone || "No phone number saved"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-accent-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Status</span>
                  <span className="font-medium text-sm text-emerald-700">Active & Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Shortcuts & Logout */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Quick Shortcuts
            </h3>

            <Link
              to="/orders"
              className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition group text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-accent-600" />
                <span className="font-semibold text-slate-800">My Orders & Live Tracking</span>
              </div>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition">→</span>
            </Link>

            <Link
              to="/returns"
              className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition group text-xs"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-accent-600" />
                <span className="font-semibold text-slate-800">10-Day Returns & Exchanges</span>
              </div>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition">→</span>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Session Control</h3>
            <p className="text-xs text-slate-500">Log out from your device session when finished.</p>
            <button
              onClick={logout}
              className="w-full mt-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
