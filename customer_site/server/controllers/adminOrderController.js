const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { memoryOrders, getMergedMemoryOrders } = require('./orderController');

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

// Helper to notify connected WebSocket clients about order updates
const emitOrderEvent = (req, eventName, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, data);
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

// @desc Get all orders for Admin with filters (status, search, date range, pagination)
// @route GET /api/admin/orders
exports.getAdminOrders = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 50 } = req.query;

    let dbOrders = [];
    try {
      if (mongoose.connection.readyState === 1) {
        dbOrders = await Order.find({})
          .lean()
          .populate('user', 'name email phone')
          .sort('-createdAt')
          .maxTimeMS(3000)
          .catch(() => []);
      }
    } catch (e) {
      console.warn('DB find orders fallback:', e.message);
    }

    // Combine dbOrders and memoryOrders seamlessly, preserving updated status by latest timestamp
    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    const orderMap = new Map();

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const nowTime = Date.now();

    [...dbOrders, ...allMem].forEach(o => {
      if (!o) return;

      // Filter out orders older than 30 days from admin site
      const createdAtTime = new Date(o.createdAt || 0).getTime();
      if (createdAtTime > 0 && (nowTime - createdAtTime) > THIRTY_DAYS_MS) {
        return;
      }

      const rawId = String(o._id || '');
      const rawOrderId = String(o.orderId || '');
      const cleanKey = (rawOrderId || rawId).replace(/^ORD-/, '');
      if (!cleanKey && !rawId) return;

      const key = cleanKey || rawId;

      // Filter by status if specified
      if (status && status !== 'All') {
        const matchConfirmed = status === 'Confirmed' && (o.orderStatus === 'Confirmed' || o.orderStatus === 'Order Confirmed');
        const matchShipped = status === 'Shipped' && (o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery');
        const matchOther = status !== 'Confirmed' && status !== 'Shipped' && String(o.orderStatus || '').toLowerCase() === String(status).toLowerCase();
        if (!matchConfirmed && !matchShipped && !matchOther) return;
      }

      // Filter by search if specified
      if (search) {
        const s = search.toLowerCase();
        const matchId = String(o.orderId || o._id || '').toLowerCase().includes(s);
        const matchName = String(o.shippingAddress?.fullName || o.user?.name || '').toLowerCase().includes(s);
        const matchPhone = String(o.shippingAddress?.phone || o.user?.phone || '').toLowerCase().includes(s);
        const matchEmail = String(o.shippingAddress?.email || o.user?.email || '').toLowerCase().includes(s);
        if (!matchId && !matchName && !matchPhone && !matchEmail) return;
      }

      // Filter by date range if specified
      if (startDate || endDate) {
        const orderTime = new Date(o.createdAt || 0).getTime();
        if (startDate && orderTime < new Date(startDate).getTime()) return;
        if (endDate && orderTime > new Date(endDate).getTime()) return;
      }

      if (!orderMap.has(key)) {
        orderMap.set(key, o);
      } else {
        const existing = orderMap.get(key);
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const newTime = new Date(o.updatedAt || o.createdAt || 0).getTime();
        const bestStatus = resolveBestStatus(existing.orderStatus, o.orderStatus);

        if (newTime > existingTime) {
          orderMap.set(key, { ...existing, ...o, orderStatus: bestStatus });
        } else {
          orderMap.set(key, { ...o, ...existing, orderStatus: bestStatus });
        }
      }
    });

    const combinedOrders = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const total = combinedOrders.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedOrders = combinedOrders.slice(startIndex, startIndex + Number(limit));

    return res.json({
      orders: paginatedOrders,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      total
    });
  } catch (error) {
    const mem = memoryOrders || [];
    return res.json({
      orders: mem,
      page: 1,
      pages: 1,
      total: mem.length
    });
  }
};

// @desc Get single order by ID
// @route GET /api/admin/orders/:id
exports.getAdminOrderById = async (req, res) => {
  try {
    const searchId = req.params.id;
    let order = null;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findOne(buildOrderQuery(searchId))
        .populate('user', 'name email phone')
        .populate('orderItems.product', 'name price thumbnail sku stock')
        .catch(() => null);
    }

    if (order) {
      return res.json(order);
    }
  } catch (error) {}

  const memOrder = (memoryOrders || []).find(o => 
    String(o._id) === String(req.params.id) || 
    String(o.orderId) === String(req.params.id) ||
    (o.orderId && o.orderId.replace(/^ORD-/, '') === String(req.params.id).replace(/^ORD-/, ''))
  );
  if (memOrder) {
    return res.json(memOrder);
  }

  return res.status(404).json({ message: 'Order not found' });
};

// @desc Update order status
// @route PATCH /api/admin/orders/:id/status
exports.updateAdminOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const searchId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    let order = null;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findOne(buildOrderQuery(searchId)).catch(() => null);
    }

    if (order) {
      const previousStatus = order.orderStatus;
      order.orderStatus = status;
      order.updatedAt = new Date();
      order.statusTimeline = order.statusTimeline || [];
      order.statusTimeline.push({
        status,
        updatedAt: new Date()
      });

      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'COD') {
          order.isPaid = true;
          order.paidAt = new Date();
        }
      } else if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
        for (const item of (order.orderItems || [])) {
          if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
            const product = await Product.findById(item.product).catch(() => null);
            if (product) {
              product.stock += (item.qty || 1);
              if (product.soldCount >= (item.qty || 1)) {
                product.soldCount -= (item.qty || 1);
              }
              if (product.stock > 0) {
                product.isAvailable = true;
              }
              await product.save().catch(() => {});
            }
          }
        }
      }

      const updatedOrder = await order.save();

      // Sync memoryOrders store & cached file
      const cleanKey = searchId.replace(/^ORD-/, '');
      const memOrder = (memoryOrders || []).find(o => 
        String(o._id) === searchId || 
        String(o.orderId) === searchId ||
        (o.orderId && o.orderId.replace(/^ORD-/, '') === cleanKey)
      );
      if (memOrder) {
        memOrder.orderStatus = status;
        memOrder.updatedAt = new Date();
        memOrder.statusTimeline = memOrder.statusTimeline || [];
        memOrder.statusTimeline.push({ status, updatedAt: new Date() });
      }
      if (getMergedMemoryOrders) {
        getMergedMemoryOrders();
      }

      emitOrderEvent(req, 'order:updated', updatedOrder);
      return res.json(updatedOrder);
    }

    // Memory order fallback
    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    const cleanKey = searchId.replace(/^ORD-/, '');
    const memOrder = allMem.find(o => 
      String(o._id) === searchId || 
      String(o.orderId) === searchId ||
      (o.orderId && o.orderId.replace(/^ORD-/, '') === cleanKey)
    );

    if (memOrder) {
      memOrder.orderStatus = status;
      memOrder.updatedAt = new Date();
      memOrder.statusTimeline = memOrder.statusTimeline || [];
      memOrder.statusTimeline.push({ status, updatedAt: new Date() });
      if (status === 'Delivered') {
        memOrder.isDelivered = true;
        memOrder.deliveredAt = new Date();
        if (memOrder.paymentMethod === 'COD') {
          memOrder.isPaid = true;
          memOrder.paidAt = new Date();
        }
      }
      if (getMergedMemoryOrders) {
        getMergedMemoryOrders();
      }
      emitOrderEvent(req, 'order:updated', memOrder);
      return res.json(memOrder);
    }

    return res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    console.error('updateAdminOrderStatus error:', error);
    res.status(400).json({ message: error.message });
  }
};
