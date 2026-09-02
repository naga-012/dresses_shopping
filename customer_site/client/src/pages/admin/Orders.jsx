import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const statuses = ['Pending', 'Confirmed', 'Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await API.get('/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(ord => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'DELIVERY') {
      return ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery';
    }
    if (filterStatus === 'DELIVERED') {
      return ord.orderStatus === 'Delivered';
    }
    if (filterStatus === 'PENDING') {
      return ord.orderStatus === 'Pending' || ord.orderStatus === 'Confirmed' || ord.orderStatus === 'Order Confirmed';
    }
    return ord.orderStatus === filterStatus;
  });

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Customer Orders Management</h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: 'ALL', label: `All Orders (${orders.length})` },
          { id: 'PENDING', label: `Pending / Confirmed (${orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Order Confirmed').length})` },
          { id: 'Processing', label: `Processing (${orders.filter(o => o.orderStatus === 'Processing').length})` },
          { id: 'DELIVERY', label: `🚚 Delivery Orders (${orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length})` },
          { id: 'DELIVERED', label: `✅ Delivered (${orders.filter(o => o.orderStatus === 'Delivered').length})` },
          { id: 'Cancelled', label: `Cancelled (${orders.filter(o => o.orderStatus === 'Cancelled').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            style={{
              background: filterStatus === tab.id ? '#d4af37' : 'rgba(255,255,255,0.05)',
              color: filterStatus === tab.id ? '#000' : '#fff',
              border: filterStatus === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        {loading ? (
          <div style={{ color: '#d4af37' }}>Loading Orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ color: '#aaa', padding: '20px 0' }}>No orders found matching status "{filterStatus}".</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#aaa' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#fff' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Items</th>
                  <th style={{ padding: '12px' }}>Total</th>
                  <th style={{ padding: '12px' }}>Payment</th>
                  <th style={{ padding: '12px' }}>Order Status Timeline</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord._id || ord.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#d4af37' }}>
                      #{ord.orderId ? String(ord.orderId).replace(/^ORD-/, '') : String(ord._id).substring(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px', color: '#fff' }}>
                      {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                      <div style={{ fontSize: '11px', color: '#71717a' }}>{ord.shippingAddress?.city || 'India'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{ord.orderItems?.length || 1} items</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#fff' }}>₹{ord.totalPrice?.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{ord.paymentMethod}</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={ord.orderStatus || 'Pending'}
                        onChange={(e) => handleStatusChange(ord._id || ord.orderId, e.target.value)}
                        style={{
                          background: '#141419',
                          color: '#d4af37',
                          border: '1px solid rgba(212,175,55,0.4)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
