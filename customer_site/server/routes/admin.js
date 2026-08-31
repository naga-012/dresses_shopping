const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

const {
  getAdminDashboardStats,
  getAdminAnalytics
} = require('../controllers/adminController');

const {
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  toggleProductAvailability,
  updateProductStock
} = require('../controllers/adminProductController');

const {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus
} = require('../controllers/adminOrderController');

const {
  getAdminCustomers,
  getAdminCustomerById
} = require('../controllers/customerController');

const {
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Protect all admin routes
router.use(protect);
router.use(admin);

// Dashboard stats & analytics
router.get('/dashboard/stats', getAdminDashboardStats);
router.get('/dashboard/analytics', getAdminAnalytics);

// Product management
router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProductById);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.patch('/products/:id/availability', toggleProductAvailability);
router.patch('/products/:id/stock', updateProductStock);

// Order management
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateAdminOrderStatus);

// Customer management
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getAdminCustomerById);

// Category management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
