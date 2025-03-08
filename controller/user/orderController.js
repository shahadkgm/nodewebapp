const mongoose=require("mongoose");
const Cart=require("../../models/cartSchema");
const Address=require("../../models/addressSchema")
const Product=require("../../models/productSchema");
const Order=require("../../models/orderSchema");
const User=require("../../models/userschema")
const Coupon=require("../../models/couponSchema")
const Razorpay = require('razorpay');
const crypto = require('crypto');
  

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const loadCheckoutPage = async (req, res) => {
  try {
    const userId = req.session.user;
    if (!userId) throw new Error("User not authenticated");

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const user = await User.findById(userId);
    const userAddresses = await Address.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.render("checkout", { cart: [], totalAmount: 0, addresses: [], user, validCoupons: [] });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const validCoupons = await Coupon.find({
      islist: true,
      expireOn: { $gt: new Date() },
      $or: [{ userId: { $size: 0 } }, { userId: userId }]
    }).sort({ createdOn: -1 });

    req.session.finalAmount = totalAmount;

    res.render("checkout", {
      cart: cart.items,
      totalAmount,
      addresses: userAddresses ? userAddresses.address : [],
      user,
      validCoupons
    });
  } catch (error) {
    console.error("Error loading checkout page:", error);
    res.status(500).json({ success: false, message: "Error loading checkout page" });
  }
};

const processOrder = async (req, res) => {
  try {
    const { selectedAddress, paymentMethod, totalAmount: clientTotal } = req.body;
    const discount = req.session.discount || 0;
    const userId = req.session.user;

    if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    let parsedAddress = JSON.parse(selectedAddress);
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: "Cart is empty" });

    const insufficientStockItems = cart.items.filter(item => item.productId.quantity < item.quantity)
      .map(item => ({
        productName: item.productId.productName,
        availableStock: item.productId.quantity,
        requestedQuantity: item.quantity,
      }));

    if (insufficientStockItems.length > 0) {
      return res.status(400).json({ success: false, message: "Some items have insufficient stock", insufficientStockItems });
    }

    const totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalAmount = totalPrice - discount;

    const orderedItems = cart.items.map(item => ({
      product: item.productId._id,
      quantity: item.quantity,
      price: item.price,
    }));

    const order = new Order({
      userId,
      orderedItems,
      address: parsedAddress,
      paymentMethod,
      discount,
      totalPrice,
      finalAmount,
      status: paymentMethod === 'RAZORPAY' ? 'Payment Pending' : 'Pending',
      orderDate: new Date(),
      couponApplied: !!discount,
    });

    await order.save();

    if (paymentMethod === 'RAZORPAY') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: 'INR',
        receipt: order._id.toString(),
        payment_capture: 1,
      });
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
      await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 });
      return res.status(200).json({ success: true, message: "Order created, proceed to payment", orderId: razorpayOrder.id, finalAmount });
    } else if (paymentMethod === 'WALLET') {
      const user = await User.findById(userId);
      if (user.wallet < finalAmount) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
      }
      user.wallet -= finalAmount;
      const purchasedAmount= order.finalAmount || order.totalPrice;

      user.walletHistory.push({
        type: 'debit',
        amount: purchasedAmount,
        description: `purchased for order ${order._id}`
      });
      await user.save();
      for (const item of orderedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
      }
      await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 });
      return res.status(200).json({ success: true, message: "Order placed successfully with wallet", orderId: order._id });
    } else {
      for (const item of orderedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
      }
      await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 });
      return res.status(200).json({ success: true, message: "Order placed successfully", orderId: order._id });
    }
  } catch (error) {
    console.error("Error processing order:", error);
    return res.status(500).json({ success: false, message: "Error processing order", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.session.user;

    if (!process.env.RAZORPAY_SECRET) throw new Error("Razorpay secret not configured");

    const order = await Order.findOne({ razorpayOrderId: orderId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (expectedSignature === signature) {
      order.status = 'Placed';
      order.paymentId = paymentId;
      order.paymentStatus = 'Completed';
      for (const item of order.orderedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
      }
      await order.save();
      await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 });
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      order.status = 'Payment Failed';
      await order.save();
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ success: false, message: "Error verifying payment", error: error.message });
  }
};


const checkoutaddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;

    const namePattern = /^[A-Za-z\s]+$/;
    const pincodePattern = /^\d{6}$/;
    const phonePattern = /^\d{10}$/;

    if (!namePattern.test(name) || !namePattern.test(city) || !namePattern.test(landMark) || !namePattern.test(state)) {
      return res.status(400).json({ success: false, message: "Fields should contain alphabets only" });
    }
    if (!pincodePattern.test(pincode)) return res.status(400).json({ success: false, message: "Pincode must be 6 digits" });
    if (!phonePattern.test(phone) || (altPhone && !phonePattern.test(altPhone))) {
      return res.status(400).json({ success: false, message: "Phone numbers must be 10 digits" });
    }
    if (phone === altPhone && altPhone) {
      return res.status(400).json({ success: false, message: "Phone and alternate phone must be different" });
    }

    const userAddress = await Address.findOne({ userId });
    if (!userAddress) {
      const newAddress = new Address({
        userId,
        address: [{ addressType, name, city, landMark, state, pincode, phone, altPhone }]
      });
      await newAddress.save();
    } else {
      userAddress.address.push({ addressType, name, city, landMark, state, pincode, phone, altPhone });
      await userAddress.save();
    }
    res.status(200).json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ success: false, message: "Error adding address" });
  }
};





  const getOrders = async (req, res) => {
    try {
      const userId = req.session.user;
  
      const orders = await Order.find({ userId })
      .populate("orderedItems.product")
      .sort({ orderDate: -1 }) 
      .limit(1)
      
      res.render("orders", { orders,user:userId }); 
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("An error occurred while fetching your orders.");
    }
  };

  const cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.session.user;
  
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
  
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      const cancellableStatuses = ['Pending', 'Processing', 'Payment Pending', 'Placed'];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).json({ success: false, message: 'This order cannot be cancelled' });
      }
  
      for (const item of order.orderedItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
  
      if (order.paymentMethod === 'WALLET'||order.paymentMethod === 'RAZORPAY') {
        const user = await User.findById(userId);
        const refundAmount = order.finalAmount || order.totalPrice;
        user.wallet = (user.wallet || 0) + refundAmount;
        user.walletHistory.push({
          type: 'credit',
          amount: refundAmount,
          description: `Refund for order ${orderId}`
        });
        await user.save();
        console.log("wallet history ",user.walletHistory)
      }
  
      order.status = 'Cancelled';
      await order.save();
  
      res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ success: false, message: 'An error occurred while canceling the order' });
    }
  };
  

  const viewOrder =async(req,res)=>{
    try {
      const query = req.query.query || "";
      const finalAmount=req.session.finalAmount;
      const discount=req.session.discount
      console.log("final amount frm view",finalAmount)
      
      const activeTab=req.query.tab||"dashboard";
      const userId=req.session.user;
      const orderId=req.params.id;
      const order = await Order.findById(orderId)
      .populate({
        path:'orderedItems.product',
        select:'productName price quantity productImage description status'
    });
      console.log("order from view order",JSON.stringify(order,null,2));
      
    if (order){
      res.render('view-order',{order,user:userId,query,activeTab,finalAmount,discount})
    }
    } catch (error) {
      console.error(error,"error from view order")
      res.redirect('/pageNotFound')
      
    }
  }
  const getthankyou=async(req,res)=>{
    const userId=req.session.user;
    const user=await User.findById(userId)
    try {
      res.render('thankyou',{user,userId})
      
    } catch (error) {
      res.redirect('/pageNotFound')
      
    }
  };
  const returnOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const userId = req.session.user;
  
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      if (order.status !== 'Delivered') {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be returned. It must be in Delivered status.',
        });
      }
  
      // Set return request details
      order.status = 'Return Requested';
      order.returnReason = reason;
      order.returnRequestedAt = new Date();
      await order.save();
  
      res.status(200).json({
        success: true,
        message: 'Return request submitted successfully! Awaiting admin approval.',
      });
    } catch (error) {
      console.error('Error processing return request:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your return request.',
      });
    }
  };








module.exports={
    loadCheckoutPage,
    processOrder,
    getOrders,
    cancelOrder,
    viewOrder,
    getthankyou,
    checkoutaddress,
    verifyPayment,
    returnOrder
}