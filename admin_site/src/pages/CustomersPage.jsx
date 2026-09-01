import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Search, ShoppingBag, Mail, Phone, Calendar, Eye, X } from 'lucide-react';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers', { params: { search } });
      const list = res.data?.customers || (Array.isArray(res.data) ? res.data : []);
      setCustomers(list);
    } catch (error) {
      console.warn('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCustomerDetail = async (customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/customers/${customer._id}`);
      setCustomerDetail(res.data);
    } catch (e) {
      toast.error('Failed to load customer order history');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-amber-400" size={22} />
            Customer Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Registered members, total purchase history, and aggregated spend</p>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Loading Customers...</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold">Total Orders</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Spend</th>
                <th className="py-3.5 px-4 font-semibold text-center">Order History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center border border-slate-700">
                        {c.name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <p className="flex items-center gap-1"><Phone size={10} /> {c.phone || 'N/A'}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">{c.totalOrders || 0} orders</td>
                  <td className="py-3 px-4 font-extrabold text-amber-400 text-right">₹{c.totalSpend || 0}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openCustomerDetail(c)}
                      className="p-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 inline-flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <Eye size={13} /> View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full glass-panel p-6 rounded-2xl border border-slate-800 max-h-[85vh] overflow-y-auto relative space-y-4">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-base border border-amber-500/30">
                {selectedCustomer.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">{selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}</p>
              </div>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center text-slate-400">Loading Order History...</div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">
                  Full Order History ({customerDetail?.orders?.length || 0} orders)
                </p>
                <div className="space-y-2">
                  {(customerDetail?.orders || []).map(order => (
                    <div key={order._id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-mono font-bold text-amber-400">{order.orderId || order._id}</p>
                        <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">₹{order.totalPrice}</p>
                        <p className="text-[10px] text-emerald-400">{order.orderStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
