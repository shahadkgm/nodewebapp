const { query } = require("express");
const User=require("../../models/userschema");
const Order=require("../../models/orderSchema");




// Get the order management page
const getOrderpage = async (req, res) => {
  try {
    const orders = await Order.find();  // Fetch all orders
    res.render('order-manage', { orders });  // Pass the orders to the frontend
  } catch (error) {
    console.error(error, "Error in getOrderpage");
    res.status(500).send("Internal Server Error");
  }
};

// Update the order status
const getUpdateOrder = async (req, res) => {
  const { id } = req.params;  // Extract order ID from URL params
  const { status } = req.body;  // Extract the new status from the request body
  
  try {
    // Validate the status (optional, you can add more validation logic here)
    if (!status) {
      return res.status(400).send("Status is required.");
    }

    // Update the order in the database
    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

    // Check if the order exists
    if (!updatedOrder) {
      return res.status(404).send("Order not found.");
    }

    // Redirect to the orders page
    res.redirect('/admin/orders');
  } catch (error) {
    console.error(error, "Error in getUpdateOrder");
    res.status(500).send("Internal Server Error");
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
  const { id } = req.params;  // Extract order ID from URL params
  
  try {
    // Find and delete the order
    const deletedOrder = await Order.findByIdAndDelete(id);

    // Check if the order exists
    if (!deletedOrder) {
      return res.status(404).send("Order not found.");
    }

    // Redirect to the orders page
    res.redirect('/admin/orders');
  } catch (error) {
    console.error(error, "Error in deleteOrder");
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getOrderpage,
  getUpdateOrder,
  deleteOrder
};
