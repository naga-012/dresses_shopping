import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Stores
import { useAuthStore } from './store/authStore';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/ui/CartDrawer';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ThreeDExperiencePage from './pages/ThreeDExperiencePage';
import ProductDetail3D from './pages/ProductDetail3D';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Collections from './pages/admin/Collections';
import Orders from './pages/admin/Orders';

// Auth Guard Component: Redirect to /auth if user is not logged in
function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

export default function App() {
  const { fetchProfile, user } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <BrowserRouter>
      <div style={{ background: '#070709', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <Navbar />
        <CartDrawer />

        <div className="app-main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail3D />} />
            <Route path="/3d-experience" element={<ThreeDExperiencePage />} />
            <Route path="/auth" element={<Auth />} />

            {/* User Protected Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="collections" element={<Collections />} />
              <Route path="orders" element={<Orders />} />
            </Route>

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}
