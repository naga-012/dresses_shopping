import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Plus, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import API from '../api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function Profile() {
  const { user, logout, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('urbanfit_customer_orders') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

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
    phone: user?.phone || ''
  });

  // Real-time socket sync for orders
  useEffect(() => {
    const socketUrl = typeof window !== 'undefined' && window.location.hostname.includes('render.com')
      ? 'https://saha-backend-api.onrender.com'
      : typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
        ? 'https://customersite-psi.vercel.app'
        : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('order:updated', (updatedOrder) => {
      if (!updatedOrder) return;
      const targetStatus = updatedOrder.orderStatus;
      const cleanTargetKey = String(updatedOrder.orderId || updatedOrder._id || '').replace(/^ORD-/, '');

      setOrders(prev => prev.map(o => {
        const oKey = String(o.orderId || o._id || '').replace(/^ORD-/, '');
        const isMatch = String(o._id) === String(updatedOrder._id) ||
          (o.orderId && updatedOrder.orderId && String(o.orderId) === String(updatedOrder.orderId)) ||
          oKey === cleanTargetKey;
        if (isMatch) {
          return { ...o, ...updatedOrder, orderStatus: targetStatus || o.orderStatus };
        }
        return o;
      }));

      try {
        const local = JSON.parse(localStorage.getItem('urbanfit_customer_orders') || '[]');
        const updatedLocal = local.map(o => {
          const oKey = String(o.orderId || o._id || '').replace(/^ORD-/, '');
          const isMatch = String(o._id) === String(updatedOrder._id) ||
            (o.orderId && updatedOrder.orderId && String(o.orderId) === String(updatedOrder.orderId)) ||
            oKey === cleanTargetKey;
          if (isMatch) {
            return { ...o, ...updatedOrder, orderStatus: targetStatus || o.orderStatus };
          }
          return o;
        });
        localStorage.setItem('urbanfit_customer_orders', JSON.stringify(updatedLocal));
      } catch (e) {}
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');

    let isMounted = true;
    const fetchOrders = async (showLoading = true) => {
      try {
        if (showLoading && orders.length === 0) setLoading(true);
        const res = await API.get('/orders/myorders');
        const apiOrders = Array.isArray(res.data) ? res.data : [];

        // Read local cache and merge latest status
        const localOrders = JSON.parse(localStorage.getItem('urbanfit_customer_orders') || '[]');
        const updatedLocal = localOrders.map(lo => {
          const match = apiOrders.find(ao => {
            const loKey = String(lo.orderId || lo._id || '').replace(/^ORD-/, '');
            const aoKey = String(ao.orderId || ao._id || '').replace(/^ORD-/, '');
            return loKey === aoKey || String(ao._id) === String(lo._id) || String(ao.orderId) === String(lo.orderId);
          });
          if (match && match.orderStatus) {
            return { ...lo, ...match, orderStatus: match.orderStatus };
          }
          return lo;
        });

        try {
          localStorage.setItem('urbanfit_customer_orders', JSON.stringify(updatedLocal));
        } catch (e) {}

        const serverKeys = new Set();
        apiOrders.forEach(o => {
          if (o._id) serverKeys.add(String(o._id));
          if (o.orderId) serverKeys.add(String(o.orderId).replace(/^ORD-/, ''));
        });

        const missingOnServer = updatedLocal.filter(lo => {
          const key = String(lo.orderId || lo._id || '').replace(/^ORD-/, '');
          return !serverKeys.has(key) && !serverKeys.has(String(lo._id));
        });

        const merged = [...apiOrders, ...missingOnServer].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (isMounted) setOrders(merged);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          const localOrders = JSON.parse(localStorage.getItem('urbanfit_customer_orders') || '[]');
          if (localOrders.length > 0) setOrders(localOrders);
        }
      } finally {
        if (isMounted && showLoading) setLoading(false);
      }
    };

    fetchOrders(true);

    // Auto-poll every 5 seconds to keep Profile orders live
    const interval = setInterval(() => fetchOrders(false), 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const ok = await updateProfile(editName, editEmail, editPhone);
    if (ok) {
      setIsEditingProfile(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    toast.loading('Detecting Google GPS location...', { id: 'prof-loc' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const gUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addrObj = data.address;
            const road = addrObj.road || addrObj.suburb || addrObj.neighbourhood || '';
            const house = addrObj.house_number || '';
            const suburb = addrObj.suburb || addrObj.city_district || '';
            const city = addrObj.city || addrObj.town || addrObj.village || addrObj.state_district || '';
            const state = addrObj.state || '';
            const pincode = addrObj.postcode || '';
            const streetString = [house, road, suburb].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || 'GPS Location';

            setNewAddr(prev => ({
              ...prev,
              street: streetString,
              city: city || prev.city,
              state: state || prev.state,
              pincode: pincode || prev.pincode,
              googleMapsUrl: gUrl,
              lat: latitude,
              lng: longitude
            }));
            toast.success('Google GPS Location detected & filled!', { id: 'prof-loc' });
          } else {
            setNewAddr(prev => ({ ...prev, googleMapsUrl: gUrl, lat: latitude, lng: longitude }));
            toast.success('Google GPS coordinates captured!', { id: 'prof-loc' });
          }
        } catch (e) {
          setNewAddr(prev => ({ ...prev, googleMapsUrl: gUrl, lat: latitude, lng: longitude }));
          toast.success('Google GPS location captured!', { id: 'prof-loc' });
        }
      },
      (error) => {
        toast.error('Location permission denied.', { id: 'prof-loc' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
      toast.error('Please fill in all address details');
      return;
    }

    const fullAddressStr = [newAddr.street, newAddr.city, newAddr.state, newAddr.pincode].filter(Boolean).join(', ');
    const finalGUrl = newAddr.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`;

    const created = {
      ...newAddr,
      googleMapsUrl: finalGUrl,
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
      phone: user?.phone || '',
      googleMapsUrl: '',
      lat: null,
      lng: null
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
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d4af37', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '24px', fontFamily: 'Outfit' }}>
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800 }}>{user.name || 'Valued Customer'}</h2>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '4px 0 0 0' }}>
              {user.email} {user.phone ? `• ${user.phone}` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#d4af37', padding: '10px 18px', borderRadius: '20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            {isEditingProfile ? 'Close Edit' : 'Edit Profile & Phone'}
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '10px 20px', borderRadius: '20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '1px solid #d4af37' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, color: '#d4af37', marginBottom: '16px' }}>Update Customer Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Gmail / Email Address</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Mobile Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', fontSize: '13px' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button type="submit" style={{ background: '#d4af37', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
              Save Profile Changes
            </button>
            <button type="button" onClick={() => setIsEditingProfile(false)} style={{ background: 'transparent', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

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
              {orders.map((ord) => {
                const targetId = ord.orderId || ord._id;
                const statusColor = ord.orderStatus === 'Cancelled' ? '#ef4444' :
                  (ord.orderStatus === 'Delivered' || ord.orderStatus === 'Confirmed' || ord.orderStatus === 'Order Confirmed') ? '#10b981' :
                  ord.orderStatus === 'Processing' ? '#d4af37' :
                  ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery' ? '#3b82f6' :
                  '#f59e0b';
                const statusBg = ord.orderStatus === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' :
                  (ord.orderStatus === 'Delivered' || ord.orderStatus === 'Confirmed' || ord.orderStatus === 'Order Confirmed') ? 'rgba(16, 185, 129, 0.15)' :
                  ord.orderStatus === 'Processing' ? 'rgba(212, 175, 55, 0.18)' :
                  ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery' ? 'rgba(59, 130, 246, 0.15)' :
                  'rgba(245, 158, 11, 0.15)';
                const statusBorder = ord.orderStatus === 'Cancelled' ? 'rgba(239, 68, 68, 0.4)' :
                  (ord.orderStatus === 'Delivered' || ord.orderStatus === 'Confirmed' || ord.orderStatus === 'Order Confirmed') ? 'rgba(16, 185, 129, 0.4)' :
                  ord.orderStatus === 'Processing' ? 'rgba(212, 175, 55, 0.5)' :
                  ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery' ? 'rgba(59, 130, 246, 0.4)' :
                  'rgba(245, 158, 11, 0.4)';

                return (
                  <Link
                    key={ord._id || ord.orderId}
                    to={`/orders/${targetId}`}
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
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>
                        Order #{String(ord.orderId || ord._id).substring(0, 10).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                        {new Date(ord.createdAt).toLocaleDateString()} • {(ord.orderItems || []).length} items
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusBorder}`
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }}></span>
                          {ord.orderStatus || 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800 }}>₹{(ord.totalPrice || 0).toLocaleString()}</span>
                      <ChevronRight size={18} color="#aaa" />
                    </div>
                  </Link>
                );
              })}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#d4af37', margin: 0 }}>New Shipping Address</h4>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', color: '#d4af37', padding: '4px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  📍 Use Google Location (GPS)
                </button>
              </div>
              
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
