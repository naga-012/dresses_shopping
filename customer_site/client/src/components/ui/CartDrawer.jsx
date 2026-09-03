import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQty, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  // Prevent background body scroll when Cart Drawer is open on mobile devices
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal === 0 ? 0 : 100;
  const finalTotal = subtotal + deliveryCharge;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      touchAction: 'none'
    }}>
      {/* Overlay backdrop click to close */}
      <div style={{ flex: 1 }} onClick={toggleCart} />

      {/* Cart Drawer Panel */}
      <div style={{
        width: '100%',
        maxWidth: '450px',
        height: '100vh',
        maxHeight: '100dvh',
        background: '#0e0e12',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
        animation: 'slideIn 0.3s ease-out',
        touchAction: 'pan-y'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#d4af37" />
            <h3 style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 700, color: '#fff' }}>Your Bag</h3>
          </div>
          <button
            onClick={toggleCart}
            style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items List - Scrollable on mobile & desktop */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717a' }}>
              <ShoppingBag size={48} color="#333" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '15px', color: '#a1a1aa' }}>Your shopping bag is empty.</p>
              <button
                onClick={() => { toggleCart(); navigate('/3d-experience'); }}
                style={{
                  marginTop: '20px',
                  background: '#d4af37',
                  color: '#000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <img
                  src={item.product.images?.[0] || item.product.thumbnail || '/uploads/cap1.png'}
                  alt={item.product.name}
                  style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{item.product.name}</h4>
                      <button
                        onClick={() => removeFromCart(idx)}
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>Size: <strong style={{ color: '#fff' }}>{item.size}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Color: <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.colorHex, display: 'inline-block' }} />
                        <strong style={{ color: '#fff' }}>{item.color}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      padding: '4px 8px'
                    }}>
                      <button onClick={() => updateQty(idx, item.qty - 1)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '2px 6px' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', padding: '0 8px' }}>{item.qty}</span>
                      <button onClick={() => updateQty(idx, item.qty + 1)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '2px 6px' }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#d4af37' }}>
                      ₹{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Calculations */}
        {cart.length > 0 && (
          <div style={{
            padding: '16px 24px 85px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0a0a0e',
            flexShrink: 0
          }} className="cart-drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
              <span>Subtotal</span>
              <span style={{ color: '#fff' }}>₹{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#a1a1aa', marginBottom: '10px' }}>
              <span>Delivery</span>
              <span style={{ color: deliveryCharge === 0 ? '#10b981' : '#fff' }}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <span>Total</span>
              <span style={{ color: '#d4af37' }}>₹{finalTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => { toggleCart(); navigate('/checkout'); }}
              style={{
                width: '100%',
                background: '#d4af37',
                color: '#000',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
              }}
            >
              Checkout Now <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
