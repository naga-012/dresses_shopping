const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { memoryOrders, getMergedMemoryOrders } = require('./orderController');
const { initialProducts } = require('./productController');

// @desc Get comprehensive dashboard analytics stats
// @route GET /api/admin/dashboard/stats
exports.getAdminDashboardStats = async (req, res) => {
  try {
    let products = [];
    let dbOrders = [];
    let dbUsers = [];

    if (mongoose.connection.readyState === 1) {
      products = await Product.find({}).maxTimeMS(2000).catch(() => []);
      dbOrders = await Order.find({}).maxTimeMS(2000).catch(() => []);
      dbUsers = await User.find({ role: 'user' }).select('-password').maxTimeMS(2000).catch(() => []);
    }

    if (!products || products.length === 0) {
      products = initialProducts || [];
    }

    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);

    // Deduplicate orders seamlessly by normalized key
    const orderMap = new Map();
    [...dbOrders, ...allMem].forEach(o => {
      if (!o) return;
      const rawKey = String(o.orderId || o._id);
      const key = rawKey.replace(/^ORD-/, '');
      if (!orderMap.has(key)) {
        orderMap.set(key, o);
      } else {
        const existing = orderMap.get(key);
        if (o.orderStatus && o.orderStatus !== 'Pending' && existing.orderStatus === 'Pending') {
          orderMap.set(key, { ...existing, ...o, orderStatus: o.orderStatus });
        }
      }
    });

    const orders = Array.from(orderMap.values());
    const totalOrders = orders.length;

    // Deduplicate & aggregate total customers from DB users & order profiles
    const customerMap = new Map();
    dbUsers.forEach(u => {
      if (u.email) customerMap.set(u.email.toLowerCase(), u);
      else if (u.phone) customerMap.set(u.phone, u);
    });

    orders.forEach(ord => {
      const addr = ord.shippingAddress || {};
      const uObj = (ord.user && typeof ord.user === 'object') ? ord.user : {};
      const email = (addr.email || uObj.email || '').toLowerCase();
      const phone = addr.phone || uObj.phone || '';
      const name = addr.fullName || addr.name || uObj.name || 'Customer Member';
      const key = email || phone || String(ord.user || ord._id);
      if (key && !customerMap.has(key)) {
        customerMap.set(key, { _id: ord._id, name, email, phone, createdAt: ord.createdAt });
      }
    });

    const totalCustomers = Math.max(customerMap.size, dbUsers.length);
    const recentCustomers = Array.from(customerMap.values()).slice(0, 5);

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    const statusCounts = {
      pending: orders.filter(o => o.orderStatus === 'Pending').length,
      confirmed: orders.filter(o => o.orderStatus === 'Confirmed' || o.orderStatus === 'Order Confirmed').length,
      processing: orders.filter(o => o.orderStatus === 'Processing').length,
      shipped: orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length,
      delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
    };

    const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, order) => sum + Number(order.totalPrice || order.itemsPrice || 0), 0);

    // Today & 24h Order & Revenue Calculations
    const now = new Date();
    const isSameDay = (d1, d2) => {
      const date1 = new Date(d1);
      const date2 = new Date(d2);
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    };

    const isToday = (d) => {
      if (!d) return false;
      const date = new Date(d);
      if (isNaN(date.getTime())) return false;
      if (isSameDay(date, now)) return true;
      const diffHours = Math.abs(now - date) / 36e5;
      return diffHours <= 24;
    };

    const todayOrdersList = validOrders.filter(o => isToday(o.createdAt));
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList.reduce((sum, order) => sum + Number(order.totalPrice || order.itemsPrice || 0), 0);

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);

    const lowStockAlerts = products
      .filter(p => p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    res.json({
      totalProducts: products.length,
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

    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    const orderMap = new Map();
    [...dbOrders, ...allMem].forEach(o => {
      if (!o || o.orderStatus === 'Cancelled') return;
      const rawKey = String(o.orderId || o._id);
      const key = rawKey.replace(/^ORD-/, '');
      if (!orderMap.has(key)) {
        orderMap.set(key, o);
      }
    });
    const orders = Array.from(orderMap.values());
    
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
