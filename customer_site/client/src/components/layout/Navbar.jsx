import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Heart, Menu, X, Instagram, Sparkles, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { getItemCount, toggleCart } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getItemCount();
  const wishlistCount = getWishlistCount();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/shop' },
    { name: '3D EXPERIENCE', path: '/3d-experience' },
    { name: 'NEW ARRIVALS', path: '/shop?filter=new' },
    { name: 'MY ORDERS', path: '/my-orders' }
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="site-navbar">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #d4af37 0%, #997a15 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 900,
            fontSize: '18px',
            boxShadow: '0 0 15px rgba(212,175,55,0.4)'
          }}>
            💎
          </div>
          <div>
            <div style={{
              fontFamily: 'Outfit',
              fontWeight: 900,
              fontSize: '18px',
              letterSpacing: '0.12em',
              color: '#fff',
              lineHeight: 1
            }}>
              URBAN FIT
            </div>
            <div style={{
              fontSize: '9px',
              fontWeight: 700,
              color: '#d4af37',
              letterSpacing: '0.18em',
              marginTop: '2px'
            }}>
              3D FASHION STORE
            </div>
          </div>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="nav-desktop-links">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path.includes('filter=new') && location.search.includes('filter=new'));

            return (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: '0.08em',
                  color: isActive ? '#d4af37' : '#a1a1aa',
                  textDecoration: 'none',
                  paddingBottom: '4px',
                  borderBottom: isActive ? '2px solid #d4af37' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Instagram Link (Desktop) */}
          <a
            href="https://www.instagram.com/olddfogeyy/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram @olddfogeyy"
            className="nav-desktop-only"
            style={{ color: '#d4af37', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Instagram size={20} />
          </a>

          {/* Search */}
          <Link to="/shop" title="Search Catalog" style={{ color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Search size={20} />
          </Link>

          {/* Wishlist */}
          <Link to="/shop?filter=wishlist" style={{ position: 'relative', cursor: 'pointer', color: wishlistCount > 0 ? '#ef4444' : '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="Wishlist">
            <Heart size={20} fill={wishlistCount > 0 ? '#ef4444' : 'none'} color={wishlistCount > 0 ? '#ef4444' : '#aaa'} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                fontSize: '9px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Bag */}
          <button
            onClick={toggleCart}
            title="Shopping Cart"
            style={{
              background: 'none',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ShoppingBag size={20} />
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              background: '#d4af37',
              color: '#000',
              fontSize: '10px',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          </button>

          {/* User Account (Desktop) */}
          <Link to={user ? "/profile" : "/auth"} title="Profile Account" className="nav-desktop-only" style={{ color: '#aaa', display: 'flex', alignItems: 'center' }}>
            <User size={20} />
          </Link>

          {/* Hamburger Menu Toggle (Mobile Only) */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} color="#d4af37" /> : <Menu size={24} color="#fff" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #997a15 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 900
                }}>
                  💎
                </div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, color: '#fff', fontSize: '18px' }}>
                  URBAN FIT
                </span>
              </div>
              <button onClick={closeMobileMenu} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* User status box */}
            <div className="mobile-user-card">
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{user.name || user.email}</div>
                    <div style={{ color: '#d4af37', fontSize: '12px', fontWeight: 500 }}>{user.role === 'admin' ? '⚡ Administrator' : 'VIP Member'}</div>
                  </div>
                  <Link to="/profile" onClick={closeMobileMenu} style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 600 }}>
                    Profile
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ color: '#aaa', fontSize: '13px' }}>Welcome! Sign in to track orders</div>
                  <Link to="/auth" onClick={closeMobileMenu} style={{ background: '#d4af37', color: '#000', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <div className="mobile-menu-links">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className="mobile-nav-link"
                >
                  <span>{link.name}</span>
                  <ChevronRight size={18} color="#555" />
                </Link>
              ))}

              {user?.role === 'admin' && (
                <Link to="/admin" onClick={closeMobileMenu} className="mobile-nav-link" style={{ color: '#d4af37' }}>
                  <span>⚡ ADMIN DASHBOARD</span>
                  <ChevronRight size={18} color="#d4af37" />
                </Link>
              )}
            </div>

            {/* Mobile Footer info inside drawer */}
            <div className="mobile-drawer-footer">
              <a
                href="https://www.instagram.com/olddfogeyy/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
              >
                <Instagram size={18} /> Follow on Instagram @olddfogeyy
              </a>

              {user && (
                <button
                  onClick={() => { logout(); closeMobileMenu(); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '14px' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
