import { create } from 'zustand';
import toast from 'react-hot-toast';

const getInitialWishlist = () => {
  try {
    const saved = localStorage.getItem('mensverse_wishlist');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && (item._id || item.id || (typeof item === 'string' && item)));
  } catch (e) {
    return [];
  }
};

export const useWishlistStore = create((set, get) => ({
  wishlist: getInitialWishlist(),

  toggleWishlist: (product) => {
    if (!product) return;
    const targetId = typeof product === 'object' ? (product._id || product.id || product.slug) : product;
    if (!targetId) return;
    const currentWishlist = get().wishlist || [];
    const exists = currentWishlist.some((item) => {
      const itemId = typeof item === 'object' ? (item._id || item.id || item.slug) : item;
      return itemId && String(itemId) === String(targetId);
    });

    let updatedWishlist;
    if (exists) {
      updatedWishlist = currentWishlist.filter((item) => {
        const itemId = typeof item === 'object' ? (item._id || item.id || item.slug) : item;
        return itemId && String(itemId) !== String(targetId);
      });
      toast.success(`Removed ${product.name || 'item'} from Wishlist`, {
        icon: '💔'
      });
    } else {
      updatedWishlist = [...currentWishlist, typeof product === 'object' ? product : { _id: targetId, id: targetId }];
      toast.success(`Saved ${product.name || 'item'} to Wishlist`, {
        icon: '❤️'
      });
    }

    try {
      localStorage.setItem('mensverse_wishlist', JSON.stringify(updatedWishlist));
    } catch (e) {}
    set({ wishlist: updatedWishlist });
  },

  isWishlisted: (productOrId) => {
    if (!productOrId) return false;
    const targetId = typeof productOrId === 'object' ? (productOrId._id || productOrId.id || productOrId.slug) : productOrId;
    if (!targetId) return false;
    const list = get().wishlist || [];
    return list.some((item) => {
      const itemId = typeof item === 'object' ? (item._id || item.id || item.slug) : item;
      return itemId && String(itemId) === String(targetId);
    });
  },

  getWishlistCount: () => {
    return (get().wishlist || []).length;
  }
}));
