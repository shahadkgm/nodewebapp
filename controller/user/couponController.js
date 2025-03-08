const mongoose=require("mongoose");
const Coupon=require("../../models/couponSchema")
const Cart=require("../../models/cartSchema");
const crypto=require('crypto');





const applyCoupon = async (req, res) => {
    try {
      const { couponCode, totalAmount } = req.body;
      const userId = req.session.user;
  
      console.log("Coupon Code from request:", couponCode, "Total Amount:", totalAmount);
      console.log("User ID from session:", userId);
  
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
  
      if (!couponCode || !totalAmount) {
        return res.status(400).json({ success: false, message: 'Coupon code and total amount are required' });
      }
  
      const coupon = await Coupon.findOne({
        name: { $regex: new RegExp(`^${couponCode.trim()}$`, 'i') },
        islist: true,
        expireOn: { $gt: new Date() }
      });
  
      console.log("Fetched Coupon:", coupon);
  
      if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid or unlisted coupon code' });
      }
  
      const userObjectId = new mongoose.Types.ObjectId(userId);
      if (coupon.usedBy && coupon.usedBy.some(id => id.equals(userObjectId))) {
        return res.status(400).json({ success: false, message: 'You have already used this coupon' });
      }
  
      if (coupon.userId.length > 0 && !coupon.userId.some(id => id.equals(userObjectId))) {
        return res.status(400).json({ success: false, message: 'This coupon is not applicable to you' });
      }
  
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(400).json({ success: false, message: 'Cart not found' });
      }
  
      if (totalAmount < coupon.minimumPrice) {
        return res.status(400).json({ success: false, message: `Minimum order value should be ₹${coupon.minimumPrice}` });
      }
  
      const discountAmount = Math.min(coupon.offerPrice, totalAmount);
      const newTotal = totalAmount - discountAmount;
  
      req.session.discount = discountAmount;
      req.session.finalAmount = newTotal;
      req.session.appliedCoupon = couponCode;
  
      if (!coupon.usedBy) coupon.usedBy = [];
      if (!coupon.usedBy.some(id => id.equals(userObjectId))) {
        coupon.usedBy.push(userObjectId);
        await coupon.save();
      }
  
      console.log("Session Data after applying coupon:", req.session);
  
      res.json({
        success: true,
        message: `Coupon applied! ₹${discountAmount} discount given.`,
        discountAmount,
        newTotal
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

const removeCoupon = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ success: false, message: 'Cart not found' });
        }

        const originalTotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

        // Reset session values
        req.session.discount = 0;
        req.session.finalAmount = originalTotal;
        req.session.appliedCoupon = null;

        console.log("Session Data after removing coupon:", req.session);

        res.json({
            success: true,
            message: "Coupon removed successfully",
            discountAmount: 0,
            newTotal: originalTotal
        });
    } catch (error) {
        console.error('Error removing coupon:', error);
        res.status(500).json({ success: false, message: 'Error removing coupon' });
    }
};

module.exports = {
    applyCoupon,
    removeCoupon
};


