import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Layers, Truck, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', paddingTop: '100px' }}>
        <h2>Admin Access Required</h2>
        <p style={{ color: '#aaa', marginTop: '8px' }}>Please log in with an administrator account.</p>
        <button onClick={() => navigate('/auth')} style={{ marginTop: '20px', background: '#d4af37', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer' }}>
          Go to Login
        </button>
      </div>
    );
  }

  const menu = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products & 3D Models', path: '/admin/products', icon: ShoppingBag },
    { name: 'Collections', path: '/admin/collections', icon: Layers },
    { name: 'Orders Management', path: '/admin/orders', icon: Truck }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', paddingTop: '72px', display: 'flex' }}>
      
      {/* Admin Sidebar */}
      <div style={{
        width: '260px',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#d4af37', letterSpacing: '0.15em', marginBottom: '16px' }}>
          ADMIN MANAGEMENT
        </div>

        {menu.map((m) => {
          const Icon = m.icon;
          const isActive = location.pathname === m.path;

          return (
            <Link
              key={m.name}
              to={m.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: isActive ? '#d4af37' : 'transparent',
                color: isActive ? '#000' : '#a1a1aa',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} /> {m.name}
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '13px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Storefront
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px' }}>
        <Outlet />
      </div>
    </div>
  );
}
