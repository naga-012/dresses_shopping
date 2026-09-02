import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useSocket } from '../context/SocketContext';
import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastNotification } = useSocket();

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/analytics')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (lastNotification) {
      fetchData();
    }
  }, [lastNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      subtitle: `Today: ₹${(stats?.todayRevenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20 hover:border-amber-500/50',
      link: '/analytics'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      subtitle: `Today: ${stats?.todayOrders || 0} new orders`,
      icon: ShoppingBag,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20 hover:border-blue-500/50',
      link: '/orders'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      subtitle: `${stats?.outOfStockCount || 0} Out of Stock`,
      icon: Package,
      color: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/20 hover:border-purple-500/50',
      link: '/products'
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      subtitle: 'Registered members',
      icon: Users,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50',
      link: '/customers'
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time metrics and operational summary for SAHA Men's Store</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* Main Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`glass-card p-5 rounded-2xl border bg-gradient-to-br ${card.color} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer group block`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 group-hover:border-amber-500/40 transition-colors">
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white tracking-tight">{card.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-400">{card.subtitle}</p>
                <span className="text-[11px] font-bold text-amber-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                  View <ArrowUpRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Low Stock Warning Banner if any */}
      {(stats?.lowStockCount > 0 || stats?.outOfStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-400 shrink-0" size={20} />
            <p className="text-xs font-medium text-amber-200">
              Inventory Warning: You have <strong className="text-white">{stats?.lowStockCount} low-stock</strong> items and <strong className="text-white">{stats?.outOfStockCount} out-of-stock</strong> products requiring restock.
            </p>
          </div>
          <Link to="/inventory" className="shrink-0 text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
            <span>Manage Inventory</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Sales Trend Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400" />
                Sales Overview (Last 14 Days)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily revenue trajectory from customer orders</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailySales || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Breakdown Panel */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <h2 className="text-base font-bold text-white mb-4">Orders by Status</h2>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {[
              { label: 'Pending', count: stats?.statusCounts?.pending || 0, color: 'bg-amber-500' },
              { label: 'Confirmed', count: stats?.statusCounts?.confirmed || 0, color: 'bg-blue-500' },
              { label: 'Processing', count: stats?.statusCounts?.processing || 0, color: 'bg-purple-500' },
              { label: 'Shipped', count: stats?.statusCounts?.shipped || 0, color: 'bg-indigo-500' },
              { label: 'Delivered', count: stats?.statusCounts?.delivered || 0, color: 'bg-emerald-500' },
              { label: 'Cancelled', count: stats?.statusCounts?.cancelled || 0, color: 'bg-rose-500' },
            ].map((item, i) => (
              <Link
                key={i}
                to={`/orders?status=${item.label}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-white">{item.count}</span>
              </Link>
            ))}
          </div>
          <Link to="/orders" className="mt-4 w-full py-2 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 block border border-slate-700">
            View All Orders
          </Link>
        </div>
      </div>

      {/* Recent Orders & Best Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Feed */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-blue-400" />
              Recent Orders
            </h2>
            <Link to="/orders" className="text-xs font-semibold text-amber-400 hover:underline">
              See All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(stats?.recentOrders || []).map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono text-amber-400 font-semibold">{order.orderId || order._id?.substring(0, 8)}</td>
                    <td className="py-3 font-medium text-slate-200">{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</td>
                    <td className="py-3"><StatusBadge type="order" status={order.orderStatus} /></td>
                    <td className="py-3 font-bold text-white text-right">₹{order.totalPrice}</td>
                    <td className="py-3 text-center">
                      <Link to={`/orders?id=${order._id}`} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 inline-block">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            {(analytics?.bestSellers || []).slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <img
                  src={item.image || 'https://via.placeholder.com/60'}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.totalQty} sold</p>
                </div>
                <span className="text-xs font-bold text-amber-400">₹{item.totalSales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
