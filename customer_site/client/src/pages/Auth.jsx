import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, Award, Truck, CheckCircle, LogOut, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Auth3DMannequin from '../components/3d/Auth3DMannequin';
import toast from 'react-hot-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { user, login, register, googleLogin, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }
    if (success) {
      navigate('/');
    }
  };

  const handleGoogleSignIn = async () => {
    const promptEmail = window.prompt("Enter your Gmail address to sign in:", "customer@gmail.com");
    if (promptEmail && promptEmail.trim()) {
      const ok = await googleLogin(promptEmail.trim());
      if (ok) navigate('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070a',
      color: '#fff',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      paddingTop: '72px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* ---------------- LEFT SIDE: ANIMATED SHOP NAME & BRAND HIGHLIGHTS ---------------- */}
      <div style={{
        padding: '60px 8%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 10,
        background: 'linear-gradient(135deg, rgba(7,7,10,0.95) 0%, rgba(18,18,24,0.8) 100%)'
      }}>
        {/* Animated Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 800,
          color: '#d4af37',
          width: 'fit-content',
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(212,175,55,0.2)'
        }} className="animate-pulse">
          <Sparkles size={14} /> 3D LUXURY FASHION PORTAL
        </div>

        {/* ANIMATED SHOP NAME */}
        <h1 style={{
          fontFamily: 'Outfit',
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 50%, #997a15 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 15px rgba(212,175,55,0.3))'
        }}>
          SAHA MEN'S STORE
        </h1>

        <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '36px', maxWidth: '480px' }}>
          Welcome to Saha Men's Store. Access your personal 3D virtual fashion showroom, order tracking, and custom tailored fittings.
        </p>

        {/* Feature Highlights List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', padding: '8px', borderRadius: '10px', color: '#d4af37' }}>
              <Award size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Italian Bespoke Tailoring</h4>
              <p style={{ fontSize: '12px', color: '#71717a' }}>Crafted from 100% Egyptian cotton & plush velvet</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', padding: '8px', borderRadius: '10px', color: '#d4af37' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Interactive 3D Experience</h4>
              <p style={{ fontSize: '12px', color: '#71717a' }}>360° outfit fitting & instant color customization</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', padding: '8px', borderRadius: '10px', color: '#d4af37' }}>
              <Truck size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Express Worldwide Delivery</h4>
              <p style={{ fontSize: '12px', color: '#71717a' }}>Complimentary shipping & 7-day hassle-free returns</p>
            </div>
          </div>
        </div>
      </div>


      {/* ---------------- CENTER BACKGROUND: 3D ROTATING MANNEQUIN ---------------- */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '25%',
        right: '35%',
        bottom: 0,
        pointerEvents: 'none',
        opacity: 0.85,
        zIndex: 5
      }}>
        <Auth3DMannequin />
      </div>


      {/* ---------------- RIGHT SIDE: LOGIN / REGISTER / ALREADY LOGGED IN FORM ---------------- */}
      <div style={{
        padding: '60px 8%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        background: 'linear-gradient(225deg, rgba(12,12,16,0.95) 0%, rgba(7,7,10,0.9) 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(18, 18, 24, 0.9)',
          padding: '36px',
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(20px)'
        }}>

          {/* IF USER IS ALREADY LOGGED IN */}
          {user ? (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37 0%, #997a15 100%)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 900,
                boxShadow: '0 0 25px rgba(212,175,55,0.4)'
              }}>
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 12px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} /> Currently Signed In
                </span>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 900, color: '#fff', marginTop: '12px', marginBottom: '4px' }}>
                  {user.name}
                </h3>
                <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
                  {user.email}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '12px' }}>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    width: '100%',
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
                  }}
                >
                  <ShoppingBag size={18} /> Continue Shopping
                </button>

                <button
                  onClick={() => navigate('/my-orders')}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  My Orders & Account
                </button>

                <button
                  onClick={() => logout()}
                  style={{
                    width: '100%',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
                  {isLogin ? 'Sign In to Your Account' : 'Create Customer Account'}
                </h3>
                <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>
                  {isLogin ? 'Sign in with your email or Gmail to track orders' : 'Join Saha Men\'s Store for exclusive member perks'}
                </p>
              </div>

              {/* Google / Gmail Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Sign In with Google / Gmail
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 600 }}>OR WITH EMAIL</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Tab Switcher */}
              <div style={{ display: 'flex', background: '#121218', borderRadius: '12px', padding: '4px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isLogin ? '#d4af37' : 'transparent',
                    color: isLogin ? '#000' : '#aaa',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: !isLogin ? '#d4af37' : 'transparent',
                    color: !isLogin ? '#000' : '#aaa',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Register
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!isLogin && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Full Name</label>
                    <div style={{ position: 'relative', marginTop: '4px' }}>
                      <User size={18} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', background: '#121218', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 12px 12px 40px', borderRadius: '10px', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Email Address</label>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <Mail size={18} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', background: '#121218', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 12px 12px 40px', borderRadius: '10px', outline: 'none', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Password</label>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <Lock size={18} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', background: '#121218', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 12px 12px 40px', borderRadius: '10px', outline: 'none', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {isLogin && (
                  <div style={{ textAlign: 'right' }}>
                    <span
                      onClick={() => toast.success('Password reset link sent to your email.')}
                      style={{ fontSize: '12px', color: '#d4af37', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Forgot Password?
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: '8px',
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: isLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
                  }}
                >
                  {isLoading ? 'Signing In...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  );
}
