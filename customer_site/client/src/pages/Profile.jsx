import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Plus, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import API from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('mensverse_user_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '+91 9876543210'
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/myorders');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
      toast.error('Please fill in all address details');
      return;
    }

    const created = {
      ...newAddr,
      id: 'addr_' + Date.now(),
      isDefault: addresses.length === 0
    };

    const updated = [...addresses, created];
    setAddresses(updated);
    localStorage.setItem('mensverse_user_addresses', JSON.stringify(updated));
    setShowAddModal(false);
    setNewAddr({
      label: 'Home',
      fullName: user?.name || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: user?.phone || '+91 9876543210'
    });
    toast.success('New address added successfully!');
  };

  const setDefaultAddress = (id) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updated);
    localStorage.setItem('mensverse_user_addresses', JSON.stringify(updated));
    toast.success('Default address updated!');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', paddingTop: '100px', paddingBottom: '80px', paddingLeft: '5%', paddingRight: '5%' }}>
      {/* User Header */}
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d4af37', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '24px', fontFamily: 'Outfit' }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800 }}>{user.name}</h2>
            <p style={{ color: '#aaa', fontSize: '13px' }}>{user.email} • {user.phone || '+91 9876543210'}</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '10px 20px', borderRadius: '20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Main Grid: Orders & Addresses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        
        {/* Order History */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37' }}>
              <Package size={20} /> Recent Orders ({orders.length})
            </h3>
            <Link to="/my-orders" style={{ fontSize: '12px', color: '#d4af37', fontWeight: 700, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ color: '#aaa', fontSize: '13px' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ color: '#aaa', fontSize: '13px' }}>No orders placed yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((ord) => (
                <Link
                  key={ord._id}
                  to={`/orders/${ord._id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#141419',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textDecoration: 'none',
                    color: '#fff'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Order #{ord._id.substring(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.orderItems.length} items
                    </div>
                    <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: 600, marginTop: '4px' }}>
                      Status: {ord.orderStatus}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800 }}>₹{ord.totalPrice.toLocaleString()}</span>
                    <ChevronRight size={18} color="#aaa" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Saved Addresses Section */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37' }}>
              <MapPin size={20} /> Saved Delivery Addresses ({addresses.length})
            </h3>
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              style={{ background: '#d4af37', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '16px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Add Address
            </button>
          </div>

          {/* Add Address Form */}
          {showAddModal && (
            <form onSubmit={handleAddAddress} style={{ background: '#141419', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(212,175,55,0.3)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#d4af37', marginBottom: '12px' }}>New Shipping Address</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Label (Home/Office)</label>
                  <input
                    type="text"
                    required
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    style={{ width: '100%', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    style={{ width: '100%', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', marginTop: '2px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House / Flat / Street Name"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    style={{ width: '100%', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>City</label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    style={{ width: '100%', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa' }}>Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="400001"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    style={{ width: '100%', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px', marginTop: '2px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button type="submit" style={{ flex: 1, background: '#d4af37', color: '#000', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  Save Address
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Addresses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  background: '#141419',
                  padding: '16px',
                  borderRadius: '12px',
                  border: addr.isDefault ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.06)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#d4af37', background: 'rgba(212,175,55,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    {addr.label} {addr.isDefault && '• DEFAULT'}
                  </span>
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Make Default
                    </button>
                  )}
                </div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{addr.fullName}</p>
                <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{addr.street}</p>
                <p style={{ fontSize: '12px', color: '#aaa' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p style={{ fontSize: '12px', color: '#d4af37', marginTop: '4px' }}>Phone: {addr.phone}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
