import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  activeCategory: 'Shirts',
  selectedProduct: null,
  selectedSize: 'M',
  selectedColor: null,
  autoRotate: false,
  cameraPreset: 'front', // 'front', 'side', 'back', 'reset'
  zoomLevel: 1,

  // Click-to-Place Raycaster Placement State
  placementMode: false,
  selectedItemToPlace: null,
  placementMessage: 'Select a clothing item',

  // Simultaneous Multi-Item Outfit Stack
  currentOutfit: {
    top: null,       // Shirt / T-Shirt / Hoodie / Jacket / Blazer
    bottom: null,    // Pants / Jeans / Shorts
    shoes: null,     // Shoes
    headwear: null   // Cap / Hat
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
  
  setSelectedProduct: (product) => {
    set({ 
      selectedProduct: product,
      selectedSize: product?.sizes?.find(s => s.stock > 0)?.size || 'M',
      selectedColor: product?.colors?.[0] || null
    });
  },

  setSelectedItemToPlace: (product) => {
    set({
      selectedItemToPlace: product,
      placementMode: true,
      placementMessage: `Shirt selected. Click the mannequin.`
    });
  },

  setPlacementMessage: (msg) => set({ placementMessage: msg }),
  clearPlacementMode: () => set({ placementMode: false, selectedItemToPlace: null, placementMessage: 'Select a clothing item' }),

  // Outfit stack modifier
  updateOutfit: (category, item) => {
    const outfit = { ...get().currentOutfit };
    const cat = (category || '').toLowerCase();

    if (['shirts', 't-shirts', 'hoodies', 'jackets', 'blazers'].includes(cat)) {
      outfit.top = item;
    } else if (['pants', 'jeans', 'shorts'].includes(cat)) {
      outfit.bottom = item;
    } else if (cat === 'shoes') {
      outfit.shoes = item;
    } else if (['caps', 'cap', 'headwear'].includes(cat)) {
      outfit.headwear = item;
    } else {
      outfit.top = item;
    }

    set({ currentOutfit: outfit });
  },

  removeOutfitItem: (slot) => {
    const outfit = { ...get().currentOutfit };
    outfit[slot] = null;
    set({ currentOutfit: outfit });
  },

  setSelectedSize: (size) => set({ selectedSize: size }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setAutoRotate: (val) => set((state) => ({ autoRotate: typeof val === 'boolean' ? val : !state.autoRotate })),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  resetViewer: () => set({ cameraPreset: 'front', autoRotate: false, zoomLevel: 1 })
}));
