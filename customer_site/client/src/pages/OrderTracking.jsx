import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, Truck, Package, Home, ArrowLeft, XCircle } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  useEffect(() => {
    const socketUrl = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
      ? 'https://customersite-psi.vercel.app'
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('order:updated', (updatedOrder) => {
      if (String(updatedOrder._id) === String(id) || String(updatedOrder.orderId) === String(id)) {
        setOrder(prev => ({ ...prev, ...updatedOrder }));
        if (updatedOrder.orderStatus === 'Cancelled') {
          toast.error('Order status updated to Cancelled');
        } else {
          toast.success(`Order status updated to ${updatedOrder.orderStatus}`);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        const localOrders = JSON.parse(localStorage.getItem('urbanfit_customer_orders') || '[]');
        const found = localOrders.find(o => String(o._id) === String(id) || String(o.orderId) === String(id));
        if (found) {
          setOrder(found);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>Loading Order...</div>;
  }

  if (!order) {
    return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Order not found.</div>;
  }

  const currentStatusIndex = statuses.indexOf(order.orderStatus === 'Order Confirmed' ? 'Confirmed' : order.orderStatus);

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', paddingTop: '100px', paddingBottom: '80px', paddingLeft: '5%', paddingRight: '5%' }}>
      <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Profile
      </Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>
            Order #{String(order.orderId || order._id).substring(0, 10).toUpperCase()}
          </h1>
          <p style={{ color: '#aaa', fontSize: '13px' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <span style={{
          background: order.orderStatus === 'Cancelled'
            ? 'rgba(239, 68, 68, 0.2)'
            : (order.orderStatus === 'Delivered' || order.orderStatus === 'Confirmed' || order.orderStatus === 'Order Confirmed')
            ? 'rgba(16, 185, 129, 0.2)'
            : 'rgba(245, 158, 11, 0.2)',
          color: order.orderStatus === 'Cancelled'
            ? '#ef4444'
            : (order.orderStatus === 'Delivered' || order.orderStatus === 'Confirmed' || order.orderStatus === 'Order Confirmed')
            ? '#10b981'
            : '#f59e0b',
          border: order.orderStatus === 'Cancelled'
            ? '1px solid rgba(239, 68, 68, 0.4)'
            : (order.orderStatus === 'Delivered' || order.orderStatus === 'Confirmed' || order.orderStatus === 'Order Confirmed')
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : '1px solid rgba(245, 158, 11, 0.4)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 700
        }}>
          {order.orderStatus}
        </span>
      </div>

      {/* Cancelled Banner if Order was Cancelled by Admin */}
      {order.orderStatus === 'Cancelled' ? (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <XCircle size={36} color="#ef4444" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', margin: 0 }}>This Order Was Cancelled</h3>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '4px 0 0 0' }}>The store administrator has marked this order as Cancelled. For questions, please contact support.</p>
          </div>
        </div>
      ) : (
        /* Visual Timeline Stepper */
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#d4af37' }}>
            Delivery Status Timeline
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflowX: 'auto', paddingBottom: '10px' }}>
            {statuses.map((st, index) => {
              const isCompleted = index <= currentStatusIndex && currentStatusIndex !== -1;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, minWidth: '110px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isCompleted ? '#d4af37' : '#1e1e24',
                    color: isCompleted ? '#000' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px',
                    boxShadow: isCurrent ? '0 0 15px rgba(212, 175, 55, 0.6)' : 'none'
                  }}>
                    {isCompleted ? <CheckCircle size={20} /> : index + 1}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: isCurrent ? 700 : 500, color: isCompleted ? '#fff' : '#666', textAlign: 'center' }}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ordered Items & Shipping Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Items</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.orderItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>Size: {item.size} | Qty: {item.qty}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#d4af37' }}>
                  ₹{(item.price * item.qty).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Shipping Address</h4>
          <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>
            <p style={{ color: '#fff', fontWeight: 600 }}>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p style={{ marginTop: '8px', color: '#d4af37' }}>Phone: {order.shippingAddress.phone}</p>
            <p style={{ marginTop: '4px' }}>Payment Method: <strong style={{ color: '#fff' }}>{order.paymentMethod}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
