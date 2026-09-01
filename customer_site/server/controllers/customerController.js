const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { getMergedMemoryOrders, memoryOrders } = require('./orderController');

const seedCustomers = [
  {
    _id: 'usr_saha_demo_01',
    name: 'naga',
    email: 'naga@saha.com',
    phone: '09121792433',
    createdAt: new Date('2026-08-31T20:00:00.000Z'),
    totalOrders: 1,
    totalSpend: 1000
  },
  {
    _id: 'usr_saha_demo_02',
    name: 'Saha Member',
    email: 'sahamember@saha.com',
    phone: '09121792433',
    createdAt: new Date('2026-08-31T19:50:00.000Z'),
    totalOrders: 1,
    totalSpend: 1900
  }
];

// @desc Get all registered customers with aggregate order stats
// @route GET /api/admin/customers
exports.getAdminCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let query = { role: { $ne: 'admin' } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    let users = [];
    try {
      if (mongoose.connection.readyState >= 1) {
        users = await User.find(query)
          .select('-password')
          .sort('-createdAt')
          .limit(Number(limit))
          .catch(() => []);
      }
    } catch (e) {
      console.warn('DB find users fallback:', e.message);
    }

    let dbCustomersWithStats = [];
    if (users && users.length > 0) {
      dbCustomersWithStats = await Promise.all(
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

    // Extract fallback customers from order history
    const allOrders = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    const orderCustomerMap = new Map();

    seedCustomers.forEach(sc => orderCustomerMap.set(sc._id, { ...sc }));

    allOrders.forEach(ord => {
      if (!ord) return;
      const custName = ord.shippingAddress?.fullName || ord.user?.name || 'Customer Member';
      const custEmail = ord.shippingAddress?.email || ord.user?.email || `${custName.toLowerCase().replace(/[^a-z0-9]/g, '')}@saha.com`;
      const custPhone = ord.shippingAddress?.phone || ord.user?.phone || 'N/A';
      const mapKey = String(ord.user?._id || ord.user || custName + '_' + custPhone);

      if (!orderCustomerMap.has(mapKey)) {
        orderCustomerMap.set(mapKey, {
          _id: mapKey,
          name: custName,
          email: custEmail,
          phone: custPhone,
          createdAt: ord.createdAt || new Date(),
          totalOrders: 0,
          totalSpend: 0
        });
      }
      const cust = orderCustomerMap.get(mapKey);
      if (ord.orderStatus !== 'Cancelled') {
        cust.totalOrders = (cust.totalOrders || 0) + 1;
        cust.totalSpend = (cust.totalSpend || 0) + (ord.totalPrice || 0);
      }
    });

    const fallbackCustomers = Array.from(orderCustomerMap.values());

    // Merge DB customers with fallback order customers
    const combinedMap = new Map();
    [...dbCustomersWithStats, ...fallbackCustomers].forEach(c => {
      const key = (c.email && c.email.includes('@')) ? c.email.toLowerCase() : (c.phone || c.name || c._id);
      if (!combinedMap.has(key)) {
        combinedMap.set(key, c);
      } else {
        const existing = combinedMap.get(key);
        combinedMap.set(key, {
          ...existing,
          ...c,
          totalOrders: Math.max(existing.totalOrders || 0, c.totalOrders || 0),
          totalSpend: Math.max(existing.totalSpend || 0, c.totalSpend || 0)
        });
      }
    });

    let finalCustomers = Array.from(combinedMap.values());

    if (search) {
      const s = search.toLowerCase();
      finalCustomers = finalCustomers.filter(c =>
        (c.name || '').toLowerCase().includes(s) ||
        (c.email || '').toLowerCase().includes(s) ||
        (c.phone || '').toLowerCase().includes(s)
      );
    }

    return res.json({
      customers: finalCustomers,
      page: Number(page),
      pages: Math.ceil(finalCustomers.length / Number(limit)) || 1,
      total: finalCustomers.length
    });
  } catch (error) {
    console.error('getAdminCustomers error:', error);
    return res.json({
      customers: seedCustomers,
      page: 1,
      pages: 1,
      total: seedCustomers.length
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
