import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, IndianRupee, TrendingUp, ShoppingBag, Award, Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const SalesAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          api.get('/admin/dashboard/analytics'),
          api.get('/admin/dashboard/stats')
        ]);
        setData(aRes.data);
        setStats(sRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const avgOrderValue = stats?.totalOrders ? Math.round((stats.totalRevenue || 0) / stats.totalOrders) : 0;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-amber-400" size={22} />
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Financial performance reports, average order value, and product leaderboard</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Gross Revenue</p>
          <p className="text-2xl font-extrabold text-white">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Orders Fulfillable</p>
          <p className="text-2xl font-extrabold text-blue-400">{stats?.totalOrders || 0}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Average Order Value (AOV)</p>
          <p className="text-2xl font-extrabold text-amber-400">₹{avgOrderValue}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Area Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-4">Daily Sales Trajectory (Last 14 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-4">Monthly Revenue Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsPage;
