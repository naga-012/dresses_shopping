import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statuses = ['Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Customer Orders Management</h1>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        {loading ? (
          <div style={{ color: '#d4af37' }}>Loading Orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ color: '#aaa' }}>No orders placed yet.</div>
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
                {orders.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#d4af37' }}>#{ord._id.substring(0, 8).toUpperCase()}</td>
                    <td style={{ padding: '12px', color: '#fff' }}>
                      {ord.user?.name || ord.shippingAddress?.fullName}
                      <div style={{ fontSize: '11px', color: '#71717a' }}>{ord.shippingAddress?.city}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{ord.orderItems?.length} items</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#fff' }}>₹{ord.totalPrice?.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{ord.paymentMethod}</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
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
