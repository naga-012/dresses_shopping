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

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { lastNotification } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/admin/orders', { params });
      setOrders(res.data.orders || []);

      if (highlightId && res.data.orders) {
        const found = res.data.orders.find(o => o._id === highlightId);
        if (found) setSelectedOrder(found);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (lastNotification) {
      fetchOrders();
    }
  }, [lastNotification]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.data);
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
          <p className="text-xs text-slate-400 mt-1">Live customer orders feed, status updates, and fulfillment workflow</p>
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
                        {order.orderId || order._id?.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-100">{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</p>
                        <p className="text-[10px] text-slate-400">{order.shippingAddress?.phone || order.user?.phone || 'No phone'}</p>
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

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Shipping Address
                </p>
                <p className="text-slate-200">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-slate-400">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.pincode}
                </p>
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
