import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import API from '../api';
import toast from 'react-hot-toast';
import {
  Star,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Award
} from 'lucide-react';

import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export default function ProductDetail3D() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedProduct,
    setSelectedProduct,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor
  } = useUIStore();

  const { cart, addToCart, decrementProduct, getProductQty } = useCartStore();
  const { wishlist, toggleWishlist, isWishlisted } = useWishlistStore();

  const [product, setProduct] = useState(() => {
    if (selectedProduct) {
      return selectedProduct;
    }
    const localFound = FALLBACK_PRODUCTS.find(p =>
      String(p._id) === String(id) ||
      String(p.id) === String(id) ||
      p.slug === id ||
      (p.name && encodeURIComponent(p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) === id)
    );
    if (localFound) return localFound;
    return FALLBACK_PRODUCTS[0];
  });
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    if (!id || id === 'undefined') {
      if (selectedProduct) setProduct(selectedProduct);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/products/${id}`).catch(() => API.get(`/products?search=${id}`));
      const fetched = Array.isArray(res.data) ? res.data[0] : res.data;

      if (fetched && (fetched._id || fetched.name)) {
        setProduct(fetched);
        setSelectedProduct(fetched);
        if (fetched.colors && fetched.colors.length > 0) setSelectedColor(fetched.colors[0]);
      } else if (selectedProduct) {
        setProduct(selectedProduct);
      } else {
        const localFound = FALLBACK_PRODUCTS.find(p =>
          String(p._id) === String(id) ||
          String(p.id) === String(id) ||
          p.slug === id ||
          (p.name && encodeURIComponent(p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) === id)
        );
        if (localFound) {
          setProduct(localFound);
          setSelectedProduct(localFound);
          if (localFound.colors && localFound.colors.length > 0) setSelectedColor(localFound.colors[0]);
        }
      }
    } catch (err) {
      console.error(err);
      if (selectedProduct) setProduct(selectedProduct);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return product?.thumbnail || product?.images?.[0] || '/uploads/pants1.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const rawImages = (Array.isArray(product?.images) && product.images.length > 0)
    ? product.images
    : (product?.thumbnail ? [product.thumbnail] : (product?.image ? [product.image] : ['/uploads/pants1.png']));

  const productImages = (Array.isArray(rawImages) ? rawImages : []).map(getImageUrl);

  const handleNextSlide = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };


  const handlePrevSlide = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontWeight: 700, paddingTop: '100px' }}>
        Loading Product Photos...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', paddingTop: '100px' }}>
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/shop')} style={{ marginTop: '20px', background: '#d4af37', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer' }}>
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090d', color: '#fff', paddingTop: '72px' }}>
      
      {/* TOP HEADER */}
      <div style={{
        height: '64px',
        background: '#111116',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4%',
        position: 'sticky',
        top: '72px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/shop')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#d4af37', fontFamily: 'Outfit' }}>
            {product.name}
          </h2>
        </div>

        <div style={{ fontSize: '13px', color: '#aaa' }}>
          Click thumbnails or arrows to view product angles
        </div>
      </div>

      {/* PRODUCT SLIDESHOW & DETAILS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        padding: '40px 5%',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>

        {/* LEFT COLUMN: PHOTO CAROUSEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            position: 'relative',
            width: '100%',
            height: '520px',
            background: '#121218',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={productImages[activeImageIndex]}
              alt={`Product View ${activeImageIndex + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }}
            />

            {/* Floating Like Heart Button */}
            <button
              onClick={() => toggleWishlist(product)}
              title={isWishlisted(product) ? "Unlike item" : "Like item"}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
            >
              <Heart
                size={22}
                fill={isWishlisted(product) ? '#ef4444' : 'none'}
                color={isWishlisted(product) ? '#ef4444' : '#fff'}
              />
            </button>

            <button
              onClick={handlePrevSlide}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(18, 18, 24, 0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={handleNextSlide}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(18, 18, 24, 0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={22} />
            </button>

            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '20px',
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#d4af37'
            }}>
              Slide {activeImageIndex + 1} of {productImages.length}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {productImages.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#121218',
                  border: activeImageIndex === idx ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
              </div>
            ))}
          </div>

        </div>


        {/* RIGHT COLUMN: PRODUCT DETAILS */}
        <div style={{
          background: '#0d0d12',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#d4af37', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              {product.brand || 'URBAN FIT'}
            </span>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 900, color: '#fff', margin: '4px 0 8px 0', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '13px', color: '#aaa' }}>Category: {product.category}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '13px', color: '#d4af37' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#d4af37" color="#d4af37" />)}
              </div>
              <span style={{ color: '#aaa', fontSize: '12px' }}>(128 reviews)</span>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900, color: '#d4af37', fontFamily: 'Outfit' }}>
                ₹{(product.discountPrice || product.price || 300).toLocaleString()}
              </span>
              <span style={{ fontSize: '13px', color: '#71717a' }}>Inclusive of all taxes</span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            {product.description}
          </p>

          {/* Size Section: Dynamic sizes for Caps/Bandanas (Free Size), Shoes (6-11), Pants/Jeans (26-38), Shirts (S-XL) */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#ddd', marginBottom: '8px' }}>
              {(product.category === 'Caps' || product.category === 'Accessories' || product.name?.toLowerCase().includes('cap') || product.name?.toLowerCase().includes('bandana') || product.name?.toLowerCase().includes('scarf'))
                ? 'Size'
                : (product.category === 'Shoes' || product.name?.toLowerCase().includes('shoes') || product.name?.toLowerCase().includes('sneakers'))
                  ? 'Select Shoe Size (UK / India)'
                  : (product.category === 'Jeans' || product.category === 'Pants' || product.category === 'Shorts' || product.name?.toLowerCase().includes('jeans') || product.name?.toLowerCase().includes('pants'))
                    ? 'Select Waist Size (Inches)'
                    : 'Select Size'}
            </div>

            {(product.category === 'Caps' || product.category === 'Accessories' || product.name?.toLowerCase().includes('cap') || product.name?.toLowerCase().includes('bandana') || product.name?.toLowerCase().includes('scarf')) ? (
              <div style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid #d4af37',
                color: '#d4af37',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Check size={16} /> Free Size (One Size Fits All)
              </div>
            ) : (

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(
                  (product.category === 'Shoes' || product.name?.toLowerCase().includes('shoes') || product.name?.toLowerCase().includes('sneakers'))
                    ? ['6', '7', '8', '9', '10', '11']
                    : (product.category === 'Jeans' || product.category === 'Pants' || product.category === 'Shorts' || product.name?.toLowerCase().includes('jeans') || product.name?.toLowerCase().includes('pants'))
                      ? ['26', '28', '30', '32', '34', '36', '38']
                      : ['S', 'M', 'L', 'XL']
                ).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      flex: 1,
                      minWidth: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      border: selectedSize === sz ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedSize === sz ? '#d4af37' : 'rgba(255,255,255,0.03)',
                      color: selectedSize === sz ? '#000' : '#fff',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>




          {/* Quantity Controls & Action Buttons */}
          {(() => {
            const productQty = getProductQty(product);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {productQty > 0 ? (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4af37', marginBottom: '8px' }}>
                      ✓ Added to Cart ({productQty} in cart)
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: '#181820', borderRadius: '8px', border: '1px solid #d4af37', padding: '4px' }}>
                      <button onClick={() => decrementProduct(product)} style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer' }}>
                        <Minus size={16} />
                      </button>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#d4af37', padding: '0 14px' }}>{productQty}</span>
                      <button onClick={() => addToCart(product, selectedSize, selectedColor, 1)} style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ) : null}

                <button
                  onClick={() => addToCart(product, selectedSize, selectedColor, 1)}
                  style={{
                    width: '100%',
                    background: productQty > 0 ? 'rgba(212, 175, 55, 0.15)' : '#d4af37',
                    color: productQty > 0 ? '#d4af37' : '#000',
                    border: productQty > 0 ? '1px solid #d4af37' : 'none',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: productQty > 0 ? 'none' : '0 4px 20px rgba(212,175,55,0.35)'
                  }}
                >
                  <ShoppingBag size={20} /> {productQty > 0 ? `ADD MORE (₹${((product?.discountPrice || product?.price || 300)).toLocaleString()})` : `ADD TO CART (₹${((product?.discountPrice || product?.price || 300)).toLocaleString()})`}
                </button>

                <button
                  onClick={() => {
                    if (productQty === 0) addToCart(product, selectedSize, selectedColor, 1);
                    navigate('/checkout');
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid #d4af37',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  BUY NOW
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
