import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, ShoppingBag, Star, ShieldCheck, Zap, Award, Truck, Heart } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import API from '../api';
import toast from 'react-hot-toast';

import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export default function Home() {
  const navigate = useNavigate();
  const { activeCategory, setActiveCategory, selectedProduct, setSelectedProduct } = useUIStore();
  const { cart, addToCart, getProductQty, decrementProduct } = useCartStore();
  const { wishlist, toggleWishlist, isWishlisted } = useWishlistStore();

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const categories = ['Shirts', 'T-Shirts', 'Hoodies', 'Jackets', 'Blazers', 'Jeans', 'Pants', 'Shoes', 'Traditional Wear'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await API.get('/products');
        const list = Array.isArray(prodRes.data) ? prodRes.data : (Array.isArray(prodRes.data?.products) ? prodRes.data.products : FALLBACK_PRODUCTS);
        if (list && list.length > 0) {
          setProducts(list);
          if (!selectedProduct) setSelectedProduct(list[0]);
        } else {
          setProducts(FALLBACK_PRODUCTS);
          if (!selectedProduct) setSelectedProduct(FALLBACK_PRODUCTS[0]);
        }
      } catch (err) {
        console.error('Failed to fetch storefront data, using fallback products', err);
        setProducts(FALLBACK_PRODUCTS);
        if (!selectedProduct) setSelectedProduct(FALLBACK_PRODUCTS[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const handleDressClick = (product) => {
    setSelectedProduct(product);
    if (product.category) setActiveCategory(product.category);
    navigate(`/shop`);
  };

  const trendingProducts = products.slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', paddingTop: '72px' }}>

      {/* 1. LUXURY HERO SECTION */}
      <section className="hero-responsive-container" style={{
        position: 'relative',
        minHeight: '82vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 5%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 60%)'
      }}>
        {/* Hero Left Copy */}
        <div style={{ maxWidth: '580px', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#d4af37',
            marginBottom: '20px'
          }}>
            <Sparkles size={14} /> Saha Men's Store • Summer Luxe Collection
          </div>

          <h1 style={{
            fontFamily: 'Outfit',
            fontSize: 'clamp(38px, 5.5vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '20px'
          }}>
            Saha Men's Store <br /><span className="gold-gradient-text">Redefining Men's Fashion</span>
          </h1>

          <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '32px' }}>
            Discover handcrafted Italian tailored suits, luxury resort shirts, heavyweight leather jackets, and contemporary streetwear designed for distinction.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/shop"
              style={{
                background: '#d4af37',
                color: '#000',
                padding: '16px 32px',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 30px rgba(212, 175, 55, 0.35)',
                textDecoration: 'none'
              }}
            >
              Explore Collection <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Hero Right — High-Res Fashion Model Hero Image */}
        <div style={{
          flex: 1,
          height: '560px',
          position: 'relative',
          minWidth: '320px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            height: '520px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            border: '1px solid rgba(212,175,55,0.3)'
          }}>
            <img
              src="/uploads/sahas.png"
              alt="Saha Men's Store Streetwear Model"
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#ffffff' }}
            />


          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section style={{ padding: '60px 5%', background: '#0d0d11', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: '#d4af37', textTransform: 'uppercase' }}>
            CATEGORIES
          </span>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '32px', fontWeight: 800, marginTop: '6px' }}>
            Shop By Category
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                navigate('/shop');
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '20px',
                borderRadius: '16px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}
              className="hover:border-[#d4af37]"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS CATALOG */}
      <section style={{ padding: '80px 5%', background: '#0c0c10', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: '#d4af37', textTransform: 'uppercase' }}>
            SAHA MEN'S STORE CATALOG
          </span>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '36px', fontWeight: 800, marginTop: '8px' }}>
            Featured Collections
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlignment: 'center', color: '#aaa', padding: '40px' }}>Loading catalog...</div>
        ) : (
          <div className="responsive-product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {trendingProducts.map((p, idx) => {
              const pId = p._id || p.id;
              const productQty = getProductQty(p);

              return (
                <div
                  key={pId || idx}
                  onClick={() => {
                    setSelectedProduct(p);
                    navigate(`/product/${pId}`);
                  }}
                  style={{
                    background: '#121218',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ height: '320px', overflow: 'hidden', position: 'relative' }}>
                    <img src={p.thumbnail || p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* Floating Heart Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                      title={isWishlisted(p) ? "Unlike item" : "Like item"}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.2s'
                      }}
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted(p) ? '#ef4444' : 'none'}
                        color={isWishlisted(p) ? '#ef4444' : '#fff'}
                      />
                    </button>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <span style={{ fontSize: '11px', color: '#d4af37', fontWeight: 800 }}>{p.category}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '4px 0 8px 0' }}>{p.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                        ₹{(p.discountPrice || p.price).toLocaleString()}
                      </div>

                      {productQty > 0 ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid #d4af37',
                            borderRadius: '20px',
                            height: '32px',
                            padding: '0 4px'
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              decrementProduct(p);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#d4af37',
                              padding: '0 8px',
                              fontWeight: 900,
                              fontSize: '16px',
                              cursor: 'pointer'
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', padding: '0 6px', whiteSpace: 'nowrap' }}>
                            {productQty}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p, 'M', p.colors?.[0], 1);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#d4af37',
                              padding: '0 8px',
                              fontWeight: 900,
                              fontSize: '16px',
                              cursor: 'pointer'
                            }}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p, 'M', p.colors?.[0], 1);
                          }}
                          style={{
                            background: '#d4af37',
                            color: '#000',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. BRAND VALUES FOOTER BANNER */}
      <section style={{
        background: '#070709',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 5%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Award size={32} color="#d4af37" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>PREMIUM FABRICS</h4>
            <p style={{ fontSize: '12px', color: '#71717a' }}>100% Egyptian Cotton & Silk</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ShieldCheck size={32} color="#d4af37" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>SECURE PAYMENT</h4>
            <p style={{ fontSize: '12px', color: '#71717a' }}>UPI & Encrypted Checkout</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Truck size={32} color="#d4af37" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>EXPRESS SHIPPING</h4>
            <p style={{ fontSize: '12px', color: '#71717a' }}>Delivered in 2-4 Days</p>
          </div>
        </div>
      </section>

    </div>
  );
}
