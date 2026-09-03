import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Star, ShoppingBag, Sparkles, Shirt, Heart } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import API from '../api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedProduct, setSelectedProduct, setActiveCategory } = useUIStore();
  const { cart, addToCart, getProductQty, decrementProduct } = useCartStore();
  const { wishlist, toggleWishlist, isWishlisted } = useWishlistStore();

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('filter') === 'wishlist' ? '❤️ Liked Items' : (searchParams.get('category') || 'All')
  );
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['All', '🔥 New Arrivals', '❤️ Liked Items', 'Shirts', 'T-Shirts', 'Hoodies', 'Jackets', 'Blazers', 'Jeans', 'Pants', 'Shoes', 'Traditional Wear'];

  useEffect(() => {
    const socketUrl = typeof window !== 'undefined' && window.location.hostname.includes('render.com')
      ? 'https://saha-backend-api.onrender.com'
      : typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
        ? 'https://customersite-psi.vercel.app'
        : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('product:created', (newProduct) => {
      toast.success(`✨ New Product Added: ${newProduct.name}`);
      setProducts(prev => [newProduct, ...prev.filter(p => p._id !== newProduct._id)]);
    });

    socket.on('product:updated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    });

    socket.on('product:stock_updated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    });

    socket.on('product:deleted', ({ id }) => {
      setProducts(prev => prev.filter(p => p._id !== id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    const categoryParam = searchParams.get('category');
    if (filterParam === 'new') {
      setSelectedCategory('🔥 New Arrivals');
    } else if (filterParam === 'wishlist') {
      setSelectedCategory('❤️ Liked Items');
    } else if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?';
      if (selectedCategory !== 'All' && selectedCategory !== '❤️ Liked Items' && selectedCategory !== '🔥 New Arrivals') {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (searchParams.get('collectionId')) url += `collectionId=${searchParams.get('collectionId')}&`;
      if (searchQuery) url += `search=${searchQuery}&`;

      const res = await API.get(url);
      const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.products) ? res.data.products : null);
      if (raw && raw.length > 0) {
        setProducts(raw);
      } else {
        // Filter local fallback products
        let list = FALLBACK_PRODUCTS;
        if (selectedCategory !== 'All' && selectedCategory !== '❤️ Liked Items' && selectedCategory !== '🔥 New Arrivals') {
          list = list.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (searchQuery) {
          list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        setProducts(list.length > 0 ? list : FALLBACK_PRODUCTS);
      }
    } catch (err) {
      console.error('Failed to fetch API products, using fallback list', err);
      let list = FALLBACK_PRODUCTS;
      if (selectedCategory !== 'All' && selectedCategory !== '❤️ Liked Items' && selectedCategory !== '🔥 New Arrivals') {
        list = list.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
      }
      if (searchQuery) {
        list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      setProducts(list.length > 0 ? list : FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleDressClick = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    if (product.category) setActiveCategory(product.category);
    toast.success(`Opening ${product.name}...`);
    const pId = product._id || product.id || product.slug || (product.name ? encodeURIComponent(product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) : 'item');
    navigate(`/product/${pId}`);
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const displayedProducts = React.useMemo(() => {
    if (selectedCategory === '❤️ Liked Items') {
      const itemMap = new Map();
      const allAvailable = [...products, ...FALLBACK_PRODUCTS];

      // 1. Add all items stored in wishlistStore
      (wishlist || []).forEach(item => {
        if (!item) return;
        let pObj = typeof item === 'object' && item.name ? item : null;
        const idKey = String(item._id || item.id || item.slug || (typeof item === 'string' ? item : ''));

        if (!pObj && idKey) {
          pObj = allAvailable.find(p => String(p._id || p.id || p.slug) === idKey);
        }
        if (pObj) {
          const mapKey = String(pObj._id || pObj.id || pObj.slug || idKey);
          if (mapKey) itemMap.set(mapKey, pObj);
        }
      });

      // 2. Also include any product from allAvailable that is wishlisted
      allAvailable.forEach(p => {
        if (p && isWishlisted(p)) {
          const mapKey = String(p._id || p.id || p.slug);
          if (mapKey && !itemMap.has(mapKey)) {
            itemMap.set(mapKey, p);
          }
        }
      });

      let res = Array.from(itemMap.values());
      if (searchQuery) {
        res = res.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return res;
    }

    if (selectedCategory === '🔥 New Arrivals' || searchParams.get('filter') === 'new') {
      let newArrivalsList = products.filter(p => p.isNewArrival !== false);
      if (newArrivalsList.length === 0) newArrivalsList = products;
      if (searchQuery) {
        newArrivalsList = newArrivalsList.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return newArrivalsList;
    }

    return products;
  }, [selectedCategory, wishlist, products, searchQuery, isWishlisted, searchParams]);

  const sortedProducts = [...displayedProducts].sort((a, b) => {
    if (selectedCategory === '🔥 New Arrivals' || searchParams.get('filter') === 'new') {
      const tA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const tB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      if (tA && tB && tA !== tB) return tB - tA;
      return (String(b._id || b.id || '')).localeCompare(String(a._id || a.id || ''));
    }
    const priceA = a.discountPrice || a.price || 0;
    const priceB = b.discountPrice || b.price || 0;
    if (sortBy === 'low') return priceA - priceB;
    if (sortBy === 'high') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="page-container" style={{ minHeight: '100vh', background: '#09090b', color: '#fff', paddingTop: '100px', paddingBottom: '80px', paddingLeft: '5%', paddingRight: '5%' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '36px', fontWeight: 800 }}>Saha Men's Store Catalog</h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>Click any dress below to put it on the 3D Doll mannequin!</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', padding: '6px 16px', width: '100%', maxWidth: '360px' }}>
          <Search size={18} color="#71717a" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search shirts, jackets, sherwanis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </form>
      </div>

      {/* Filter Chips & Sort Dropdown */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#d4af37' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === cat ? '#000' : '#a1a1aa',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            background: '#141419',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="featured">Featured First</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#d4af37', fontWeight: 600 }}>Loading collection...</div>
      ) : sortedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#71717a' }}>
          {selectedCategory === '❤️ Liked Items' ? (
            <div>
              <Heart size={48} color="#ef4444" style={{ margin: '0 auto 16px auto', display: 'block', opacity: 0.8 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>No Liked Items Yet</h3>
              <p style={{ fontSize: '13px', color: '#a1a1aa' }}>Click the ❤️ heart icon on any product in the catalog to save it to your wishlist!</p>
            </div>
          ) : (
            'No products found matching your search.'
          )}
        </div>
      ) : (
        <div className="responsive-product-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {sortedProducts.map((p, idx) => {
            const pId = p._id || p.id || p.slug || (p.name ? encodeURIComponent(p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) : `item-${idx}`);
            const productQty = getProductQty(p);

            return (
              <div
                key={pId || idx}
                onClick={() => handleDressClick(p)}
                className="glass-panel"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {/* Floating Like Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
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

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#d4af37', fontWeight: 700, letterSpacing: '0.05em' }}>{p.brand}</span>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '2px 0 6px 0' }}>{p.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>
                      <Star size={14} fill="#d4af37" color="#d4af37" /> {p.rating}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>₹{(p.discountPrice || p.price).toLocaleString()}</span>
                      {p.discountPrice && <span style={{ fontSize: '12px', color: '#71717a', textDecoration: 'line-through', marginLeft: '6px' }}>₹{p.price.toLocaleString()}</span>}
                    </div>
                    
                    {productQty > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid #d4af37',
                          borderRadius: '8px',
                          height: '32px',
                          padding: '0 2px'
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
                          padding: '8px 14px',
                          borderRadius: '8px',
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
    </div>
  );
}
