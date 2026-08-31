import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Settings, Store, Shield, Save, Key, Mail, Phone, DollarSign } from 'lucide-react';

const SettingsPage = () => {
  const { admin } = useAuth();
  const [shopSettings, setShopSettings] = useState({
    shopName: "SAHA MEN'S STORE",
    contactEmail: 'support@sahamenswear.com',
    contactPhone: '+91 98765 43210',
    currency: 'INR (₹)',
    deliveryCharge: 99
  });

  const [profileData, setProfileData] = useState({
    name: admin?.name || 'Saha Admin',
    email: admin?.email || 'admin@sahamenswear.com',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveShopSettings = (e) => {
    e.preventDefault();
    toast.success('Store configurations saved successfully!');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Admin profile updated!');
    setProfileData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="text-amber-400" size={22} />
            Store & Admin Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure shop parameters, delivery fees, and admin profile credentials</p>
        </div>
      </div>

      {/* Shop Info Settings */}
      <form onSubmit={handleSaveShopSettings} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Store size={16} /> Store Profile & Logistics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Store Name</label>
            <input
              type="text"
              value={shopSettings.shopName}
              onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Currency</label>
            <input
              type="text"
              readOnly
              value={shopSettings.currency}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-2.5 text-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Support Email</label>
            <input
              type="email"
              value={shopSettings.contactEmail}
              onChange={(e) => setShopSettings({ ...shopSettings, contactEmail: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Support Phone</label>
            <input
              type="text"
              value={shopSettings.contactPhone}
              onChange={(e) => setShopSettings({ ...shopSettings, contactPhone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Standard Delivery Fee (₹)</label>
            <input
              type="number"
              value={shopSettings.deliveryCharge}
              onChange={(e) => setShopSettings({ ...shopSettings, deliveryCharge: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
          >
            <Save size={14} /> Save Store Config
          </button>
        </div>
      </form>

      {/* Admin Account Settings */}
      <form onSubmit={handleSaveProfile} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Shield size={16} /> Admin Credentials & Password
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Admin Display Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Admin Login Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">New Password (optional)</label>
            <input
              type="password"
              value={profileData.newPassword}
              onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
            <input
              type="password"
              value={profileData.confirmPassword}
              onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
          >
            <Save size={14} /> Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
