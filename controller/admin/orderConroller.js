const { query } = require("express");
const User=require("../../models/userschema");
const Order=require("../../models/orderSchema");




const getOrderpage = async (req, res) => {
  try {
    const orders = await Order.find().populate( "orderedItems.product");  
    res.render('order-manage', { orders }); 
  } catch (error) {
    console.error(error, "Error in getOrderpage");
    res.status(500).send("Internal Server Error");
  }
};

const getUpdateOrder = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body;  
  
  try {
    if (!status) {
      return res.status(400).send("Status is required.");
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedOrder) {
      return res.status(404).send("Order not found.");
    }

    res.redirect('/admin/orders');
  } catch (error) {
    console.error(error, "Error in getUpdateOrder");
    res.status(500).send("Internal Server Error");
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;  
  try {
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).send("Order not found.");
    }

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
