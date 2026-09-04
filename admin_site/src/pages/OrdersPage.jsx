import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Calendar,
  RefreshCw,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Clock,
  User,
  Phone,
  MapPin,
  X
} from 'lucide-react';

const STATUS_RANK = {
  'Pending': 1,
  'Confirmed': 2,
  'Order Confirmed': 2,
  'Processing': 3,
  'Shipped': 4,
  'Out for Delivery': 5,
  'Delivered': 6,
  'Cancelled': 99
};

const resolveBestStatus = (statusA, statusB) => {
  if (statusA === 'Cancelled' || statusB === 'Cancelled') return 'Cancelled';
  const rankA = STATUS_RANK[statusA] || 0;
  const rankB = STATUS_RANK[statusB] || 0;
  return rankA >= rankB ? (statusA || statusB || 'Pending') : (statusB || statusA || 'Pending');
};

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const initialStatus = searchParams.get('status') || 'All';

  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saha_admin_orders_cache') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('saha_admin_orders_cache') || '[]');
      return cached.length === 0;
    } catch (e) {
      return true;
    }
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { lastNotification } = useSocket();

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  const fetchOrders = async (showLoading = false) => {
    try {
      if (showLoading && orders.length === 0) setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/admin/orders', { params });
      const serverOrders = Array.isArray(res.data?.orders) ? res.data.orders : [];

      // Merge server orders with local persistent cache
      let localCache = [];
      try {
        localCache = JSON.parse(localStorage.getItem('saha_admin_orders_cache') || '[]');
      } catch (e) {}

      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const nowTime = Date.now();

      const orderMap = new Map();
      [...localCache, ...serverOrders].forEach(o => {
        if (!o) return;

        // Filter out orders older than 30 days from admin panel
        const createdAtTime = new Date(o.createdAt || 0).getTime();
        if (createdAtTime > 0 && (nowTime - createdAtTime) > THIRTY_DAYS_MS) {
          return;
        }

        const rawKey = String(o.orderId || o._id || '');
        const key = rawKey.replace(/^ORD-/, '');
        if (!key) return;

        if (!orderMap.has(key)) {
          orderMap.set(key, o);
        } else {
          const existing = orderMap.get(key);
          const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const newTime = new Date(o.updatedAt || o.createdAt || 0).getTime();
          const bestStatus = resolveBestStatus(existing.orderStatus, o.orderStatus);

          if (newTime > existingTime) {
            orderMap.set(key, { ...existing, ...o, orderStatus: bestStatus });
          } else {
            orderMap.set(key, { ...o, ...existing, orderStatus: bestStatus });
          }
        }
      });

      const allMerged = Array.from(orderMap.values()).sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
      });

      try {
        localStorage.setItem('saha_admin_orders_cache', JSON.stringify(allMerged));
      } catch (e) {}

      // Apply UI filters to merged list
      let displayOrders = allMerged;
      if (statusFilter && statusFilter !== 'All') {
        displayOrders = displayOrders.filter(o => {
          if (statusFilter === 'Confirmed') return o.orderStatus === 'Confirmed' || o.orderStatus === 'Order Confirmed';
          if (statusFilter === 'Shipped') return o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery';
          return String(o.orderStatus || '').toLowerCase() === String(statusFilter).toLowerCase();
        });
      }
      if (search) {
        const s = search.toLowerCase();
        displayOrders = displayOrders.filter(o =>
          String(o.orderId || o._id || '').toLowerCase().includes(s) ||
          String(o.shippingAddress?.fullName || o.user?.name || '').toLowerCase().includes(s) ||
          String(o.shippingAddress?.phone || o.user?.phone || '').toLowerCase().includes(s)
        );
      }

      setOrders(displayOrders);

      if (highlightId && allMerged.length > 0) {
        const found = allMerged.find(o => String(o._id) === highlightId || String(o.orderId) === highlightId);
        if (found) setSelectedOrder(found);
      }

      // Auto restore: if local cache has orders that server doesn't have, re-sync to server
      const serverKeys = new Set(serverOrders.map(o => String(o.orderId || o._id || '').replace(/^ORD-/, '')));
      const missingOnServer = allMerged.filter(o => !serverKeys.has(String(o.orderId || o._id || '').replace(/^ORD-/, '')));
      if (missingOnServer.length > 0 && serverOrders.length > 0) {
        api.post('/orders/sync', missingOnServer).catch(() => {});
      }
    } catch (error) {
      if (showLoading && orders.length === 0) toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    // Auto-poll every 8 seconds as fail-safe fallback so new orders always appear seamlessly
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 8000);

    return () => clearInterval(interval);
  }, [statusFilter, search]);

  useEffect(() => {
    if (lastNotification) {
      fetchOrders(false);
    }
  }, [lastNotification]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      const updatedObj = res.data?.order || res.data;
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => {
        const updated = prev.map(o => {
          const isMatch = String(o._id) === String(orderId) ||
            String(o.orderId) === String(orderId) ||
            (o.orderId && String(o.orderId).replace(/^ORD-/, '') === String(orderId).replace(/^ORD-/, ''));
          return isMatch ? { ...o, ...updatedObj, orderStatus: newStatus } : o;
        });
        try {
          localStorage.setItem('saha_admin_orders_cache', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      if (selectedOrder && (String(selectedOrder._id) === String(orderId) || String(selectedOrder.orderId) === String(orderId))) {
        setSelectedOrder(prev => ({ ...prev, ...updatedObj, orderStatus: newStatus }));
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-amber-400" size={22} />
            Customer Order Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live customer orders feed (orders older than 30 days are automatically removed)</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
        >
          <RefreshCw size={14} /> Refresh Orders
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search Order ID, Customer, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['All', ...statusOptions].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Fetching Orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-semibold text-slate-200">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Order Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => {
                  const isHighlighted = order._id === highlightId;
                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isHighlighted ? 'bg-amber-500/10 border-l-4 border-amber-500' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {order.orderId
                          ? (order.orderId.startsWith('ORD-') ? order.orderId : `ORD-${order.orderId}`)
                          : `ORD-${String(order._id).substring(0, 8).toUpperCase()}`}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-100">{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">{order.shippingAddress?.phone || order.user?.phone || 'No phone'}</span>
                          {(() => {
                            const addr = order.shippingAddress || {};
                            const fullAddr = [addr.street, addr.city, addr.pincode].filter(Boolean).join(', ');
                            const gUrl = addr.googleMapsUrl || (addr.lat && addr.lng
                              ? `https://www.google.com/maps?q=${addr.lat},${addr.lng}`
                              : (fullAddr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}` : null));
                            if (!gUrl) return null;
                            return (
                              <a
                                href={gUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Google Maps"
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-0.5 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20"
                              >
                                🗺️ Maps
                              </a>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200">{order.paymentMethod}</span>
                        <span className={`block text-[10px] font-semibold ${order.isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid (COD)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white text-right">₹{order.totalPrice}</td>
                      <td className="py-3 px-4">
                        <select
                          value={order.orderStatus || 'Pending'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-slate-900 border border-slate-700/80 text-xs text-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-amber-500"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 inline-flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-panel p-6 rounded-2xl border border-slate-800 max-h-[90vh] overflow-y-auto relative space-y-5">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase text-amber-400">Order Invoice</span>
              <h2 className="text-lg font-bold text-white font-mono">{selectedOrder.orderId || selectedOrder._id}</h2>
              <p className="text-xs text-slate-400">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                  <User size={12} /> Customer Information
                </p>
                <p className="font-semibold text-slate-100">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || 'Customer'}</p>
                <p className="text-slate-400">{selectedOrder.shippingAddress?.email || selectedOrder.user?.email || 'N/A'}</p>
                <p className="text-slate-400 flex items-center gap-1"><Phone size={10} /> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <MapPin size={12} className="text-amber-400" /> Shipping Address
                  </p>
                  {(() => {
                    const addr = selectedOrder.shippingAddress || {};
                    const fullAddr = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
                    const gUrl = addr.googleMapsUrl || (addr.lat && addr.lng
                      ? `https://www.google.com/maps?q=${addr.lat},${addr.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`);
                    return (
                      <a
                        href={gUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[10px] font-bold border border-blue-500/30 flex items-center gap-1 transition"
                      >
                        📍 Open in Google Maps ↗
                      </a>
                    );
                  })()}
                </div>
                <p className="text-slate-200">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-slate-400">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.pincode}
                </p>
                {(() => {
                  const addr = selectedOrder.shippingAddress || {};
                  const fullAddr = [addr.street, addr.city, addr.pincode].filter(Boolean).join(', ');
                  const embedSrc = (addr.lat && addr.lng)
                    ? `https://maps.google.com/maps?q=${addr.lat},${addr.lng}&z=15&output=embed`
                    : (fullAddr ? `https://maps.google.com/maps?q=${encodeURIComponent(fullAddr)}&z=14&output=embed` : null);
                  if (!embedSrc) return null;
                  return (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/60 h-28 bg-slate-950">
                      <iframe
                        title="Delivery Location Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={embedSrc}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">Items Purchased</p>
              <div className="space-y-2">
                {(selectedOrder.orderItems || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <img
                      src={item.image || 'https://via.placeholder.com/60'}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">Size: {item.size || 'M'} | Color: {item.color || 'Standard'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">₹{item.price} × {item.qty}</p>
                      <p className="text-[10px] text-amber-400 font-semibold">₹{(item.price || 0) * (item.qty || 1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="border-t border-slate-800 pt-3">
              <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">Order Status Control</p>
              <div className="flex items-center justify-between">
                <StatusBadge type="order" status={selectedOrder.orderStatus} />
                <select
                  value={selectedOrder.orderStatus || 'Pending'}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
