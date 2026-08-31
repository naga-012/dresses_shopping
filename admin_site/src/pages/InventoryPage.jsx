import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { Boxes, Search, Save, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [editingStock, setEditingStock] = useState({});

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products', { params: { limit: 100 } });
      const items = res.data.products || [];
      setProducts(items);

      const initialEdits = {};
      items.forEach(p => {
        initialEdits[p._id] = { stock: p.stock, sku: p.sku || '' };
      });
      setEditingStock(initialEdits);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id, field, value) => {
    setEditingStock(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleQuickSave = async (id) => {
    try {
      const data = editingStock[id];
      const res = await api.patch(`/admin/products/${id}/stock`, {
        stock: Number(data.stock),
        sku: data.sku
      });
      toast.success(`Updated stock & SKU for ${res.data.name}`);
      setProducts(products.map(p => p._id === id ? res.data : p));
    } catch (error) {
      toast.error('Failed to update inventory');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterStatus === 'LOW_STOCK') return p.stock > 0 && p.stock <= 5;
    if (filterStatus === 'OUT_OF_STOCK') return p.stock === 0;
    if (filterStatus === 'IN_STOCK') return p.stock > 5;
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="text-amber-400" size={22} />
            Stock & Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Per-product SKU, available stock units, sold counts, and quick stock updates</p>
        </div>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
        >
          <RefreshCw size={14} /> Refresh Stock Matrix
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { label: 'All Items', value: 'ALL' },
            { label: 'In Stock (>5)', value: 'IN_STOCK' },
            { label: 'Low Stock (1-5)', value: 'LOW_STOCK' },
            { label: 'Out of Stock (0)', value: 'OUT_OF_STOCK' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === opt.value
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Loading Inventory...</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">SKU Code</th>
                <th className="py-3.5 px-4 font-semibold">Units Sold</th>
                <th className="py-3.5 px-4 font-semibold">Available Stock</th>
                <th className="py-3.5 px-4 font-semibold">Stock Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((product) => {
                const currentEdit = editingStock[product._id] || { stock: product.stock, sku: product.sku };
                return (
                  <tr key={product._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/60'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-700 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&auto=format&fit=crop&q=60';
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-100">{product.name}</p>
                          <p className="text-[10px] text-slate-400">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={currentEdit.sku}
                        onChange={(e) => handleStockChange(product._id, 'sku', e.target.value)}
                        placeholder="Set SKU"
                        className="bg-slate-900 border border-slate-700 rounded-lg py-1 px-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500 w-28"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-300">{product.soldCount || 0} units</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={currentEdit.stock}
                        onChange={(e) => handleStockChange(product._id, 'stock', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg py-1 px-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500 w-20"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="stock" status={Number(currentEdit.stock)} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleQuickSave(product._id)}
                        className="p-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm inline-flex items-center gap-1"
                      >
                        <Save size={13} /> Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
