const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Shirts', 'T-Shirts', 'Hoodies', 'Jackets', 'Blazers', 'Jeans', 'Pants', 'Shorts', 'Traditional Wear', 'Shoes', 'Caps', 'Accessories'] 
  },
  brand: { type: String, default: 'URBAN FIT' },
  collectionName: { type: String, default: 'Summer Luxe' },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  sizes: [{
    size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'One Size', '6', '7', '8', '9', '10', '11', '12', '26', '28', '30', '32', '34', '36', '38'] },
    stock: { type: Number, default: 10 }
  }],


  colors: [{
    name: String,
    hex: String
  }],
  images: [{ type: String }],
  thumbnail: { type: String },
  frontImage: { type: String, default: '' },
  backImage: { type: String, default: '' },
  leftImage: { type: String, default: '' },
  rightImage: { type: String, default: '' },
  model3D: { type: String, default: '' },
  model3DUrl: { type: String, default: '' },
  images360: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 4.9 },
  stock: { type: Number, default: 20 },
  soldCount: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  tags: [{ type: String }]
}, { timestamps: true, bufferCommands: false });

module.exports = mongoose.model('Product', productSchema);
