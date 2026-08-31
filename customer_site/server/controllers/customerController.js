const User = require('../models/User');
const Order = require('../models/Order');

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

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Calculate customer metrics (total orders & spend)
    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        const userOrders = await Order.find({ user: user._id, orderStatus: { $ne: 'Cancelled' } });
        const totalOrders = userOrders.length;
        const totalSpend = userOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        return {
          ...user.toObject(),
          totalOrders,
          totalSpend
        };
      })
    );

    res.json({
      customers: customersWithStats,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get customer detail with order history
// @route GET /api/admin/customers/:id
exports.getAdminCustomerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Order.find({ user: req.user?._id || req.params.id }).sort('-createdAt');
    const totalSpend = orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({
      customer: user,
      orders,
      totalOrders: orders.length,
      totalSpend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
