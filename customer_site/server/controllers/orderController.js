const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { sendOrderNotificationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');

const fs = require('fs');
const path = require('path');

const seedOrders = [
  {
    _id: '6a95a9abheb0923ab34d68a7',
    orderId: 'ORD-526393',
    user: 'usr_saha_demo',
    orderItems: [
      {
        name: 'Masato Kawajo SECND SLF Oversized Long Sleeve',
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=60',
        price: 900,
        qty: 1,
        size: 'M'
      }
    ],
    shippingAddress: {
      fullName: 'naga',
      street: 'KPHB Colony, KPHB Colony',
      city: 'Hyderabad',
      pincode: '500072',
      phone: '09121792433'
    },
    paymentMethod: 'COD',
    itemsPrice: 900,
    shippingPrice: 100,
    totalPrice: 1000,
    isPaid: false,
    orderStatus: 'Confirmed',
    statusTimeline: [
      { status: 'Pending', updatedAt: new Date('2026-08-31T21:40:00.000Z') },
      { status: 'Confirmed', updatedAt: new Date('2026-08-31T21:45:00.000Z') }
    ],
    createdAt: new Date('2026-08-31T21:40:00.000Z')
  },
  {
    _id: '6a958f1e684246dd9a1785af',
    orderId: 'ORD-6A958F1E68',
    user: 'usr_saha_demo',
    orderItems: [
      {
        name: 'Puma Speedcat Suede Black & Silver Formstrip Sneakers',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
        price: 1800,
        qty: 1,
        size: 'M'
      }
    ],
    shippingAddress: {
      fullName: 'Saha Member',
      street: 'street number 5, Satavahana Nagar',
      city: 'Hyderabad',
      pincode: '500085',
      phone: '09121792433'
    },
    paymentMethod: 'COD',
    itemsPrice: 1800,
    shippingPrice: 100,
    totalPrice: 1900,
    isPaid: false,
    orderStatus: 'Confirmed',
    statusTimeline: [
      { status: 'Pending', updatedAt: new Date('2026-08-31T19:56:00.000Z') },
      { status: 'Confirmed', updatedAt: new Date('2026-08-31T20:00:00.000Z') }
    ],
    createdAt: new Date('2026-08-31T19:56:00.000Z')
  }
];

// Memory store for mock orders when DB is unconfigured
if (!global.memoryOrders || global.memoryOrders.length === 0) {
  global.memoryOrders = [...seedOrders];
}
const memoryOrders = global.memoryOrders;
exports.memoryOrders = memoryOrders;

const getCacheFilePath = () => {
  try {
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../');
    return path.join(tmpDir, 'orders_cache.json');
  } catch (e) {
    return null;
  }
};

const readCachedOrders = () => {
  try {
    const file = getCacheFilePath();
    if (file && fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data) || [];
    }
  } catch (e) {}
  return [];
};

const saveCachedOrders = (orders) => {
  try {
    const file = getCacheFilePath();
    if (file) {
      fs.writeFileSync(file, JSON.stringify(orders));
    }
  } catch (e) {}
};

const STATUS_RANK = {
  'Pending': 1,
  'Confirmed': 2,
  'Order Confirmed': 2,
  'Processing': 3,
  'Shipped': 4,
  'Out for Delivery': 5,
  'Delivered': 6,
  'Cancelled': 99
};

const resolveBestStatus = (statusA, statusB) => {
  if (statusA === 'Cancelled' || statusB === 'Cancelled') return 'Cancelled';
  const rankA = STATUS_RANK[statusA] || 0;
  const rankB = STATUS_RANK[statusB] || 0;
  return rankA >= rankB ? (statusA || statusB || 'Pending') : (statusB || statusA || 'Pending');
};

