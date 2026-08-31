import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, Truck, CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import API from '../api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function MyOrders() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('order:updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => String(o._id) === String(updatedOrder._id) ? { ...o, ...updatedOrder } : o));
      if (updatedOrder.orderStatus === 'Cancelled') {
        toast.error(`Order #${String(updatedOrder.orderId || updatedOrder._id).substring(0, 10).toUpperCase()} has been Cancelled`);
      } else {
        toast.success(`Order #${String(updatedOrder.orderId || updatedOrder._id).substring(0, 10).toUpperCase()} status updated to ${updatedOrder.orderStatus}`);
      }
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

    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/myorders');
        const apiOrders = Array.isArray(res.data) ? res.data : [];
        const localOrders = JSON.parse(localStorage.getItem('urbanfit_customer_orders') || '[]');
        const dbIds = new Set(apiOrders.map(o => String(o._id)));
        const uniqueLocal = localOrders.filter(o => !dbIds.has(String(o._id)));
        const merged = [...apiOrders, ...uniqueLocal].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(merged);
      } catch (err) {
        console.error('Error fetching orders:', err);
        const localOrders = JSON.parse(localStorage.getItem('urbanfit_customer_orders') || '[]');
        setOrders(localOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Order Confirmed':
      case 'Delivered':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'rgba(16, 185, 129, 0.5)' };
      case 'Shipped':
      case 'Out for Delivery':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' };
      case 'Processing':
        return { bg: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', border: 'rgba(212, 175, 55, 0.4)' };
      case 'Cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
      case 'Pending':
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', paddingTop: '100px', paddingBottom: '80px', paddingLeft: '5%', paddingRight: '5%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            Your Orders
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>
            Manage and track all your active and past purchases
          </p>
        </div>

        <Link
          to="/shop"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>

      {/* Orders List Container */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#d4af37', fontSize: '16px', fontWeight: 600 }}>
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px 20px',
            borderRadius: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '500px',
            margin: '40px auto'
          }}
        >
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#d4af37' }}>
            <Package size={36} />
          </div>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>No Orders Found</h3>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px', maxWidth: '360px', lineHeight: 1.5 }}>
            You haven't placed any orders yet. Explore our 3D fashion collection and make your first purchase!
          </p>
          <button
            onClick={() => navigate('/shop')}
            style={{
              background: '#d4af37',
              color: '#000',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '24px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
            }}
          >
            Explore 3D Collection
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((ord) => {
            const statusStyle = getStatusColor(ord.orderStatus);

            return (
              <div
                key={ord._id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s ease',
                  background: 'rgba(18, 18, 24, 0.7)'
                }}
              >
                {/* Order Summary Header */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    paddingBottom: '20px',
                    marginBottom: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                        Order #{ord._id.substring(0, 10).toUpperCase()}
                      </span>
                      <span
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 800
                        }}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                    <p style={{ color: '#a1a1aa', fontSize: '13px', marginTop: '6px' }}>
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • Payment: <strong style={{ color: '#fff' }}>{ord.paymentMethod}</strong>
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Total Paid</span>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#d4af37' }}>
                      ₹{ord.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {ord.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '60px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                          Size: <strong style={{ color: '#fff' }}>{item.size}</strong> • Qty: <strong style={{ color: '#fff' }}>{item.qty}</strong>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#d4af37', marginTop: '4px' }}>
                          ₹{(item.price * item.qty).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '13px', color: '#aaa' }}>
                    Deliver to: <strong style={{ color: '#fff' }}>{ord.shippingAddress?.fullName || user.name}</strong> ({ord.shippingAddress?.city}, {ord.shippingAddress?.state})
                  </div>

                  <Link
                    to={`/orders/${ord._id}`}
                    style={{
                      background: '#d4af37',
                      color: '#000',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '13px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 15px rgba(212,175,55,0.2)'
                    }}
                  >
                    Track & View Details <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
