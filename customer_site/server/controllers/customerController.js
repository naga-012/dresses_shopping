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

/**
 * @desc Get all registered & order-based customers with aggregated purchase stats
 * @route GET /api/admin/customers
 */
exports.getAdminCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    // 1. Fetch Registered DB Users (Only if Mongoose is fully connected and valid cluster)
    let dbCustomersWithStats = [];
    const isVercel = Boolean(process.env.VERCEL);
    const mongoUri = process.env.MONGO_URI || '';
    const isLocalUriOnVercel = isVercel && (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost') || mongoUri.includes('<db_username>'));

    try {
      if (!isLocalUriOnVercel && mongoose.connection.readyState === 1) {
        let userQuery = { role: { $ne: 'admin' } };
        if (search && typeof search === 'string' && search.trim()) {
          const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          userQuery.$or = [
            { name: { $regex: sanitized, $options: 'i' } },
            { email: { $regex: sanitized, $options: 'i' } },
            { phone: { $regex: sanitized, $options: 'i' } }
          ];
        }

        const users = await User.find(userQuery)
          .select('-password')
          .sort('-createdAt')
          .limit(Number(limit))
          .maxTimeMS(2000)
          .catch(() => []);

        if (users && users.length > 0) {
          dbCustomersWithStats = await Promise.all(
            users.map(async (user) => {
              const uObj = user.toObject ? user.toObject() : user;
              let userOrders = [];
              if (mongoose.connection.readyState === 1) {
                userOrders = await Order.find({
                  $or: [
                    { user: user._id },
                    ...(user.phone ? [{ 'shippingAddress.phone': user.phone }] : []),
                    ...(user.email ? [{ 'shippingAddress.email': user.email }] : [])
                  ],
                  orderStatus: { $ne: 'Cancelled' }
                })
                  .maxTimeMS(2000)
                  .catch(() => []);
              }

              const totalOrders = userOrders.length;
              const totalSpend = userOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

              return {
                ...uObj,
                totalOrders,
                totalSpend
              };
            })
          );
        }
      }
    } catch (e) {
      console.warn('[getAdminCustomers] DB find users error:', e.message);
    }

    // 2. Fetch All Orders (DB + Cache/Memory)
    const memOrders = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    let dbOrders = [];
    try {
      if (!isLocalUriOnVercel && mongoose.connection.readyState === 1) {
        dbOrders = await Order.find({}).sort('-createdAt').maxTimeMS(2000).catch(() => []);
      }
    } catch (e) {}

    const orderDedupeMap = new Map();
    [...dbOrders, ...memOrders].forEach(o => {
      if (!o) return;
      const key = String(o._id || o.orderId);
      if (!orderDedupeMap.has(key)) {
        orderDedupeMap.set(key, o);
      }
    });

    const combinedOrders = Array.from(orderDedupeMap.values());

    // 3. Extract Customer Profiles from Order History
    const orderCustomerMap = new Map();

    // Add seed customers
    seedCustomers.forEach(sc => {
      if (sc && sc._id) orderCustomerMap.set(String(sc._id), { ...sc });
    });

    combinedOrders.forEach(ord => {
      if (!ord) return;

      const address = ord.shippingAddress || {};
      const userObj = (ord.user && typeof ord.user === 'object') ? ord.user : {};

      const rawName = address.fullName || address.name || userObj.name || 'Customer Member';
      const custName = typeof rawName === 'string' ? rawName.trim() : String(rawName);

      const rawEmail = address.email || userObj.email;
      const custEmail = (typeof rawEmail === 'string' && rawEmail.includes('@'))
        ? rawEmail.trim().toLowerCase()
        : `${custName.toLowerCase().replace(/[^a-z0-9]/g, '')}@saha.com`;

      const rawPhone = address.phone || address.mobile || userObj.phone;
      const custPhone = (typeof rawPhone === 'string' && rawPhone.trim())
        ? rawPhone.trim()
        : 'N/A';

      // Generate robust map key
      let mapKey = '';
      if (custEmail && custEmail.includes('@') && !custEmail.endsWith('@saha.com')) {
        mapKey = custEmail;
      } else if (custPhone && custPhone !== 'N/A' && custPhone.length >= 6) {
        mapKey = custPhone;
      } else if (userObj._id) {
        mapKey = String(userObj._id);
      } else if (typeof ord.user === 'string' && ord.user.trim()) {
        mapKey = ord.user.trim();
      } else {
        mapKey = custName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + custPhone;
      }

      if (!orderCustomerMap.has(mapKey)) {
        orderCustomerMap.set(mapKey, {
          _id: mapKey,
          name: custName,
          email: custEmail,
          phone: custPhone,
          createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date(),
          totalOrders: 0,
          totalSpend: 0
        });
      }

      const cust = orderCustomerMap.get(mapKey);
      if (ord.orderStatus !== 'Cancelled') {
        cust.totalOrders = (cust.totalOrders || 0) + 1;
        cust.totalSpend = (cust.totalSpend || 0) + (Number(ord.totalPrice) || 0);
      }
      if (ord.createdAt && new Date(ord.createdAt) < new Date(cust.createdAt)) {
        cust.createdAt = new Date(ord.createdAt);
      }
    });

    const fallbackCustomers = Array.from(orderCustomerMap.values());

    // 4. Merge DB Registered Users with Order Customers
    const finalMap = new Map();
    [...dbCustomersWithStats, ...fallbackCustomers].forEach(c => {
      if (!c) return;
      const key = (typeof c.email === 'string' && c.email.includes('@'))
        ? c.email.toLowerCase()
        : (c.phone && c.phone !== 'N/A')
          ? c.phone
          : String(c._id || c.name);

      if (!finalMap.has(key)) {
        finalMap.set(key, c);
      } else {
        const existing = finalMap.get(key);
        finalMap.set(key, {
          ...existing,
          ...c,
          name: (c.name && c.name !== 'Customer Member') ? c.name : existing.name,
          phone: (c.phone && c.phone !== 'N/A') ? c.phone : existing.phone,
          email: (c.email && c.email.includes('@')) ? c.email : existing.email,
          totalOrders: Math.max(existing.totalOrders || 0, c.totalOrders || 0),
          totalSpend: Math.max(existing.totalSpend || 0, c.totalSpend || 0)
        });
      }
    });

    let finalCustomers = Array.from(finalMap.values());

    // 5. Apply Search Filter
    if (search && typeof search === 'string' && search.trim()) {
      const s = search.trim().toLowerCase();
      finalCustomers = finalCustomers.filter(c =>
        (c.name || '').toLowerCase().includes(s) ||
        (c.email || '').toLowerCase().includes(s) ||
        (c.phone || '').toLowerCase().includes(s)
      );
    }

    // Sort by latest created date
    finalCustomers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.json({
      customers: finalCustomers,
      page: Number(page),
      pages: Math.ceil(finalCustomers.length / Number(limit)) || 1,
      total: finalCustomers.length
    });
  } catch (error) {
    console.error('[getAdminCustomers] Error:', error);
    return res.json({
      customers: seedCustomers,
      page: 1,
      pages: 1,
      total: seedCustomers.length
    });
  }
};