const getMergedMemoryOrders = () => {
  const fileOrders = readCachedOrders();
  const map = new Map();
  [...seedOrders, ...memoryOrders, ...fileOrders].forEach(rawO => {
    if (!rawO) return;
    const o = rawO.toObject ? rawO.toObject() : rawO;
    const rawId = String(o.orderId || o._id || '');
    const key = rawId.replace(/^ORD-/, '');
    if (!key) return;

    const oTime = new Date(o.updatedAt || o.createdAt || 0).getTime();
    if (!map.has(key)) {
      map.set(key, o);
    } else {
      const existing = map.get(key);
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      if (oTime > existingTime) {
        map.set(key, { ...existing, ...o, orderStatus: o.orderStatus || existing.orderStatus });
      } else if (existingTime > oTime) {
        map.set(key, { ...o, ...existing, orderStatus: existing.orderStatus || o.orderStatus });
      } else {
        const bestStatus = resolveBestStatus(existing.orderStatus, o.orderStatus);
        map.set(key, { ...existing, ...o, orderStatus: bestStatus });
      }
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });

  global.memoryOrders = [...merged];
  saveCachedOrders(merged);
  return merged;
};

exports.getMergedMemoryOrders = getMergedMemoryOrders;
exports.saveCachedOrders = saveCachedOrders;
exports.readCachedOrders = readCachedOrders;

// Helper to update an order across MongoDB, memory store, and disk cache
const updateOrderStatusInStore = async (searchId, newStatus, req) => {
  const cleanKey = String(searchId || '').trim().replace(/^ORD-/, '');
  const now = new Date();

  let updatedOrderData = null;
  let previousStatus = null;

  // 1. Try updating in MongoDB if available
  if (mongoose.connection.readyState === 1) {
    try {
      const order = await Order.findOne(buildOrderQuery(searchId)).catch(() => null);
      if (order) {
        previousStatus = order.orderStatus;
        order.orderStatus = newStatus;
        order.updatedAt = now;
        order.statusTimeline = order.statusTimeline || [];
        order.statusTimeline.push({ status: newStatus, updatedAt: now });

        if (newStatus === 'Delivered') {
          order.isDelivered = true;
          order.deliveredAt = now;
          if (order.paymentMethod === 'COD') {
            order.isPaid = true;
            order.paidAt = now;
          }
        } else if (newStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
          for (const item of (order.orderItems || [])) {
            if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
              const product = await Product.findById(item.product).catch(() => null);
              if (product) {
                product.stock += (item.qty || 1);
                if (product.soldCount >= (item.qty || 1)) {
                  product.soldCount -= (item.qty || 1);
                }
                if (product.stock > 0) product.isAvailable = true;
                await product.save().catch(() => {});
              }
            }
          }
        }

        const saved = await order.save();
        updatedOrderData = saved.toObject ? saved.toObject() : saved;
      }
    } catch (e) {
      console.warn('MongoDB order update warning:', e.message);
    }
  }

  // 2. Read file cache and update in file cache
  const cachedOrders = readCachedOrders();
  let foundInCache = false;
  const updatedCacheOrders = cachedOrders.map(o => {
    const oId = String(o._id || '');
    const oOrdId = String(o.orderId || '');
    const oClean = oOrdId.replace(/^ORD-/, '');
    const isMatch = oId === String(searchId) || oOrdId === String(searchId) || (oClean && oClean === cleanKey);
    if (isMatch) {
      foundInCache = true;
      if (!previousStatus) previousStatus = o.orderStatus;
      const timeline = Array.isArray(o.statusTimeline) ? [...o.statusTimeline] : [];
      timeline.push({ status: newStatus, updatedAt: now });
      const updated = {
        ...o,
        orderStatus: newStatus,
        updatedAt: now,
        statusTimeline: timeline
      };
      if (newStatus === 'Delivered') {
        updated.isDelivered = true;
        updated.deliveredAt = now;
        if (updated.paymentMethod === 'COD') {
          updated.isPaid = true;
          updated.paidAt = now;
        }
      }
      if (!updatedOrderData) updatedOrderData = updated;
      return updated;
    }
    return o;
  });

  // 3. Update in memoryOrders array
  let foundInMem = false;
  for (let i = 0; i < memoryOrders.length; i++) {
    const o = memoryOrders[i];
    const oId = String(o._id || '');
    const oOrdId = String(o.orderId || '');
    const oClean = oOrdId.replace(/^ORD-/, '');
    if (oId === String(searchId) || oOrdId === String(searchId) || (oClean && oClean === cleanKey)) {
      foundInMem = true;
      if (!previousStatus) previousStatus = o.orderStatus;
      const timeline = Array.isArray(o.statusTimeline) ? [...o.statusTimeline] : [];
      timeline.push({ status: newStatus, updatedAt: now });
      memoryOrders[i] = {
        ...o,
        orderStatus: newStatus,
        updatedAt: now,
        statusTimeline: timeline
      };
      if (newStatus === 'Delivered') {
        memoryOrders[i].isDelivered = true;
        memoryOrders[i].deliveredAt = now;
        if (memoryOrders[i].paymentMethod === 'COD') {
          memoryOrders[i].isPaid = true;
          memoryOrders[i].paidAt = now;
        }
      }
      if (!updatedOrderData) updatedOrderData = memoryOrders[i];
      break;
    }
  }

  // If order was in DB or elsewhere, make sure it is in both memory and cache
  if (updatedOrderData) {
    if (!foundInMem) {
      memoryOrders.unshift(updatedOrderData);
    }
    if (!foundInCache) {
      updatedCacheOrders.unshift(updatedOrderData);
    }
    saveCachedOrders(updatedCacheOrders);
    global.memoryOrders = [...memoryOrders];
  }

  // 4. Emit Socket.IO event and trigger email notification
  if (updatedOrderData) {
    const io = req?.app?.get ? req.app.get('io') : null;
    if (io) {
      io.emit('order:updated', updatedOrderData);
    }

    sendOrderStatusUpdateEmail(updatedOrderData, previousStatus || 'Pending', newStatus).catch(err =>
      console.error('Status update email notification error:', err.message)
    );
  }

  return updatedOrderData;
};

