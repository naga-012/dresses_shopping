import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80'
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await API.get('/collections');
      setCollections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/collections', formData);
      toast.success('Collection created!');
      setShowModal(false);
      fetchCollections();
    } catch (err) {
      toast.error('Failed to create collection.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete collection?')) return;
    try {
      await API.delete(`/collections/${id}`);
      toast.success('Collection deleted.');
      fetchCollections();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>Featured Collections</h1>
          <p style={{ color: '#aaa', fontSize: '13px' }}>Organize seasonal luxury drops and capsule collections.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#d4af37', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> New Collection
        </button>
      </div>

      {/* Grid of collections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {collections.map((c) => (
          <div key={c._id} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', padding: '16px' }}>
            <img src={c.coverImage} alt={c.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
            <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 800, color: '#fff' }}>{c.name}</h3>
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '4px', height: '36px', overflow: 'hidden' }}>{c.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '12px', color: '#d4af37', fontWeight: 700 }}>{c.products?.length || 0} Products</span>
              <button onClick={() => handleDelete(c._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Collection Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', borderRadius: '24px' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, color: '#d4af37', marginBottom: '16px' }}>Create New Collection</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Collection Title</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', height: '80px', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Cover Image URL</label>
                <input type="text" required value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} style={{ width: '100%', background: '#141419', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', marginTop: '4px', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#141419', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, background: '#d4af37', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
