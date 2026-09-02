import { create } from 'zustand';
import toast from 'react-hot-toast';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

const resolveProductObject = (item) => {
  if (!item) return null;
  if (typeof item === 'object' && item.name && (item.images || item.thumbnail)) {
    return item;
  }
  const idStr = typeof item === 'object' ? (item._id || item.id || item.slug) : String(item);
  if (!idStr) return null;
  const found = FALLBACK_PRODUCTS.find(p => String(p._id) === String(idStr) || String(p.id) === String(idStr) || p.slug === idStr);
  if (found) return found;
  return typeof item === 'object' ? item : { _id: idStr, name: 'Fashion Product', price: 500, images: ['/uploads/cap1.png'] };
};

const getInitialWishlist = () => {
  try {
    const saved = localStorage.getItem('mensverse_wishlist');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    const map = new Map();
    parsed.forEach(rawItem => {
      const resolved = resolveProductObject(rawItem);
      if (resolved) {
        const idKey = String(resolved._id || resolved.id || resolved.slug || '');
        if (idKey && !map.has(idKey)) {
          map.set(idKey, resolved);
        }
      }
    });
    return Array.from(map.values());
  } catch (e) {
    return [];
  }
};

export const useWishlistStore = create((set, get) => ({
  wishlist: getInitialWishlist(),

  toggleWishlist: (product) => {
    if (!product) return;
    const resolvedProduct = resolveProductObject(product) || product;
    const targetId = String(resolvedProduct._id || resolvedProduct.id || resolvedProduct.slug || (typeof product === 'string' ? product : ''));
    if (!targetId) return;

    const currentWishlist = get().wishlist || [];
    const exists = currentWishlist.some((item) => {
      const itemId = String(item._id || item.id || item.slug || (typeof item === 'string' ? item : ''));
      return itemId && (itemId === targetId || itemId.replace(/^prod_/, '') === targetId.replace(/^prod_/, ''));
    });

    let updatedWishlist;
    if (exists) {
      updatedWishlist = currentWishlist.filter((item) => {
        const itemId = String(item._id || item.id || item.slug || (typeof item === 'string' ? item : ''));
        return itemId && itemId !== targetId && itemId.replace(/^prod_/, '') !== targetId.replace(/^prod_/, '');
      });
      toast.success(`Removed ${resolvedProduct.name || 'item'} from Wishlist`, { icon: '💔' });
    } else {
      updatedWishlist = [...currentWishlist, resolvedProduct];
      toast.success(`Saved ${resolvedProduct.name || 'item'} to Wishlist`, { icon: '❤️' });
    }

    try {
      localStorage.setItem('mensverse_wishlist', JSON.stringify(updatedWishlist));
    } catch (e) {}
    set({ wishlist: updatedWishlist });
  },

  isWishlisted: (productOrId) => {
    if (!productOrId) return false;
    const targetId = String(typeof productOrId === 'object' ? (productOrId._id || productOrId.id || productOrId.slug) : productOrId);
    if (!targetId) return false;
    const list = get().wishlist || [];
    return list.some((item) => {
      const itemId = String(typeof item === 'object' ? (item._id || item.id || item.slug) : item);
      return itemId && (itemId === targetId || itemId.replace(/^prod_/, '') === targetId.replace(/^prod_/, ''));
    });
  },

  getWishlistCount: () => {
    return (get().wishlist || []).length;
  }
}));
