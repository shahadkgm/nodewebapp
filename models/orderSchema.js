const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
     default: () => `ordr${uuidv4()}`,
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
      'Return Requested', 
      'Return Approved',  
      'Return Rejected',  
    ],
    default: 'Pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: { 
    type: Date,
    default: null,
  },
  returnReason: { 
    type: String,
    default: null,
  },
  returnRequestedAt: { 
    type: Date,
    default: null,
  },
  returnProcessedAt: { 
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