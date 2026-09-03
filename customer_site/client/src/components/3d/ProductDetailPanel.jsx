import React, { useState } from 'react';
import { ShoppingBag, Heart, Check, Sparkles, Plus, Minus } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import toast from 'react-hot-toast';

export default function ProductDetailPanel() {
  const { selectedProduct, selectedSize, setSelectedSize, selectedColor, setSelectedColor } = useUIStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [qty, setQty] = useState(1);

  if (!selectedProduct) return null;

  const currentPrice = selectedProduct.discountPrice || selectedProduct.price;
  const originalPrice = selectedProduct.discountPrice ? selectedProduct.price : null;

  const handleAddToCart = () => {
    addToCart(selectedProduct, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, selectedSize, selectedColor);
    window.location.href = '/checkout';
  };

  return (
    <div style={{
      background: 'rgba(15, 15, 20, 0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '24px',
      color: '#fff',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxHeight: '85vh',
      overflowY: 'auto'
    }}>
      {/* Brand & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#d4af37', textTransform: 'uppercase' }}>
          {selectedProduct.brand}
        </span>
        <span style={{
          background: 'rgba(212, 175, 55, 0.15)',
          color: '#d4af37',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Sparkles size={12} /> Premium Fit
        </span>
      </div>

      {/* Product Title & Price */}
      <div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 700, lineHeight: 1.2, margin: '4px 0 8px 0' }}>
          {selectedProduct.name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            ₹{currentPrice.toLocaleString()}
          </span>
          {originalPrice && (
            <span style={{ fontSize: '15px', color: '#71717a', textDecoration: 'line-through' }}>
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
        {selectedProduct.description}
      </p>

      {/* Color Swatches */}
      {selectedProduct.colors && selectedProduct.colors.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ddd', marginBottom: '8px' }}>
            Color: <span style={{ color: '#d4af37' }}>{selectedColor?.name || selectedProduct.colors[0].name}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedProduct.colors.map((c, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedColor(c);
                  toast.success(`Applied ${c.name} to 3D Doll!`);
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: selectedColor?.hex === c.hex ? '2px solid #d4af37' : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: selectedColor?.hex === c.hex ? '0 0 12px rgba(212,175,55,0.5)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {selectedColor?.hex === c.hex && <Check size={14} color={c.hex === '#FFFFFF' || c.hex === '#F4E8C1' ? '#000' : '#fff'} />}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Size Selector (with disabled state for out-of-stock sizes) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#ddd', marginBottom: '8px' }}>
          <span>Select Size</span>
          <span style={{ color: '#d4af37', cursor: 'pointer' }}>Size Guide</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
            const sizeObj = selectedProduct.sizes?.find(s => s.size === sz);
            const inStock = sizeObj ? sizeObj.inStock : true;
            const isSelected = selectedSize === sz;

            return (
              <button
                key={sz}
                disabled={!inStock}
                onClick={() => setSelectedSize(sz)}
                style={{
                  minWidth: '42px',
                  height: '38px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isSelected ? '#d4af37' : inStock ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  color: isSelected ? '#000' : inStock ? '#fff' : '#444',
                  cursor: inStock ? 'pointer' : 'not-allowed',
                  textDecoration: !inStock ? 'line-through' : 'none',
                  opacity: inStock ? 1 : 0.4,
                  transition: 'all 0.2s'
                }}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button
          onClick={handleAddToCart}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
            color: '#000',
            border: 'none',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          <ShoppingBag size={18} /> Add to Cart
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(selectedProduct)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: isWishlisted(selectedProduct) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: isWishlisted(selectedProduct) ? '#ef4444' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Heart size={20} fill={isWishlisted(selectedProduct) ? '#ef4444' : 'none'} />
        </button>
      </div>

      {/* Buy Now Button */}
      <button
        onClick={handleBuyNow}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '12px',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Buy Now with 1-Click
      </button>
    </div>
  );
}
