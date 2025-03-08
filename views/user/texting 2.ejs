const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderedItems: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
        enum: [
          'Pending',
          'Processing',
          'Shipped',
          'Delivered',
          'Cancelled',
          'Return Request',
          'Returned',
        ],
        default: 'Pending',
      },
    },
  ],
  address: {
    type: Schema.Types.Mixed,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'WALLET', 'RAZORPAY'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  paymentId: {
    type: String,
    default: null,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Pending',
      'Payment Pending',
      'Placed',
      'Shipped',
      'Delivered',
      'Cancelled',
      'Payment Failed',
      'Return Requested', // Added for return process
      'Return Approved',  // Added for approved returns
      'Return Rejected',  // Added for rejected returns
    ],
    default: 'Pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: { // Added to track when the order was delivered
    type: Date,
    default: null,
  },
  returnReason: { // Reason provided by the user for return
    type: String,
    default: null,
  },
  returnRequestedAt: { // Timestamp of return request
    type: Date,
    default: null,
  },
  returnProcessedAt: { // Timestamp when return was approved/rejected
    type: Date,
    default: null,
  },
  couponApplied: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;