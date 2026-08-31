import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, Award, Truck, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Auth3DMannequin from '../components/3d/Auth3DMannequin';
import toast from 'react-hot-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, register, isLoading } = useAuthStore();
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
          Welcome to Saha Men's Store. Sign in to access your personal 3D virtual fashion showroom, order tracking, and custom tailored fittings.
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


      {/* ---------------- RIGHT SIDE: LOGIN / REGISTER FORM ---------------- */}
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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 900, color: '#fff' }}>
              {isLogin ? 'Sign In to Your Account' : 'Create Customer Account'}
            </h3>
            <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>
              {isLogin ? 'Enter your credentials to access orders & saved fittings' : 'Join Saha Men\'s Store for exclusive member perks'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: '#121218', borderRadius: '12px', padding: '4px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
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
                  placeholder="name@example.com"
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

          {/* Quick 1-Click Demo Login Options */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#71717a', textAlign: 'center', fontWeight: 600 }}>OR INSTANT 1-CLICK SIGN IN</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={async () => {
                  const ok = await login('myakalanagarjun09@gmail.com', '123456');
                  if (ok) navigate('/');
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                ⚡ Member Sign In
              </button>

              <button
                type="button"
                onClick={async () => {
                  const ok = await login('admin@mensverse.com', 'adminpassword123');
                  if (ok) navigate('/admin');
                }}
                style={{
                  flex: 1,
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#d4af37',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                👑 Admin Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
