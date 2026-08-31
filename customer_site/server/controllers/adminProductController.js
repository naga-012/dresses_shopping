const Product = require('../models/Product');

// Helper to notify connected WebSocket clients about product updates
const emitProductEvent = (req, eventName, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, data);
  }
};

// @desc Get all products for Admin with filtering, search, and pagination
// @route GET /api/admin/products
exports.getAdminProducts = async (req, res) => {
  try {
    const { search, category, stockStatus, page = 1, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (stockStatus) {
      if (stockStatus === 'IN_STOCK') query.stock = { $gt: 5 };
      else if (stockStatus === 'LOW_STOCK') query.stock = { $gt: 0, $lte: 5 };
      else if (stockStatus === 'OUT_OF_STOCK') query.stock = 0;
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product for edit
// @route GET /api/admin/products/:id
exports.getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new product
// @route POST /api/admin/products
exports.createAdminProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      sizes,
      colors,
      images,
      thumbnail,
      frontImage,
      backImage,
      leftImage,
      rightImage,
      model3D,
      model3DUrl,
      images360,
      isFeatured,
      isNewArrival,
      isAvailable,
      tags
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const product = new Product({
      name,
      slug,
      description,
      category,
      brand: brand || 'SAHA FIT',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock || 0),
      sku: sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      sizes: sizes || [{ size: 'M', stock: Number(stock || 10) }],
      colors: colors || [{ name: 'Black', hex: '#000000' }],
      images: images || [],
      thumbnail: thumbnail || (images && images[0]) || '',
      frontImage: frontImage || '',
      backImage: backImage || '',
      leftImage: leftImage || '',
      rightImage: rightImage || '',
      model3D: model3D || model3DUrl || '',
      model3DUrl: model3DUrl || model3D || '',
      images360: images360 || [],
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      tags: tags || []
    });

    const createdProduct = await product.save();
    emitProductEvent(req, 'product:created', createdProduct);

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('createAdminProduct error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc Update product
// @route PUT /api/admin/products/:id
exports.updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    Object.assign(product, req.body);

    // If stock changed to 0, auto disable availability if needed
    if (req.body.stock !== undefined && Number(req.body.stock) === 0) {
      product.isAvailable = false;
    }

    const updatedProduct = await product.save();
    emitProductEvent(req, 'product:updated', updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Toggle product availability (enable/disable)
// @route PATCH /api/admin/products/:id/availability
exports.toggleProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isAvailable = !product.isAvailable;
    const updatedProduct = await product.save();
    emitProductEvent(req, 'product:updated', updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Quick update product stock & SKU
// @route PATCH /api/admin/products/:id/stock
exports.updateProductStock = async (req, res) => {
  try {
    const { stock, sku } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (stock !== undefined) {
      product.stock = Number(stock);
      if (product.stock > 0) {
        product.isAvailable = true;
      }
    }
    if (sku !== undefined) {
      product.sku = sku;
    }

    const updatedProduct = await product.save();
    emitProductEvent(req, 'product:stock_updated', updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete product
// @route DELETE /api/admin/products/:id
exports.deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    emitProductEvent(req, 'product:deleted', { id: req.params.id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
