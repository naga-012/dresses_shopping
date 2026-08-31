const Collection = require('../models/Collection');
const Product = require('../models/Product');

// @desc Get all collections
// @route GET /api/collections
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find().populate('products');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single collection with products
// @route GET /api/collections/:id
exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('products');
    if (collection) {
      res.json(collection);
    } else {
      res.status(404).json({ message: 'Collection not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create collection (Admin)
// @route POST /api/collections
exports.createCollection = async (req, res) => {
  try {
    const collection = new Collection(req.body);
    const createdCollection = await collection.save();
    res.status(201).json(createdCollection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update collection (Admin)
// @route PUT /api/collections/:id
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (collection) {
      Object.assign(collection, req.body);
      const updatedCollection = await collection.save();
      res.json(updatedCollection);
    } else {
      res.status(404).json({ message: 'Collection not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete collection (Admin)
// @route DELETE /api/collections/:id
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (collection) {
      await collection.deleteOne();
      res.json({ message: 'Collection deleted' });
    } else {
      res.status(404).json({ message: 'Collection not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
