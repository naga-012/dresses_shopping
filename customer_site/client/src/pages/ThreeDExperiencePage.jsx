import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
import API from '../api';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Heart,
  Star,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ShieldCheck,
  Truck,
  Award
} from 'lucide-react';

export default function ThreeDExperiencePage() {
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

  const [products, setProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.products) ? res.data.products : []);
      setProducts(list);
      if (list.length > 0 && !selectedProduct) {
        setSelectedProduct(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '/uploads/cap1.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const rawImages = Array.isArray(selectedProduct?.images) && selectedProduct.images.length > 0 ? selectedProduct.images : [
    '/uploads/cap1.png',
    '/uploads/cap2.png',
    '/uploads/cap3.png',
    '/uploads/cap4.png',
    '/uploads/cap5.png'
  ];

  const productImages = (Array.isArray(rawImages) ? rawImages : []).map(getImageUrl);

  const handleNextSlide = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };


  const handlePrevSlide = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

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
            onClick={() => navigate('/')}
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
            <ArrowLeft size={16} /> Back to Store
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#d4af37', fontFamily: 'Outfit' }}>
            PRODUCT PHOTO GALLERY & SLIDESHOW
          </h2>
        </div>

        <div style={{ fontSize: '13px', color: '#aaa' }}>
          Click thumbnails or arrows to view product angles
        </div>
      </div>

      {/* MAIN PRODUCT CAROUSEL & DETAIL LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        padding: '40px 5%',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>

        {/* LEFT COLUMN: INTERACTIVE PHOTO SLIDESHOW CAROUSEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Main Slide Display Box */}
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

            {/* Prev Arrow */}
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
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              <ChevronLeft size={22} />
            </button>

            {/* Next Arrow */}
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
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              <ChevronRight size={22} />
            </button>

            {/* Image Slide Counter Badge */}
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

          {/* Thumbnail Slides Bar */}
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
                  boxShadow: activeImageIndex === idx ? '0 0 15px rgba(212,175,55,0.4)' : 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
              </div>
            ))}
          </div>

        </div>


        {/* RIGHT COLUMN: PRODUCT DETAIL & ORDER ACTIONS */}
        <div style={{
          background: '#0d0d12',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {selectedProduct ? (
            <>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#d4af37', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  {selectedProduct.brand || 'URBAN FIT'}
                </span>
                <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 900, color: '#fff', margin: '4px 0 8px 0', lineHeight: 1.2 }}>
                  {selectedProduct.name}
                </h1>
                <div style={{ fontSize: '13px', color: '#aaa' }}>Category: {selectedProduct.category}</div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '13px', color: '#d4af37' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#d4af37" color="#d4af37" />)}
                  </div>
                  <span style={{ color: '#aaa', fontSize: '12px' }}>(128 reviews)</span>
                </div>

                {/* Price Tag: ₹300 */}
                <div style={{ marginTop: '18px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 900, color: '#d4af37', fontFamily: 'Outfit' }}>
                    ₹{(selectedProduct.discountPrice || selectedProduct.price || 300).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '13px', color: '#71717a' }}>Inclusive of all taxes</span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                {selectedProduct.description || 'Premium vintage washed cotton baseball cap featuring high-density embroidery, adjustable brass buckle strap, and 6-panel eyelet construction.'}
              </p>

              {/* Size Section: Dynamic sizes for Caps/Bandanas (Free Size), Shoes (6-11), Pants/Jeans (26-38), Shirts (S-XL) */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ddd', marginBottom: '8px' }}>
                  {(selectedProduct.category === 'Caps' || selectedProduct.category === 'Accessories' || selectedProduct.name?.toLowerCase().includes('cap') || selectedProduct.name?.toLowerCase().includes('bandana') || selectedProduct.name?.toLowerCase().includes('scarf'))
                    ? 'Size'
                    : (selectedProduct.category === 'Shoes' || selectedProduct.name?.toLowerCase().includes('shoes') || selectedProduct.name?.toLowerCase().includes('sneakers'))
                      ? 'Select Shoe Size (UK / India)'
                      : (selectedProduct.category === 'Jeans' || selectedProduct.category === 'Pants' || selectedProduct.category === 'Shorts' || selectedProduct.name?.toLowerCase().includes('jeans') || selectedProduct.name?.toLowerCase().includes('pants'))
                        ? 'Select Waist Size (Inches)'
                        : 'Select Size'}
                </div>

                {(selectedProduct.category === 'Caps' || selectedProduct.category === 'Accessories' || selectedProduct.name?.toLowerCase().includes('cap') || selectedProduct.name?.toLowerCase().includes('bandana') || selectedProduct.name?.toLowerCase().includes('scarf')) ? (
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
                      (selectedProduct.category === 'Shoes' || selectedProduct.name?.toLowerCase().includes('shoes') || selectedProduct.name?.toLowerCase().includes('sneakers'))
                        ? ['6', '7', '8', '9', '10', '11']
                        : (selectedProduct.category === 'Jeans' || selectedProduct.category === 'Pants' || selectedProduct.category === 'Shorts' || selectedProduct.name?.toLowerCase().includes('jeans') || selectedProduct.name?.toLowerCase().includes('pants'))
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
                const productQty = getProductQty(selectedProduct?._id);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {productQty > 0 ? (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4af37', marginBottom: '8px' }}>
                          ✓ Added to Cart ({productQty} in cart)
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#181820', borderRadius: '8px', border: '1px solid #d4af37', padding: '4px' }}>
                          <button onClick={() => decrementProduct(selectedProduct?._id)} style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer' }}>
                            <Minus size={16} />
                          </button>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#d4af37', padding: '0 14px' }}>{productQty}</span>
                          <button onClick={() => addToCart(selectedProduct, selectedSize, selectedColor, 1)} style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer' }}>
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <button
                      onClick={() => addToCart(selectedProduct, selectedSize, selectedColor, 1)}
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
                      <ShoppingBag size={20} /> {productQty > 0 ? `ADD MORE (₹${((selectedProduct?.discountPrice || selectedProduct?.price || 300)).toLocaleString()})` : `ADD TO CART (₹${((selectedProduct?.discountPrice || selectedProduct?.price || 300)).toLocaleString()})`}
                    </button>

                    <button
                      onClick={() => {
                        if (productQty === 0) addToCart(selectedProduct, selectedSize, selectedColor, 1);
                        window.location.href = '/checkout';
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
            </>
          ) : (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>Loading item details...</div>
          )}
        </div>

      </div>

    </div>
  );
}
