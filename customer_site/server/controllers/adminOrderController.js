const Order = require('../models/Order');
const Product = require('../models/Product');
const { memoryOrders, getMergedMemoryOrders } = require('./orderController');

// Helper to notify connected WebSocket clients about order updates
const emitOrderEvent = (req, eventName, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, data);
  }
};

// @desc Get all orders for Admin with filters (status, search, date range, pagination)
// @route GET /api/admin/orders
exports.getAdminOrders = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      if (status === 'Confirmed') {
        query.orderStatus = { $in: ['Confirmed', 'Order Confirmed'] };
      } else if (status === 'Shipped') {
        query.orderStatus = { $in: ['Shipped', 'Out for Delivery'] };
      } else {
        query.orderStatus = status;
      }
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let dbOrders = [];
    try {
      dbOrders = await Order.find(query)
        .populate('user', 'name email phone')
        .sort('-createdAt');
    } catch (e) {
      console.warn('DB find orders fallback:', e.message);
    }

    // Combine dbOrders and memoryOrders, eliminating duplicate IDs
    const allMem = getMergedMemoryOrders ? getMergedMemoryOrders() : (memoryOrders || []);
    const dbOrderIds = new Set(dbOrders.map(o => String(o._id)));
    const filteredMemOrders = allMem.filter(mo => {
      if (dbOrderIds.has(String(mo._id))) return false;
      if (status && status !== 'All') {
        if (status === 'Confirmed' && !(mo.orderStatus === 'Confirmed' || mo.orderStatus === 'Order Confirmed')) return false;
        if (status === 'Shipped' && !(mo.orderStatus === 'Shipped' || mo.orderStatus === 'Out for Delivery')) return false;
        if (status !== 'Confirmed' && status !== 'Shipped' && mo.orderStatus !== status) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        const matchId = String(mo.orderId || mo._id).toLowerCase().includes(s);
        const matchName = String(mo.shippingAddress?.fullName || '').toLowerCase().includes(s);
        const matchPhone = String(mo.shippingAddress?.phone || '').toLowerCase().includes(s);
        if (!matchId && !matchName && !matchPhone) return false;
      }
      return true;
    });

    const allOrders = [...dbOrders, ...filteredMemOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = allOrders.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedOrders = allOrders.slice(startIndex, startIndex + Number(limit));

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
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name price thumbnail sku stock')
      .catch(() => null);

    if (order) {
      return res.json(order);
    }
  } catch (error) {}

  const memOrder = (memoryOrders || []).find(o => String(o._id) === String(req.params.id));
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
    let order = await Order.findById(req.params.id).catch(() => null);

    if (order) {
      const previousStatus = order.orderStatus;
      order.orderStatus = status;
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
        for (const item of order.orderItems) {
          if (item.product) {
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
      const memOrder = (memoryOrders || []).find(o => String(o._id) === String(req.params.id));
      if (memOrder) {
        memOrder.orderStatus = status;
        memOrder.statusTimeline = memOrder.statusTimeline || [];
        memOrder.statusTimeline.push({ status, updatedAt: new Date() });
      }
      emitOrderEvent(req, 'order:updated', updatedOrder);
      return res.json(updatedOrder);
    }

    // Memory order fallback
    const memOrder = (memoryOrders || []).find(o => String(o._id) === String(req.params.id));
    if (memOrder) {
      memOrder.orderStatus = status;
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
      emitOrderEvent(req, 'order:updated', memOrder);
      return res.json(memOrder);
    }

    return res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
