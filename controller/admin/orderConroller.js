const { query } = require("express");
const User=require("../../models/userschema");
const Order=require("../../models/orderSchema");




const getOrderpage = async (req, res) => {
  try {
    let search = req.query.search || "";
    let page = parseInt(req.query.page) || 1;
    const limit = 4; 

    // Apply search, pagination, and populate ordered items
    const orders = await Order.find({
      $or: [
        { orderId: { $regex: ".*" + search + ".*", $options: "i" } },
        { status: { $regex: ".*" + search + ".*", $options: "i" } },
      ]
    })
      .limit(limit) 
      .skip((page - 1) * limit) 
      .populate("orderedItems.product") 
      .exec();

    const count = await Order.countDocuments({
      $or: [
        { orderId: { $regex: ".*" + search + ".*", $options: "i" } },
        { status: { $regex: ".*" + search + ".*", $options: "i" } },
      ]
    });

    const totalPages = Math.ceil(count / limit); 

    res.render('order-manage', {
      orders: orders,
      totalPages: totalPages,
      currentPage: page,
      totalCount: count,
      searchQuery: search, 
    });

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

const viewOrder =async(req,res)=>{
  try {
    const query = req.query.query || "";
    
    const userId=req.session.user;
    const orderId=req.params.id;
    const order = await Order.findById(orderId)
    .populate({
      path:'orderedItems.product',
      select:'productName price quantity productImage description status'
  });
    console.log("order from view order admin",JSON.stringify(order,null,2));
    
  if (order){
    res.render('admin-orderview',{order,user:userId,query})
  }
  } catch (error) {
    console.error(error,"error from view order")
    res.redirect('/pageNotFound')
    
  }
}

module.exports = {
  getOrderpage,
  getUpdateOrder,
  deleteOrder,
  viewOrder
};
