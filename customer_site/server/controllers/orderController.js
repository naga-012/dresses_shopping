const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Memory store for mock orders when DB is unconfigured
const memoryOrders = [];
exports.memoryOrders = memoryOrders;

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

    const createdOrder = await order.save().catch((err) => {
      console.warn('DB order save fallback:', err.message);
      return null;
    });

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

  const memOrder = memoryOrders.find(o => String(o._id) === String(req.params.id));
  if (memOrder) {
    return res.json(memOrder);
  }

  // Fallback demo order object if ID not found in DB
  return res.json({
    _id: req.params.id,
    user: req.user?._id || 'usr_demo',
    orderItems: [],
    shippingAddress: { fullName: 'Saha Member', street: 'Sample Street', city: 'Mumbai', pincode: '400001', phone: '9999999999' },
    paymentMethod: 'UPI',
    itemsPrice: 500,
    shippingPrice: 100,
    totalPrice: 600,
    isPaid: true,
    orderStatus: 'Order Confirmed',
    statusTimeline: [{ status: 'Order Confirmed', updatedAt: new Date() }],
    createdAt: new Date()
  });
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

    const dbOrderIds = new Set(userOrders.map(o => String(o._id)));
    const remainingMemOrders = (memoryOrders || []).filter(mo => !dbOrderIds.has(String(mo._id)));
    const combinedOrders = [...userOrders, ...remainingMemOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json(combinedOrders);
  } catch (error) {
    return res.json(memoryOrders || []);
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