exports.updateOrderStatusInStore = updateOrderStatusInStore;

// @desc Sync order from client or serverless lambda
// @route POST /api/orders/sync
exports.syncOrderCache = async (req, res) => {
  try {
    const bodyData = req.body;
    const ordersToSync = Array.isArray(bodyData) ? bodyData : (bodyData ? [bodyData] : []);

    if (ordersToSync.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const io = req.app.get('io');
    const syncedOrders = [];

    const cachedOrders = readCachedOrders();

    for (const orderData of ordersToSync) {
      if (!orderData || (!orderData._id && !orderData.orderId)) continue;

      const rawId = String(orderData.orderId || orderData._id);
      const cleanKey = rawId.replace(/^ORD-/, '');
      
      const existingIdx = memoryOrders.findIndex(o => 
        String(o._id) === String(orderData._id) || 
        String(o.orderId) === String(orderData.orderId) ||
        (o.orderId && String(o.orderId).replace(/^ORD-/, '') === cleanKey)
      );

      const existingInCache = cachedOrders.find(o =>
        String(o._id) === String(orderData._id) || 
        String(o.orderId) === String(orderData.orderId) ||
        (o.orderId && String(o.orderId).replace(/^ORD-/, '') === cleanKey)
      );

      const existing = existingIdx >= 0 ? memoryOrders[existingIdx] : existingInCache;

      if (existing) {
        const statusHierarchy = ['Pending', 'Confirmed', 'Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        const existingRank = statusHierarchy.indexOf(existing.orderStatus);
        const newRank = statusHierarchy.indexOf(orderData.orderStatus);
        // Do not allow stale client sync to downgrade status from Processing/Shipped/Delivered
        const keptStatus = (existingRank >= newRank && existingRank !== -1) ? existing.orderStatus : (orderData.orderStatus || existing.orderStatus);
        const updated = { ...existing, ...orderData, orderStatus: keptStatus };
        if (existingIdx >= 0) {
          memoryOrders[existingIdx] = updated;
        } else {
          memoryOrders.unshift(updated);
        }
      } else {
        memoryOrders.unshift(orderData);
      }

      // Persist to MongoDB if connection is ready and order isn't in DB yet
      if (mongoose.connection.readyState === 1) {
        try {
          const searchId = orderData.orderId || orderData._id;
          const exists = await Order.findOne(buildOrderQuery(searchId)).catch(() => null);

          if (!exists) {
            const sanitizedOrderItems = (orderData.orderItems || []).map(item => ({
              ...item,
              product: (item.product && mongoose.Types.ObjectId.isValid(item.product))
                ? item.product
                : new mongoose.Types.ObjectId()
            }));

            const userId = (orderData.user && mongoose.Types.ObjectId.isValid(orderData.user))
              ? orderData.user
              : (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id))
                ? req.user._id
                : new mongoose.Types.ObjectId();

            const formattedOrderId = orderData.orderId
              ? (orderData.orderId.startsWith('ORD-') ? orderData.orderId : `ORD-${orderData.orderId}`)
              : `ORD-${cleanKey || Math.floor(100000 + Math.random() * 900000)}`;

            const newOrder = new Order({
              _id: (orderData._id && mongoose.Types.ObjectId.isValid(orderData._id)) ? orderData._id : new mongoose.Types.ObjectId(),
              orderId: formattedOrderId,
              user: userId,
              orderItems: sanitizedOrderItems,
              shippingAddress: orderData.shippingAddress || {},
              paymentMethod: orderData.paymentMethod || 'COD',
              itemsPrice: orderData.itemsPrice || orderData.totalPrice || 0,
              taxPrice: orderData.taxPrice || 0,
              shippingPrice: orderData.shippingPrice || 0,
              totalPrice: orderData.totalPrice || 0,
              isPaid: orderData.isPaid || false,
              paidAt: orderData.paidAt || null,
              orderStatus: orderData.orderStatus || 'Pending',
              statusTimeline: orderData.statusTimeline || [{ status: orderData.orderStatus || 'Pending', updatedAt: new Date() }],
              createdAt: orderData.createdAt || new Date()
            });
            await newOrder.save().catch((err) => console.warn('Sync order save err:', err.message));
          }
        } catch (e) {
          console.warn('Sync order DB save warning:', e.message);
        }
      }

      syncedOrders.push(orderData);
    }

    getMergedMemoryOrders();
    return res.json({ success: true, count: syncedOrders.length, orders: syncedOrders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc Create new order
// @route POST /api/orders
exports.addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Preserve exact product IDs and names
    const sanitizedOrderItems = orderItems.map(item => ({
      ...item,
      product: item.product || new mongoose.Types.ObjectId().toString()
    }));

    const userId = req.user?._id || req.body.user || 'usr_guest';

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const safeShippingAddress = {
      ...(shippingAddress || {}),
      email: shippingAddress?.email || req.user?.email || ''
    };

    const order = new Order({
      orderId,
      user: userId,
      orderItems: sanitizedOrderItems,
      shippingAddress: safeShippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice,
      isPaid: paymentMethod !== 'COD',
      paidAt: paymentMethod !== 'COD' ? Date.now() : null,
      orderStatus: 'Pending',
      statusTimeline: [{ status: 'Pending', updatedAt: Date.now() }]
    });

    let createdOrder = null;
    if (mongoose.connection.readyState === 1) {
      createdOrder = await order.save().catch((err) => {
        console.warn('DB order save fallback:', err.message);
        return null;
      });
    }

    const io = req.app.get('io');

    if (createdOrder) {
      // Auto-decrement stock for ordered items
      for (const item of sanitizedOrderItems) {
        if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
          const product = await Product.findById(item.product).catch(() => null);
          if (product) {
            const qty = item.qty || 1;
            product.stock = Math.max(0, product.stock - qty);
            product.soldCount = (product.soldCount || 0) + qty;
            if (product.stock === 0) {
              product.isAvailable = false;
            }
            await product.save().catch(() => {});
          }
        }
      }

      const plainOrder = createdOrder.toObject ? createdOrder.toObject() : createdOrder;
      plainOrder.userEmail = safeShippingAddress.email || req.user?.email;
      memoryOrders.unshift(plainOrder);
      getMergedMemoryOrders();

      // Emit Socket.IO notification to admin clients
      if (io) {
        io.emit('order:created', plainOrder);
      }

      // Trigger email notification safely
      try {
        await Promise.race([
          sendOrderNotificationEmail(plainOrder),
          new Promise(resolve => setTimeout(resolve, 3500))
        ]);
      } catch (e) {
        console.error('Order notification warning:', e.message);
      }

      return res.status(201).json(plainOrder);
    }

    // Fallback response if MongoDB is offline / unconfigured
    const mockOrder = {
      _id: new mongoose.Types.ObjectId().toString(),
      orderId,
      user: userId,
      userEmail: safeShippingAddress.email || req.user?.email,
      orderItems: sanitizedOrderItems,
      shippingAddress: safeShippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice,
      isPaid: paymentMethod !== 'COD',
      paidAt: paymentMethod !== 'COD' ? new Date() : null,
      orderStatus: 'Pending',
      statusTimeline: [{ status: 'Pending', updatedAt: new Date() }],
      createdAt: new Date()
    };
    memoryOrders.unshift(mockOrder);
    getMergedMemoryOrders();

    if (io) {
      io.emit('order:created', mockOrder);
    }

    // Trigger email notification safely
    try {
      await Promise.race([
        sendOrderNotificationEmail(mockOrder),
        new Promise(resolve => setTimeout(resolve, 3500))
      ]);
    } catch (e) {
      console.error('Order notification warning:', e.message);
    }

    return res.status(201).json(mockOrder);
  } catch (error) {
    console.error('addOrderItems error:', error);
    const fallbackId = new mongoose.Types.ObjectId().toString();
    const fallbackOrder = {
      _id: fallbackId,
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      user: req.user?._id || 'usr_demo',
      orderItems: req.body?.orderItems || [],
      shippingAddress: req.body?.shippingAddress || {},
      paymentMethod: req.body?.paymentMethod || 'COD',
      itemsPrice: req.body?.itemsPrice || 0,
      totalPrice: req.body?.totalPrice || 0,
      isPaid: req.body?.paymentMethod !== 'COD',
      orderStatus: 'Pending',
      statusTimeline: [{ status: 'Pending', updatedAt: new Date() }],
      createdAt: new Date()
    };
    memoryOrders.unshift(fallbackOrder);
    getMergedMemoryOrders();

    const io = req.app.get('io');
    if (io) {
      io.emit('order:created', fallbackOrder);
    }

    // Trigger email notification asynchronously
    sendOrderNotificationEmail(fallbackOrder).catch(err => console.error('Email notification error:', err));

    return res.status(201).json(fallbackOrder);
  }
};

// Helper to safely build MongoDB $or query for order lookup by _id or orderId
const buildOrderQuery = (searchId) => {
  if (!searchId) return {};
  const rawId = String(searchId).trim();
  const cleanId = rawId.replace(/^ORD-/, '');
  const withPrefix = `ORD-${cleanId}`;

  const orConditions = [
    { orderId: rawId },
    { orderId: withPrefix },
    { orderId: { $regex: new RegExp(`^ORD-${cleanId}$`, 'i') } }
  ];

  if (mongoose.Types.ObjectId.isValid(rawId)) {
    orConditions.push({ _id: rawId });
  }

  return { $or: orConditions };
};

// @desc Get order by ID
// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  const searchId = req.params.id;
  try {
    let dbOrder = null;
    if (mongoose.connection.readyState === 1) {
      dbOrder = await Order.findOne(buildOrderQuery(searchId)).populate('user', 'name email').catch(() => null);
    }

    if (dbOrder) {
      return res.json(dbOrder);
    }
  } catch (error) {}

  const allMem = getMergedMemoryOrders();
  const cleanKey = String(searchId).replace(/^ORD-/, '');
  const memOrder = allMem.find(o => 
    String(o._id) === String(searchId) || 
    String(o.orderId) === String(searchId) ||
    (o.orderId && String(o.orderId).replace(/^ORD-/, '') === cleanKey)
  );
  if (memOrder) {
    return res.json(memOrder);
  }

  return res.status(404).json({ message: 'Order not found' });
};

// @desc Get logged in user orders
// @route GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
  try {
    let userOrders = [];
    const userId = req.user?._id ? String(req.user._id) : null;
    const userEmail = req.user?.email ? String(req.user.email).toLowerCase() : null;

    if (mongoose.connection.readyState === 1) {
      const queries = [];
      if (userId) queries.push({ user: userId });
      if (userId && mongoose.Types.ObjectId.isValid(userId)) queries.push({ user: new mongoose.Types.ObjectId(userId) });
      if (userEmail) {
        queries.push({ 'shippingAddress.email': userEmail });
        queries.push({ userEmail: userEmail });
      }

      if (queries.length > 0) {
        userOrders = await Order.find({ $or: queries }).lean().sort('-createdAt').maxTimeMS(2500).catch(() => []);
      }

      if (!userOrders || userOrders.length === 0) {
        userOrders = await Order.find({}).lean().sort('-createdAt').limit(50).maxTimeMS(2500).catch(() => []);
      }
    }

    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);

    // Map to hold merged latest state of orders
    const orderMap = new Map();
    [...userOrders, ...allMem].forEach(o => {
      if (!o) return;
      const rawKey = String(o.orderId || o._id || '');
      const key = rawKey.replace(/^ORD-/, '');
      if (!key) return;

      if (!orderMap.has(key)) {
        orderMap.set(key, o);
      } else {
        const existing = orderMap.get(key);
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const newTime = new Date(o.updatedAt || o.createdAt || 0).getTime();

        if (newTime > existingTime) {
          orderMap.set(key, { ...existing, ...o, orderStatus: o.orderStatus || existing.orderStatus });
        } else if (existingTime > newTime) {
          orderMap.set(key, { ...o, ...existing, orderStatus: existing.orderStatus || o.orderStatus });
        } else {
          const bestStatus = resolveBestStatus(existing.orderStatus, o.orderStatus);
          orderMap.set(key, { ...existing, ...o, orderStatus: bestStatus });
        }
      }
    });

    const combinedOrders = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json(combinedOrders);
  } catch (error) {
    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    return res.json(allMem);
  }
};

