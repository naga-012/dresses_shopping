const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const orderSchema = new mongoose.Schema({
  orderId: { type: String, default: () => 'ORD-' + Math.floor(100000 + Math.random() * 900000) },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    size: String,
    color: String,
    qty: { type: Number, required: true }
  }],
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String
  },
  paymentMethod: { type: String, enum: ['UPI', 'Credit Card', 'Debit Card', 'COD'], required: true },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  statusTimeline: [{
    status: String,
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true, bufferCommands: false, autoIndex: false, autoCreate: false });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
