import { create } from 'zustand';
import toast from 'react-hot-toast';

const getInitialWishlist = () => {
  try {
    const saved = localStorage.getItem('mensverse_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const useWishlistStore = create((set, get) => ({
  wishlist: getInitialWishlist(),

  toggleWishlist: (product) => {
    if (!product || !product._id) return;
    const currentWishlist = get().wishlist || [];
    const exists = currentWishlist.some((item) => (item._id || item) === product._id);

    let updatedWishlist;
    if (exists) {
      updatedWishlist = currentWishlist.filter((item) => (item._id || item) !== product._id);
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
    return list.some((item) => (item?._id || item) === productId);
  },

  getWishlistCount: () => {
    return (get().wishlist || []).length;
  }
}));
