import React, { useEffect, useState } from 'react';
import { IndianRupee, ShoppingBag, Truck, Users, ArrowUpRight } from 'lucide-react';
import API from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ color: '#d4af37' }}>Loading Dashboard Stats...</div>;
  if (!stats) return <div style={{ color: '#fff' }}>Failed to load stats.</div>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Overview Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>TOTAL REVENUE</span>
            <IndianRupee size={20} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>₹{stats.totalRevenue.toLocaleString()}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>TOTAL ORDERS</span>
            <Truck size={20} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{stats.totalOrders}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>PRODUCTS IN CATALOG</span>
            <ShoppingBag size={20} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{stats.totalProducts}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>REGISTERED USERS</span>
            <Users size={20} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{stats.totalUsers}</div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
          Recent Orders
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#aaa' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#fff' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Total</th>
                <th style={{ padding: '12px' }}>Payment</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((ord) => (
                <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#d4af37' }}>#{ord._id.substring(0, 8).toUpperCase()}</td>
                  <td style={{ padding: '12px', color: '#fff' }}>{ord.user?.name || 'Guest'}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#fff' }}>₹{ord.totalPrice.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{ord.paymentMethod}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                      {ord.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