// @desc Get all orders (Admin)
// @route GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    let dbOrders = [];
    if (mongoose.connection.readyState === 1) {
      dbOrders = await Order.find().lean().populate('user', 'id name email phone').sort('-createdAt').maxTimeMS(2500).catch(() => []);
    }

    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    const orderMap = new Map();

    [...dbOrders, ...allMem].forEach(o => {
      if (!o) return;
      const rawId = String(o._id || '');
      const rawOrderId = String(o.orderId || '');
      const cleanKey = (rawOrderId || rawId).replace(/^ORD-/, '');
      if (!cleanKey && !rawId) return;

      const key = cleanKey || rawId;

      if (!orderMap.has(key)) {
        orderMap.set(key, o);
      } else {
        const existing = orderMap.get(key);
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const newTime = new Date(o.updatedAt || o.createdAt || 0).getTime();

        if (newTime > existingTime) {
          orderMap.set(key, { ...existing, ...o, orderStatus: o.orderStatus || existing.orderStatus });
        } else if (existingTime > newTime) {
          orderMap.set(key, { ...o, ...existing, orderStatus: existing.orderStatus || o.orderStatus });
        } else {
          const bestStatus = resolveBestStatus(existing.orderStatus, o.orderStatus);
          orderMap.set(key, { ...existing, ...o, orderStatus: bestStatus });
        }
      }
    });

    const combined = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json(combined);
  } catch (error) {
    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    res.json(allMem);
  }
};

// @desc Update order status (Admin)
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, status } = req.body;
    const newStatus = orderStatus || status;
    const searchId = req.params.id;

    if (!newStatus) {
      return res.status(400).json({ message: 'Order status is required' });
    }

    const updated = await updateOrderStatusInStore(searchId, newStatus, req);
    if (updated) {
      return res.json(updated);
    }

    return res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
