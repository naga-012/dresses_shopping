import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Sparkles, Box } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { getWishlistCount } = useWishlistStore();
  const { getItemCount } = useCartStore();

  const wishlistCount = getWishlistCount();
  const cartCount = getItemCount();

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: '3D Fit', path: '/3d-experience', icon: Sparkles, highlight: true },
    { name: 'Wishlist', path: '/shop?filter=wishlist', icon: Heart, badge: wishlistCount },
    { name: 'Profile', path: user ? '/profile' : '/auth', icon: User }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || (tab.path.includes('filter=wishlist') && location.search.includes('filter=wishlist'));

        return (
          <Link
            key={tab.name}
            to={tab.path}
            className={`mobile-tab-item ${isActive ? 'active' : ''} ${tab.highlight ? 'highlight-tab' : ''}`}
          >
            <div className="icon-wrapper">
              <Icon size={20} color={tab.highlight ? '#000' : (isActive ? '#d4af37' : '#888')} />
              {tab.badge > 0 && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </div>
            <span className="tab-label" style={{ color: tab.highlight ? '#d4af37' : undefined }}>
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
