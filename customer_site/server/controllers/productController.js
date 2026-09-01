const Product = require('../models/Product');
const Collection = require('../models/Collection');
const initialProducts = require('../utils/seedData');

// Helper to auto-seed database if empty
const autoSeedIfEmpty = async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return;
    const count = await Product.countDocuments().maxTimeMS(2000).catch(() => 0);
    if (count === 0) {
      console.log('Database empty: Auto-seeding initial products...');
      await Product.insertMany(initialProducts).catch(err => console.error('Auto seed error:', err));
    }
  } catch (err) {
    console.error('Auto seed check error:', err);
  }
};

// @desc Get all products (with search, category, collection filter)
// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    await autoSeedIfEmpty();

    const { category, collectionId, featured, trending, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (collectionId) query.collectionId = collectionId;
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let products = await Product.find(query).populate('collectionId', 'name').catch(() => []);
    if (!products || products.length === 0) {
      products = initialProducts;
      if (category) {
        products = products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
    }
    res.json(products);
  } catch (error) {
    res.json(initialProducts);
  }
};

// @desc Get single product
// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    let product = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(req.params.id).populate('collectionId').catch(() => null);
    }
    if (!product) {
      product = initialProducts.find(p => p._id === req.params.id || p.slug === req.params.id);
    }
    if (product) {
      return res.json(product);
    }
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    const local = initialProducts.find(p => p._id === req.params.id || p.slug === req.params.id);
    if (local) return res.json(local);
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc Create product (Admin)
// @route POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();

    if (req.body.collectionId) {
      await Collection.findByIdAndUpdate(req.body.collectionId, {
        $push: { products: createdProduct._id }
      });
    }

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update product (Admin)
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();

      if (req.body.collectionId && req.body.collectionId !== product.collectionId?.toString()) {
        // Remove from old collection
        if (product.collectionId) {
          await Collection.findByIdAndUpdate(product.collectionId, {
            $pull: { products: product._id }
          });
        }
        // Add to new collection
        await Collection.findByIdAndUpdate(req.body.collectionId, {
          $addToSet: { products: product._id }
        });
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete product (Admin)
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      if (product.collectionId) {
        await Collection.findByIdAndUpdate(product.collectionId, {
          $pull: { products: product._id }
        });
      }
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
