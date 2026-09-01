const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { getMergedMemoryOrders, memoryOrders } = require('./orderController');

// @desc Get all registered customers with aggregate order stats
// @route GET /api/admin/customers
exports.getAdminCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    let users = [];
    let count = 0;
    try {
      if (mongoose.connection.readyState >= 1) {
        count = await User.countDocuments(query);
        users = await User.find(query)
          .select('-password')
          .sort('-createdAt')
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit));
      }
    } catch (e) {
      console.warn('DB count/find users fallback:', e.message);
    }

    // Calculate customer metrics (total orders & spend) from DB
    let customersWithStats = [];
    if (users && users.length > 0) {
      customersWithStats = await Promise.all(
        users.map(async (user) => {
          const userOrders = await Order.find({ user: user._id, orderStatus: { $ne: 'Cancelled' } }).catch(() => []);
          const totalOrders = userOrders.length;
          const totalSpend = userOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
          return {
            ...user.toObject(),
            totalOrders,
            totalSpend
          };
        })
      );
    }

    // Fallback: If DB users are empty or unavailable, aggregate customers from order history
    if (!customersWithStats || customersWithStats.length === 0) {
      const allOrders = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
      const customerMap = new Map();

      allOrders.forEach(ord => {
        const key = ord.shippingAddress?.phone || ord.shippingAddress?.email || String(ord.user?._id || ord.user || 'customer');
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            _id: String(ord.user?._id || ord.user || key),
            name: ord.shippingAddress?.fullName || ord.user?.name || 'Customer Member',
            email: ord.shippingAddress?.email || ord.user?.email || 'customer@saha.com',
            phone: ord.shippingAddress?.phone || ord.user?.phone || 'N/A',
            createdAt: ord.createdAt || new Date(),
            totalOrders: 0,
            totalSpend: 0
          });
        }
        const cust = customerMap.get(key);
        if (ord.orderStatus !== 'Cancelled') {
          cust.totalOrders += 1;
          cust.totalSpend += (ord.totalPrice || 0);
        }
      });

      let fallbackList = Array.from(customerMap.values());
      if (search) {
        const s = search.toLowerCase();
        fallbackList = fallbackList.filter(c =>
          (c.name || '').toLowerCase().includes(s) ||
          (c.email || '').toLowerCase().includes(s) ||
          (c.phone || '').toLowerCase().includes(s)
        );
      }
      customersWithStats = fallbackList;
      count = fallbackList.length;
    }

    return res.json({
      customers: customersWithStats,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)) || 1,
      total: count
    });
  } catch (error) {
    console.error('getAdminCustomers error:', error);
    return res.json({
      customers: [],
      page: 1,
      pages: 1,
      total: 0
    });
  }
};

// @desc Get customer detail with order history
// @route GET /api/admin/customers/:id
exports.getAdminCustomerById = async (req, res) => {
  try {
    const custId = req.params.id;
    let user = null;
    if (mongoose.Types.ObjectId.isValid(custId) && mongoose.connection.readyState >= 1) {
      user = await User.findById(custId).select('-password').catch(() => null);
    }

    const allOrders = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    let customerOrders = [];

    try {
      if (mongoose.connection.readyState >= 1 && user) {
        customerOrders = await Order.find({ user: user._id }).sort('-createdAt').catch(() => []);
      }
    } catch (e) {}

    if (!customerOrders || customerOrders.length === 0) {
      customerOrders = allOrders.filter(o =>
        String(o.user?._id || o.user) === String(custId) ||
        String(o.shippingAddress?.phone) === String(custId) ||
        String(o.shippingAddress?.email) === String(custId) ||
        String(o._id) === String(custId)
      );
    }

    if (!user) {
      const sample = customerOrders[0];
      user = {
        _id: custId,
        name: sample?.shippingAddress?.fullName || sample?.user?.name || 'Customer Member',
        email: sample?.shippingAddress?.email || sample?.user?.email || 'N/A',
        phone: sample?.shippingAddress?.phone || 'N/A',
        createdAt: sample?.createdAt || new Date()
      };
    }

    const totalSpend = customerOrders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return res.json({
      customer: user,
      orders: customerOrders,
      totalOrders: customerOrders.length,
      totalSpend
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
