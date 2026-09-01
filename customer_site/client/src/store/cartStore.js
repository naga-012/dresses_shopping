import { create } from 'zustand';
import toast from 'react-hot-toast';

const getInitialCart = () => {
  try {
    const saved = localStorage.getItem('mensverse_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const getProductId = (product) => {
  if (!product) return null;
  return product._id || product.id || null;
};

export const useCartStore = create((set, get) => ({
  cart: getInitialCart(),
  isCartOpen: false,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  addToCart: (product, selectedSize = 'M', selectedColor = null, quantityToAdd = 1) => {
    const currentCart = get().cart;
    const targetId = getProductId(product);
    if (!targetId) return;

    const colorName = selectedColor ? selectedColor.name : (product.colors?.[0]?.name || 'Default');
    const colorHex = selectedColor ? selectedColor.hex : (product.colors?.[0]?.hex || '#000000');

    const existingIndex = currentCart.findIndex(
      (item) => {
        const itemId = getProductId(item.product);
        return itemId && String(itemId) === String(targetId) && item.size === selectedSize && item.color === colorName;
      }
    );

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...currentCart];
      updatedCart[existingIndex].qty += quantityToAdd;
    } else {
      updatedCart = [
        ...currentCart,
        {
          product,
          size: selectedSize,
          color: colorName,
          colorHex,
          qty: quantityToAdd,
          price: product.discountPrice || product.price
        }
      ];
    }

    localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
    toast.success(`Added ${product.name} to cart`);
  },

  removeFromCart: (index) => {
    const updatedCart = get().cart.filter((_, i) => i !== index);
    localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
    toast.success('Item removed from cart');
  },

  updateQty: (index, qty) => {
    if (qty < 1) {
      const updatedCart = get().cart.filter((_, i) => i !== index);
      localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
      toast.success('Item removed from cart');
      return;
    }
    const updatedCart = [...get().cart];
    updatedCart[index].qty = qty;
    localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  clearCart: () => {
    localStorage.removeItem('mensverse_cart');
    set({ cart: [] });
  },

  getCartTotal: () => {
    return (get().cart || []).reduce((total, item) => total + (item?.price || 0) * (item?.qty || 1), 0);
  },

  getItemCount: () => {
    return (get().cart || []).reduce((count, item) => count + (item?.qty || 1), 0);
  },

  getProductQty: (productId) => {
    if (!productId) return 0;
    return (get().cart || [])
      .filter((item) => {
        const itemId = getProductId(item.product);
        return itemId && String(itemId) === String(productId);
      })
      .reduce((total, item) => total + (item?.qty || 0), 0);
  },

  decrementProduct: (productId) => {
    if (!productId) return;
    const currentCart = get().cart;
    const existingIndex = currentCart.findIndex((item) => {
      const itemId = getProductId(item.product);
      return itemId && String(itemId) === String(productId);
    });
    if (existingIndex > -1) {
      const updatedCart = [...currentCart];
      if (updatedCart[existingIndex].qty > 1) {
        updatedCart[existingIndex].qty -= 1;
      } else {
        updatedCart.splice(existingIndex, 1);
        toast.success('Item removed from cart');
      }
      localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
    }
  }
}));
