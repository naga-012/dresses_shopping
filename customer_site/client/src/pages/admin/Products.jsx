import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Upload, Sparkles, X, Check } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Shirts',
    brand: 'MENSVERSE LUXE',
    description: '',
    price: '',
    discountPrice: '',
    stock: 10,
    collectionId: '',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
    model3D: 'shirt',
    colors: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Gold Accent', hex: '#D4AF37' }
    ]
  });

  const [uploading, setUploading] = useState(false);

  const categories = ['Shirts', 'T-Shirts', 'Hoodies', 'Jackets', 'Blazers', 'Jeans', 'Pants', 'Shorts', 'Traditional Wear', 'Shoes', 'Accessories'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        API.get('/products'),
        API.get('/collections')
      ]);
      setProducts(pRes.data);
      setCollections(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        category: product.category,
        brand: product.brand || 'MENSVERSE',
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || '',
        stock: product.stock || 10,
        collectionId: product.collectionId?._id || product.collectionId || '',
        images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
        model3D: product.model3D || 'shirt',
        colors: product.colors || [{ name: 'Black', hex: '#000000' }]
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Shirts',
        brand: 'MENSVERSE LUXE',
        description: '',
        price: '',
        discountPrice: '',
        stock: 10,
        collectionId: '',
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
        model3D: 'shirt',
        colors: [{ name: 'Black', hex: '#000000' }]
      });
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploading(true);
    try {
      const res = await API.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        setFormData(prev => ({ ...prev, model3D: res.data.url }));
        toast.success('3D Model uploaded successfully!');
      } else {
        setFormData(prev => ({ ...prev, images: [res.data.url, ...prev.images] }));
        toast.success('Image uploaded!');
      }
    } catch (err) {
      toast.error('Upload failed. Using direct URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock)
      };

      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
        toast.success('Product updated & updated in 3D viewer automatically!');
      } else {
        await API.post('/products', payload);
        toast.success('New product added to catalog & 3D viewer automatically!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>Products & 3D Models Catalog</h1>
          <p style={{ color: '#aaa', fontSize: '13px' }}>Changes appear instantly on the storefront and 3D viewer without rebuild.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          style={{ background: '#d4af37', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Table of Products */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        {loading ? (
          <div style={{ color: '#d4af37' }}>Loading Catalog...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#aaa' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#fff' }}>
                  <th style={{ padding: '12px' }}>Product</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>3D Model</th>
                  <th style={{ padding: '12px' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontWeight: 600 }}>
                      <img src={p.images[0]} alt={p.name} style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                      {p.name}
                    </td>
                    <td style={{ padding: '12px' }}>{p.category}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#d4af37' }}>₹{(p.discountPrice || p.price).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {p.model3D || 'Standard 3D Mesh'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{p.stock} pcs</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button onClick={() => handleOpenModal(p)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', marginRight: '12px' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: '24px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
              <X size={24} />
            </button>

            <h2 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: '#d4af37', marginBottom: '20px' }}>
              {editingId ? 'Edit Product Details & 3D Model' : 'Add New Product to Storefront & 3D Viewer'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Product Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Brand</label>
                <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Regular Price (₹)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Discount Price (₹)</label>
                <input type="number" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', height: '80px', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Assign to Collection</label>
                <select value={formData.collectionId} onChange={e => setFormData({ ...formData, collectionId: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }}>
                  <option value="">No Collection</option>
                  {collections.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* 3D Model File Upload / Key */}
              <div style={{ gridColumn: 'span 2', background: 'rgba(212,175,55,0.06)', border: '1px border #d4af37', padding: '16px', borderRadius: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#d4af37', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> 3D GLB/GLTF Model Upload
                </label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <input type="text" placeholder="e.g. shirt, jacket or GLB file URL" value={formData.model3D} onChange={e => setFormData({ ...formData, model3D: e.target.value })} style={{ flex: 1, background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '12px' }} />
                  <label style={{ background: '#d4af37', color: '#000', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} /> Upload GLB
                    <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                <button type="submit" style={{ width: '100%', background: '#d4af37', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
                  Save & Publish to 3D Storefront
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
