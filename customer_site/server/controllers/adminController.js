const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { memoryOrders } = require('./orderController');

// @desc Get comprehensive dashboard analytics stats
// @route GET /api/admin/dashboard/stats
exports.getAdminDashboardStats = async (req, res) => {
  try {
    let totalProducts = 0;
    let totalCustomers = 0;
    let products = [];
    let dbOrders = [];
    let recentCustomers = [];

    if (mongoose.connection.readyState === 1) {
      products = await Product.find({}).maxTimeMS(2000).catch(() => []);
      dbOrders = await Order.find({}).maxTimeMS(2000).catch(() => []);
      recentCustomers = await User.find({ role: 'user' })
        .select('-password')
        .sort('-createdAt')
        .limit(5)
        .maxTimeMS(2000)
        .catch(() => []);
      totalProducts = products.length;
      totalCustomers = recentCustomers.length;
    }

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // Order status breakdown (DB + memoryOrders)
    const dbOrderIds = new Set(dbOrders.map(o => String(o._id)));
    const filteredMemOrders = (memoryOrders || []).filter(mo => !dbOrderIds.has(String(mo._id)));
    const orders = [...dbOrders, ...filteredMemOrders];

    const totalOrders = orders.length;

    const statusCounts = {
      pending: orders.filter(o => o.orderStatus === 'Pending').length,
      confirmed: orders.filter(o => o.orderStatus === 'Confirmed' || o.orderStatus === 'Order Confirmed').length,
      processing: orders.filter(o => o.orderStatus === 'Processing').length,
      shipped: orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length,
      delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
    };

    // Revenue calculations
    const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Today's revenue & orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrdersList = validOrders.filter(o => new Date(o.createdAt) >= startOfToday);
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    // Top low stock products
    const lowStockAlerts = products
      .filter(p => p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      todayOrders,
      todayRevenue,
      lowStockCount,
      outOfStockCount,
      statusCounts,
      recentOrders,
      recentCustomers,
      lowStockAlerts
    });
  } catch (error) {
    console.error('getAdminDashboardStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get analytics charts data (monthly revenue, daily sales, best sellers)
// @route GET /api/admin/dashboard/analytics
exports.getAdminAnalytics = async (req, res) => {
  try {
    let dbOrders = [];
    if (mongoose.connection.readyState === 1) {
      dbOrders = await Order.find({ orderStatus: { $ne: 'Cancelled' } }).maxTimeMS(2000).catch(() => []);
    }

    const dbOrderIds = new Set(dbOrders.map(o => String(o._id)));
    const filteredMemOrders = (memoryOrders || []).filter(mo => !dbOrderIds.has(String(mo._id)) && mo.orderStatus !== 'Cancelled');
    const orders = [...dbOrders, ...filteredMemOrders];
    
    // Group sales by day (last 14 days)
    const daysMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    // Group sales by month (last 6 months)
    const monthsMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthsMap[key] = { month: key, revenue: 0, orders: 0 };
    }

    // Process orders into maps
    orders.forEach(order => {
      const created = new Date(order.createdAt);
      const dayKey = created.toISOString().split('T')[0];
      if (daysMap[dayKey]) {
        daysMap[dayKey].revenue += order.totalPrice || 0;
        daysMap[dayKey].orders += 1;
      }

      const monthKey = `${monthNames[created.getMonth()]} ${created.getFullYear()}`;
      if (monthsMap[monthKey]) {
        monthsMap[monthKey].revenue += order.totalPrice || 0;
        monthsMap[monthKey].orders += 1;
      }
    });

    // Best selling products
    const productSalesMap = {};
    orders.forEach(order => {
      (order.orderItems || []).forEach(item => {
        const pId = String(item.product || item.name);
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = {
            id: pId,
            name: item.name || 'Product',
            image: item.image || '',
            totalQty: 0,
            totalSales: 0
          };
        }
        productSalesMap[pId].totalQty += item.qty || 1;
        productSalesMap[pId].totalSales += (item.price || 0) * (item.qty || 1);
      });
    });

    const bestSellers = Object.values(productSalesMap)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 6);

    res.json({
      dailySales: Object.values(daysMap),
      monthlySales: Object.values(monthsMap),
      bestSellers
    });
  } catch (error) {
    console.error('getAdminAnalytics error:', error);
    res.status(500).json({ message: error.message });
  }
};