/**
 * @desc Get detailed customer information with full order history
 * @route GET /api/admin/customers/:id
 */
exports.getAdminCustomerById = async (req, res) => {
  try {
    const custId = req.params.id;
    let user = null;

    if (mongoose.Types.ObjectId.isValid(custId) && mongoose.connection.readyState === 1) {
      user = await User.findById(custId).select('-password').maxTimeMS(2000).catch(() => null);
    }

    const memOrders = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    let dbOrders = [];
    if (mongoose.connection.readyState === 1) {
      dbOrders = await Order.find({}).sort('-createdAt').maxTimeMS(2000).catch(() => []);
    }

    const orderDedupeMap = new Map();
    [...dbOrders, ...memOrders].forEach(o => {
      if (!o) return;
      const key = String(o._id || o.orderId);
      if (!orderDedupeMap.has(key)) orderDedupeMap.set(key, o);
    });

    const allOrders = Array.from(orderDedupeMap.values());

    const cleanDigits = (val) => String(val || '').replace(/\D/g, '').slice(-10);
    const targetDigits = cleanDigits(custId) || cleanDigits(req.query?.phone);
    const targetEmail = String(req.query?.email || (String(custId).includes('@') ? custId : '')).toLowerCase().trim();
    const targetName = String(req.query?.name || '').toLowerCase().trim();

    const customerOrders = allOrders.filter(o => {
      if (!o) return false;
      const oUserId = String(o.user?._id || o.user || '');
      const oPhoneDigits = cleanDigits(o.shippingAddress?.phone || o.shippingAddress?.mobile || o.user?.phone);
      const oEmail = String(o.shippingAddress?.email || o.userEmail || o.user?.email || '').toLowerCase().trim();
      const oName = String(o.shippingAddress?.fullName || o.shippingAddress?.name || o.user?.name || '').toLowerCase().trim();
      const oOrderId = String(o._id || o.orderId || '');

      const matchUserId = oUserId === String(custId) ||
        (oUserId === 'usr_saha_demo' && (custId === 'usr_saha_demo_01' || custId === 'usr_saha_demo_02'));
      const matchPhone = targetDigits && targetDigits.length >= 8 && oPhoneDigits === targetDigits;
      const matchEmail = targetEmail && oEmail && oEmail === targetEmail;
      const matchOrderId = oOrderId === String(custId);
      const matchName = (targetName && oName && oName === targetName) || (String(custId).toLowerCase() === oName);

      // Seed mapping for demo customers
      const matchSeedNaga = (custId === 'usr_saha_demo_01' || custId === 'naga') && (oName.includes('naga') || oUserId === 'usr_saha_demo');
      const matchSeedMember = (custId === 'usr_saha_demo_02' || custId.includes('saha')) && (oName.includes('saha') || oUserId === 'usr_saha_demo');

      return matchUserId || matchPhone || matchEmail || matchOrderId || matchName || matchSeedNaga || matchSeedMember;
    });

    if (!user) {
      const sample = customerOrders[0];
      user = {
        _id: custId,
        name: sample?.shippingAddress?.fullName || sample?.user?.name || req.query?.name || 'Customer Member',
        email: sample?.shippingAddress?.email || sample?.user?.email || req.query?.email || 'N/A',
        phone: sample?.shippingAddress?.phone || req.query?.phone || 'N/A',
        createdAt: sample?.createdAt || new Date()
      };
    }

    const totalSpend = customerOrders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    return res.json({
      customer: user,
      orders: customerOrders,
      totalOrders: customerOrders.length,
      totalSpend
    });
  } catch (error) {
    console.error('[getAdminCustomerById] Error:', error);
    return res.status(500).json({ message: error.message });
  }
};
