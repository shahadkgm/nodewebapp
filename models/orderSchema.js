const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid'); // UUID generator
const Product = require('./productSchema');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Ensure every order is linked to a user
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
        default: 0,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    default: 0,
  },
  address: {
    type: Schema.Types.Mixed, // Allow either a string or an object
    required: true, // Ensure an address is always provided
  },
  invoiceDate: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    enum: [ 'WALLET','RAZORPAY','COD'],
    required: false,
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
  createOn: {
    type: Date,
    default: Date.now,
    required: true,
  },
  couponApplied: {
    type: Boolean,
    default: false,
  },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
