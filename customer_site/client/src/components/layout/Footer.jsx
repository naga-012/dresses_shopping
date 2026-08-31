import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, RefreshCw, Award, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#09090b',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '60px 5% 30px 5%',
      color: '#a1a1aa'
    }}>
      {/* Value props banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '30px',
        paddingBottom: '50px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Shield size={32} color="#d4af37" />
          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>100% Authentic</h4>
            <p style={{ fontSize: '13px', color: '#71717a' }}>Directly sourced luxury fabrics</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Truck size={32} color="#d4af37" />
          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>Express Delivery</h4>
            <p style={{ fontSize: '13px', color: '#71717a' }}>Complimentary shipping over ₹2,999</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <RefreshCw size={32} color="#d4af37" />
          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>Interactive 3D Fit</h4>
            <p style={{ fontSize: '13px', color: '#71717a' }}>Inspect 360° before you buy</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Award size={32} color="#d4af37" />
          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>7-Day Returns</h4>
            <p style={{ fontSize: '13px', color: '#71717a' }}>Hassle-free exchange policy</p>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '40px',
        padding: '50px 0'
      }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.08em', marginBottom: '16px' }}>
            SAHA MEN'S STORE
          </h3>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#71717a' }}>
            Pioneering the future of digital luxury menswear. Experience high-end garments in 3D interactive real-time canvas.
          </p>
        </div>


        <div>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.05em' }}>
            CATEGORIES
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <Link to="/shop?category=Shirts" style={{ color: '#a1a1aa' }}>Shirts & Polo</Link>
            <Link to="/shop?category=Jackets" style={{ color: '#a1a1aa' }}>Biker & Leather Jackets</Link>
            <Link to="/shop?category=Blazers" style={{ color: '#a1a1aa' }}>Suits & Blazers</Link>
            <Link to="/shop?category=Traditional Wear" style={{ color: '#a1a1aa' }}>Royal Sherwanis</Link>
            <Link to="/shop?category=Shoes" style={{ color: '#a1a1aa' }}>Derbies & Boots</Link>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.05em' }}>
            CUSTOMER CARE
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <Link to="/orders" style={{ color: '#a1a1aa' }}>Track Order</Link>
            <Link to="#" style={{ color: '#a1a1aa' }}>Size & Fit Guide</Link>
            <Link to="#" style={{ color: '#a1a1aa' }}>Razorpay Payment FAQ</Link>
            <Link to="#" style={{ color: '#a1a1aa' }}>Shipping Policy</Link>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.05em' }}>
            STAY CONNECTED
          </h4>
          <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
            Subscribe to receive private 3D drop notifications.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a
              href="https://www.instagram.com/olddfogeyy/"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow @olddfogeyy on Instagram"
              style={{ color: '#d4af37', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              <Instagram size={20} color="#d4af37" style={{ cursor: 'pointer' }} />
            </a>
            <Twitter size={20} color="#d4af37" style={{ cursor: 'pointer' }} />
            <Facebook size={20} color="#d4af37" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#52525b' }}>
        © 2026 MENSVERSE Inc. All rights reserved. Powered by Three.js & React.
      </div>
    </footer>
  );
}
