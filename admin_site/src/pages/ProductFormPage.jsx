import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PackagePlus,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Box,
  RotateCw,
  Plus,
  Trash2,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';

const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Shirts',
    brand: 'URBAN FIT',
    price: '',
    discountPrice: '',
    stock: 20,
    sku: '',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#000000' }],
    images: [''],
    thumbnail: '',
    frontImage: '',
    backImage: '',
    leftImage: '',
    rightImage: '',
    model3DUrl: '',
    images360: [],
    isFeatured: false,
    isNewArrival: true,
    isAvailable: true,
    tags: ''
  });

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', 'Free Size'];

  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);

        if (isEdit) {
          setLoading(true);
          const prodRes = await api.get(`/admin/products/${id}`);
          const p = prodRes.data;
          setFormData({
            name: p.name || '',
            description: p.description || '',
            category: p.category || 'Shirts',
            brand: p.brand || 'URBAN FIT',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            stock: p.stock !== undefined ? p.stock : 20,
            sku: p.sku || '',
            sizes: (p.sizes || []).map(s => typeof s === 'string' ? s : s.size),
            colors: p.colors?.length ? p.colors : [{ name: 'Black', hex: '#000000' }],
            images: p.images?.length ? p.images : [''],
            thumbnail: p.thumbnail || p.images?.[0] || '',
            frontImage: p.frontImage || '',
            backImage: p.backImage || '',
            leftImage: p.leftImage || '',
            rightImage: p.rightImage || '',
            model3DUrl: p.model3DUrl || p.model3D || '',
            images360: p.images360 || [],
            isFeatured: Boolean(p.isFeatured),
            isNewArrival: Boolean(p.isNewArrival),
            isAvailable: p.isAvailable !== undefined ? p.isAvailable : true,
            tags: (p.tags || []).join(', ')
          });
        }
      } catch (error) {
        toast.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeToggle = (sizeStr) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(sizeStr);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter(s => s !== sizeStr) : [...prev.sizes, sizeStr]
      };
    });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages,
      thumbnail: newImages[0] || prev.thumbnail
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages.length ? newImages : [''],
      thumbnail: newImages[0] || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Please enter Product Name and Price');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock),
        sizes: formData.sizes.map(size => ({ size, stock: Number(formData.stock) })),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        images: formData.images.filter(Boolean),
        thumbnail: formData.thumbnail || formData.images.filter(Boolean)[0] || ''
      };

      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('New Product created successfully!');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isEdit ? 'Edit Product Details' : 'Add New Product'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? `Updating ID: ${id}` : 'Fill in apparel information, images, and 3D specifications'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic & Pricing Info Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} /> Basic & Pricing Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Slim Fit Linen Formal Shirt"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c._id || c.slug} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="SAHA FIT"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="SHIRT-BLK-001"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="1499"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Original / Discount Price (₹)</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="2499"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Description *</label>
            <textarea
              required
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe material, fit, and style instructions..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Stock & Variants Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} /> Inventory Stock & Sizes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Available Stock Count *</label>
              <input
                type="number"
                required
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(s => {
                  const active = formData.sizes.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleSizeToggle(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Images & Gallery Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={16} /> Product Gallery & Cloudinary Image URLs
          </h2>

          <div className="space-y-3">
            {formData.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Image URL #${idx + 1} (Cloudinary / Web URL)`}
                  value={img}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
            >
              <Plus size={14} /> Add Another Image URL
            </button>
          </div>
        </div>

        {/* 3D & Multi-Angle View Fields */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Box size={16} /> 3D & Multi-Angle View Fields (Customer Site 3D Integration)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">3D Model URL (.glb / .gltf)</label>
              <input
                type="text"
                name="model3DUrl"
                value={formData.model3DUrl}
                onChange={handleChange}
                placeholder="https://.../shirt_model.glb"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Front Angle View Image URL</label>
              <input
                type="text"
                name="frontImage"
                value={formData.frontImage}
                onChange={handleChange}
                placeholder="https://.../front.webp"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Back Angle View Image URL</label>
              <input
                type="text"
                name="backImage"
                value={formData.backImage}
                onChange={handleChange}
                placeholder="https://.../back.webp"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Left Angle View Image URL</label>
              <input
                type="text"
                name="leftImage"
                value={formData.leftImage}
                onChange={handleChange}
                placeholder="https://.../left.webp"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20"
          >
            <Save size={16} />
            <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
