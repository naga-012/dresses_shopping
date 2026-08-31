const Category = require('../models/Category');

const initialCategories = [
  { name: 'Shirts', slug: 'shirts', description: 'Premium casual & formal shirts', displayOrder: 1 },
  { name: 'T-Shirts', slug: 't-shirts', description: 'Essential tees & oversized fits', displayOrder: 2 },
  { name: 'Pants', slug: 'pants', description: 'Chinos, trousers & casual bottoms', displayOrder: 3 },
  { name: 'Jeans', slug: 'jeans', description: 'Denim fit for every day', displayOrder: 4 },
  { name: 'Jackets', slug: 'jackets', description: 'Outerwear & bombers', displayOrder: 5 },
  { name: 'Hoodies', slug: 'hoodies', description: 'Cozy hoodies & sweatshirts', displayOrder: 6 },
  { name: 'Shoes', slug: 'shoes', description: 'Sneakers & formal footwear', displayOrder: 7 },
  { name: 'Caps', slug: 'caps', description: 'Streetwear caps & hats', displayOrder: 8 },
  { name: 'Accessories', slug: 'accessories', description: 'Belts, wallets & watches', displayOrder: 9 }
];

// Helper to seed default categories if empty
const autoSeedCategories = async () => {
  try {
    const count = await Category.countDocuments().catch(() => 0);
    if (count === 0) {
      await Category.insertMany(initialCategories).catch(() => {});
    }
  } catch (err) {}
};

// @desc Get all categories (Public / Admin)
// @route GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    await autoSeedCategories();
    const categories = await Category.find({}).sort('displayOrder').catch(() => []);
    res.json(categories.length > 0 ? categories : initialCategories);
  } catch (error) {
    res.json(initialCategories);
  }
};

// @desc Create new category (Admin)
// @route POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, displayOrder, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = new Category({
      name,
      slug,
      description: description || '',
      image: image || '',
      displayOrder: Number(displayOrder || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update category (Admin)
// @route PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    Object.assign(category, req.body);
    if (req.body.name) {
      category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete category (Admin)
// @route DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
