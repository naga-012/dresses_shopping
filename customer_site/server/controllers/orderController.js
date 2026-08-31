const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');

// Memory store for mock orders when DB is unconfigured
if (!global.memoryOrders) {
  global.memoryOrders = [];
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

const getMergedMemoryOrders = () => {
  const fileOrders = readCachedOrders();
  const map = new Map();
  [...memoryOrders, ...fileOrders].forEach(o => {
    if (o && (o._id || o.orderId)) {
      const key = String(o._id || o.orderId);
      if (!map.has(key) || new Date(o.updatedAt || o.createdAt || 0) > new Date(map.get(key).updatedAt || map.get(key).createdAt || 0)) {
        map.set(key, o);
      }
    }
  });
  const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  saveCachedOrders(merged);
  return merged;
};

exports.getMergedMemoryOrders = getMergedMemoryOrders;

// @desc Sync order from client or serverless lambda
// @route POST /api/orders/sync
exports.syncOrderCache = async (req, res) => {
  try {
    const orderData = req.body;
    if (orderData && (orderData._id || orderData.orderId)) {
      const existingIdx = memoryOrders.findIndex(o => String(o._id) === String(orderData._id) || String(o.orderId) === String(orderData.orderId));
      if (existingIdx >= 0) {
        memoryOrders[existingIdx] = { ...memoryOrders[existingIdx], ...orderData };
      } else {
        memoryOrders.unshift(orderData);
      }
      getMergedMemoryOrders();
      return res.json({ success: true, order: orderData });
    }
    return res.status(400).json({ message: 'Invalid order data' });
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

    // Sanitize order items so product IDs are valid Mongoose ObjectIds
    const sanitizedOrderItems = orderItems.map(item => ({
      ...item,
      product: (item.product && mongoose.Types.ObjectId.isValid(item.product))
        ? item.product
        : new mongoose.Types.ObjectId()
    }));

    const userId = (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id))
      ? req.user._id
      : new mongoose.Types.ObjectId();

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const order = new Order({
      orderId,
      user: userId,
      orderItems: sanitizedOrderItems,
      shippingAddress,
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
    if (mongoose.connection.readyState >= 1) {
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

      memoryOrders.unshift(createdOrder);
      getMergedMemoryOrders();

      // Emit Socket.IO notification to admin clients
      if (io) {
        io.emit('order:created', createdOrder);
      }

      return res.status(201).json(createdOrder);
    }

    // Fallback response if MongoDB is offline / unconfigured
    const mockOrder = {
      _id: new mongoose.Types.ObjectId().toString(),
      orderId,
      user: userId,
      orderItems: sanitizedOrderItems,
      shippingAddress,
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

    return res.status(201).json(fallbackOrder);
  }
};

// @desc Get order by ID
// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const order = await Order.findById(req.params.id).populate('user', 'name email').catch(() => null);
      if (order) {
        return res.json(order);
      }
    }
  } catch (error) {}

  const allMem = getMergedMemoryOrders();
  const memOrder = allMem.find(o => String(o._id) === String(req.params.id) || String(o.orderId) === String(req.params.id));
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
    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      userOrders = await Order.find({ user: req.user._id }).sort('-createdAt').catch(() => []);
    }

    if (!userOrders || userOrders.length === 0) {
      userOrders = await Order.find({}).sort('-createdAt').limit(20).catch(() => []);
    }

    const allMem = getMergedMemoryOrders();
    const dbOrderIds = new Set(userOrders.map(o => String(o._id)));
    const remainingMemOrders = allMem.filter(mo => !dbOrderIds.has(String(mo._id)));
    const combinedOrders = [...userOrders, ...remainingMemOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json(combinedOrders);
  } catch (error) {
    return res.json(getMergedMemoryOrders());
  }
};

// @desc Get all orders (Admin)
// @route GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'id name email').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update order status (Admin)
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = orderStatus;
      order.statusTimeline.push({ status: orderStatus, updatedAt: Date.now() });

      if (orderStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        if (order.paymentMethod === 'COD') {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
