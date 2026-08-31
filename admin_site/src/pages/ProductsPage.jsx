import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Box,
  RotateCw,
  RefreshCw
} from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stockStatus, setStockStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [deleteModalId, setDeleteModalId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (stockStatus) params.stockStatus = stockStatus;

      const res = await api.get('/admin/products', { params });
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [category, stockStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/admin/products/${id}/availability`);
      toast.success(res.data.isAvailable ? 'Product enabled' : 'Product disabled');
      setProducts(products.map(p => p._id === id ? { ...p, isAvailable: res.data.isAvailable } : p));
    } catch (error) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      setProducts(products.filter(p => p._id !== id));
      setDeleteModalId(null);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="text-amber-400" size={22} />
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage SAHA Men's Store apparel, 3D models, stock, and pricing</p>
        </div>
        <Link
          to="/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, brand, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.slug} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Stock Levels</option>
            <option value="IN_STOCK">In Stock (&gt; 5)</option>
            <option value="LOW_STOCK">Low Stock (1-5)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Loading Catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-semibold text-slate-200">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or category filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Stock & SKU</th>
                  <th className="py-3.5 px-4 font-semibold">3D Assets</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((product) => {
                  const has3D = product.model3D || product.model3DUrl;
                  const has360 = product.images360?.length > 0;
                  return (
                    <tr key={product._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/80'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-100 text-xs">{product.name}</p>
                            <p className="text-[10px] text-slate-400">{product.brand || 'URBAN FIT'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{product.category}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">₹{product.price}</span>
                        {product.discountPrice && (
                          <span className="text-[10px] text-slate-500 line-through block">₹{product.discountPrice}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <StatusBadge type="stock" status={product.stock} />
                          <p className="text-[10px] font-mono text-slate-400">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {has3D && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold flex items-center gap-1 border border-blue-500/30">
                              <Box size={10} /> 3D GLB
                            </span>
                          )}
                          {has360 && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold flex items-center gap-1 border border-purple-500/30">
                              <RotateCw size={10} /> 360°
                            </span>
                          )}
                          {!has3D && !has360 && <span className="text-slate-600 text-[10px]">Standard</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(product._id)}
                          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
                        >
                          {product.isAvailable ? (
                            <ToggleRight size={22} className="text-emerald-400" />
                          ) : (
                            <ToggleLeft size={22} className="text-slate-600" />
                          )}
                          <span className="text-[11px]">{product.isAvailable ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/edit/${product._id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteModalId(product._id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <Trash2 size={32} className="text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Delete Product?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">This product will be removed from both Admin and Customer store views.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteModalId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
