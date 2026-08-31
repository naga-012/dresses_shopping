import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Smartphone, Banknote, ArrowRight, MapPin, Navigation, Loader2, Search } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import API from '../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'Credit Card', 'Debit Card', 'COD'
  const [loading, setLoading] = useState(false);
  const [detectingLoc, setDetectingLoc] = useState(false);

  // Search Area / Landmark Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  // Clear pre-filled dummy addresses from storage
  useEffect(() => {
    localStorage.removeItem('mensverse_user_addresses');
  }, []);

  const handleSearchLocation = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearchingLoc(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingLoc(false);
    }
  };

  const handleSelectSuggestion = (place) => {
    const addrObj = place.address || {};
    const road = addrObj.road || addrObj.suburb || addrObj.neighbourhood || '';
    const house = addrObj.house_number || '';
    const suburb = addrObj.suburb || addrObj.city_district || '';
    const city = addrObj.city || addrObj.town || addrObj.village || addrObj.state_district || place.display_name?.split(',')[0] || '';
    const state = addrObj.state || '';
    const pincode = addrObj.postcode || '';

    const streetString = [house, road, suburb].filter(Boolean).join(', ') || place.display_name?.split(',').slice(0, 2).join(',') || searchQuery;

    setAddress(prev => ({
      ...prev,
      street: streetString,
      city: city || prev.city,
      state: state || prev.state,
      pincode: pincode || prev.pincode
    }));

    setSuggestions([]);
    setSearchQuery('');
    toast.success('Address details auto-filled!');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your device browser.');
      return;
    }

    setDetectingLoc(true);
    toast.loading('Detecting your GPS location...', { id: 'loc-toast' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
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

            const streetString = [house, road, suburb].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || 'Current GPS Location';

            setAddress(prev => ({
              ...prev,
              street: streetString,
              city: city || prev.city,
              state: state || prev.state,
              pincode: pincode || prev.pincode
            }));

            toast.success('Location auto-detected & filled!', { id: 'loc-toast' });
          } else {
            toast.error('Location detected, please type street address.', { id: 'loc-toast' });
          }
        } catch (err) {
          console.error(err);
          toast.error('Location coordinates captured.', { id: 'loc-toast' });
        } finally {
          setDetectingLoc(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error('Location permission denied or unavailable.', { id: 'loc-toast' });
        setDetectingLoc(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const subtotal = getCartTotal();
  const deliveryPrice = subtotal === 0 ? 0 : 100;
  const totalPrice = subtotal + deliveryPrice;

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', paddingTop: '100px' }}>
        <h2>Your bag is empty</h2>
        <button onClick={() => navigate('/shop')} style={{ marginTop: '20px', background: '#d4af37', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.fullName || !address.street || !address.city || !address.pincode || !address.phone) {
      toast.error('Please fill in all delivery address details');
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0],
        price: item.price,
        size: item.size,
        color: item.color,
        qty: item.qty
      }));

      const payload = {
        orderItems,
        shippingAddress: address,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: deliveryPrice,
        totalPrice
      };

      const res = await API.post('/orders', payload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      console.error('Order placement error:', err);
      const msg = err.response?.data?.message || (err.code === 'ECONNABORTED' ? 'Request timed out' : 'Failed to place order. Please try again.');
      toast.error(msg);
      if (err.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', paddingTop: '100px', paddingBottom: '80px', paddingLeft: '5%', paddingRight: '5%' }}>
      <h1 style={{ fontFamily: 'Outfit', fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        
        {/* Left: Address & Payment */}
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Step 1: Delivery Address Form */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, margin: 0, color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} /> 1. Delivery Address
              </h3>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={detectingLoc}
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid #d4af37',
                  color: '#d4af37',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: detectingLoc ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {detectingLoc ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                {detectingLoc ? 'Detecting...' : 'Use Current Location'}
              </button>
            </div>

            {/* Interactive Location Search Box */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#d4af37', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} /> Easy Search Area / Landmark
              </label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="Type locality, street, or city (e.g. Andheri East, Koramangala)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchLocation(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#181822',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#fff',
                    padding: '12px 14px 12px 38px',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '13px',
                    boxShadow: '0 0 15px rgba(212,175,55,0.1)'
                  }}
                />
                <Search size={16} color="#d4af37" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                {isSearchingLoc && <Loader2 size={16} color="#d4af37" className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  background: '#14141d',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '10px',
                  marginTop: '4px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
                  overflow: 'hidden'
                }}>
                  {suggestions.map((place, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(place)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        fontSize: '12px',
                        color: '#ddd',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <MapPin size={14} color="#d4af37" style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {place.display_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', marginTop: '4px', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="House / Flat / Street Name / Locality"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', marginTop: '4px', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>City</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', marginTop: '4px', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Pincode</label>
                <input
                  type="text"
                  required
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', marginTop: '4px', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="Mobile Number"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', marginTop: '4px', outline: 'none', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Gateway Selection */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#d4af37' }}>
              2. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'UPI', label: 'UPI / GPay / PhonePe / Paytm', icon: Smartphone },
                { id: 'Credit Card', label: 'Credit Card (Visa / Mastercard)', icon: CreditCard },
                { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
                { id: 'COD', label: 'Cash on Delivery (COD)', icon: Banknote }
              ].map((pm) => {
                const Icon = pm.icon;
                const selected = paymentMethod === pm.id;

                return (
                  <div key={pm.id}>
                    <div
                      onClick={() => setPaymentMethod(pm.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        borderRadius: '10px',
                        background: selected ? 'rgba(212, 175, 55, 0.15)' : '#141419',
                        border: selected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon size={20} color={selected ? '#d4af37' : '#aaa'} />
                      <span style={{ fontSize: '14px', fontWeight: selected ? 700 : 500, color: '#fff' }}>{pm.label}</span>
                    </div>

                    {/* Specific UPI Details Panel */}
                    {selected && pm.id === 'UPI' && (
                      <div style={{
                        marginTop: '10px',
                        padding: '16px',
                        background: 'rgba(212, 175, 55, 0.08)',
                        border: '1px dashed rgba(212, 175, 55, 0.4)',
                        borderRadius: '10px',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ color: '#aaa' }}>Merchant UPI VPA:</span>
                          <span style={{ color: '#d4af37', fontWeight: 700, fontFamily: 'monospace' }}>sahastore@upi</span>
                        </div>
                        <p style={{ color: '#71717a', fontSize: '11px', lineHeight: 1.4 }}>
                          ⚡ Instant UPI Payment: Click "Place Order" to authorize payment via GPay/PhonePe.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#d4af37',
              color: '#000',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '16px',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(212,175,55,0.4)'
            }}
          >
            {loading ? 'Processing Order...' : `Place Order (₹${totalPrice.toLocaleString()})`} <ArrowRight size={20} />
          </button>
        </form>

        {/* Right: Order Summary */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.product.images?.[0] || item.product.thumbnail || '/uploads/cap1.png'} alt={item.product.name} style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{item.product.name}</h5>
                    <p style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>Size: {item.size} • Qty: {item.qty}</p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#d4af37' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#aaa' }}>
                <span>Subtotal</span>
                <span style={{ color: '#fff' }}>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#aaa' }}>
                <span>Delivery Charge</span>
                <span style={{ color: deliveryPrice === 0 ? '#10b981' : '#fff' }}>
                  {deliveryPrice === 0 ? 'FREE' : `₹${deliveryPrice}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total Amount</span>
                <span style={{ color: '#d4af37' }}>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px' }}>
              <ShieldCheck size={16} /> 256-Bit SSL Encrypted & 100% Safe Checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
