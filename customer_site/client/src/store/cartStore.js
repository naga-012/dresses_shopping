import { create } from 'zustand';
import toast from 'react-hot-toast';

const getProductId = (product) => {
  if (!product) return null;
  if (typeof product === 'string') return product;
  const rawId = product._id || product.id || product.slug || product.name;
  if (!rawId) return null;
  if (typeof rawId === 'object' && rawId !== null) {
    if (rawId.$oid) return String(rawId.$oid);
    if (typeof rawId.toString === 'function') {
      const s = rawId.toString();
      if (s !== '[object Object]') return s;
    }
  }
  return String(rawId);
};

const getInitialCart = () => {
  try {
    const saved = localStorage.getItem('mensverse_cart');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && item.product && getProductId(item.product));
  } catch (e) {
    return [];
  }
};

export const useCartStore = create((set, get) => ({
  cart: getInitialCart(),
  isCartOpen: false,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  addToCart: (product, selectedSize = 'M', selectedColor = null, quantityToAdd = 1) => {
    if (!product) return;
    const targetId = getProductId(product);
    if (!targetId) return;

    const currentCart = get().cart || [];
    const sizeToUse = selectedSize || (Array.isArray(product.sizes) ? product.sizes[0]?.size : 'M') || 'M';
    const colorName = typeof selectedColor === 'string'
      ? selectedColor
      : (selectedColor?.name || (Array.isArray(product.colors) ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0]?.name) : 'Default'));
    
    const colorHex = typeof selectedColor === 'object' && selectedColor?.hex
      ? selectedColor.hex
      : (Array.isArray(product.colors) && typeof product.colors[0] === 'object' ? product.colors[0]?.hex : '#000000');

    const existingIndex = currentCart.findIndex(
      (item) => {
        const itemId = getProductId(item.product);
        return itemId && String(itemId) === String(targetId) && item.size === sizeToUse && item.color === colorName;
      }
    );

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...currentCart];
      updatedCart[existingIndex].qty += (quantityToAdd || 1);
    } else {
      updatedCart = [
        ...currentCart,
        {
          product,
          size: sizeToUse,
          color: colorName,
          colorHex,
          qty: quantityToAdd || 1,
          price: product.discountPrice || product.price || 0
        }
      ];
    }

    try {
      localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
    set({ cart: updatedCart });
    toast.success(`Added ${product.name || 'item'} to cart`);
  },

  removeFromCart: (index) => {
    const updatedCart = (get().cart || []).filter((_, i) => i !== index);
    try {
      localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
    } catch (e) {}
    set({ cart: updatedCart });
    toast.success('Item removed from cart');
  },

  updateQty: (index, qty) => {
    if (qty < 1) {
      const updatedCart = (get().cart || []).filter((_, i) => i !== index);
      try {
        localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
      } catch (e) {}
      set({ cart: updatedCart });
      toast.success('Item removed from cart');
      return;
    }
    const updatedCart = [...(get().cart || [])];
    if (updatedCart[index]) {
      updatedCart[index].qty = qty;
      try {
        localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
      } catch (e) {}
      set({ cart: updatedCart });
    }
  },

  clearCart: () => {
    try {
      localStorage.removeItem('mensverse_cart');
    } catch (e) {}
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
    const targetId = typeof productId === 'object' ? getProductId(productId) : String(productId);
    if (!targetId) return 0;

    return (get().cart || [])
      .filter((item) => {
        const itemId = getProductId(item.product);
        return itemId && String(itemId) === String(targetId);
      })
      .reduce((total, item) => total + (item?.qty || 0), 0);
  },

  decrementProduct: (productId) => {
    if (!productId) return;
    const targetId = typeof productId === 'object' ? getProductId(productId) : String(productId);
    if (!targetId) return;

    const currentCart = get().cart || [];
    const existingIndex = currentCart.findIndex((item) => {
      const itemId = getProductId(item.product);
      return itemId && String(itemId) === String(targetId);
    });

    if (existingIndex > -1) {
      const updatedCart = [...currentCart];
      if (updatedCart[existingIndex].qty > 1) {
        updatedCart[existingIndex].qty -= 1;
      } else {
        updatedCart.splice(existingIndex, 1);
        toast.success('Item removed from cart');
      }
      try {
        localStorage.setItem('mensverse_cart', JSON.stringify(updatedCart));
      } catch (e) {}
      set({ cart: updatedCart });
    }
  }
}));
