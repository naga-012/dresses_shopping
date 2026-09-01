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
    const targetId = product?._id || product?.id;
    if (!targetId) return;
    const currentWishlist = get().wishlist || [];
    const exists = currentWishlist.some((item) => {
      const itemId = item?._id || item?.id || item;
      return itemId && String(itemId) === String(targetId);
    });

    let updatedWishlist;
    if (exists) {
      updatedWishlist = currentWishlist.filter((item) => {
        const itemId = item?._id || item?.id || item;
        return itemId && String(itemId) !== String(targetId);
      });
      toast.success(`Removed ${product.name || 'item'} from Wishlist`, {
        icon: '💔'
      });
    } else {
      updatedWishlist = [...currentWishlist, product];
      toast.success(`Saved ${product.name || 'item'} to Wishlist`, {
        icon: '❤️'
      });
    }

    localStorage.setItem('mensverse_wishlist', JSON.stringify(updatedWishlist));
    set({ wishlist: updatedWishlist });
  },

  isWishlisted: (productId) => {
    if (!productId) return false;
    const list = get().wishlist || [];
    return list.some((item) => {
      const itemId = item?._id || item?.id || item;
      return itemId && String(itemId) === String(productId);
    });
  },

  getWishlistCount: () => {
    return (get().wishlist || []).length;
  }
}));
