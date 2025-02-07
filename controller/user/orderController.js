const mongoose=require("mongoose");
const Cart=require("../../models/cartSchema");
const Address=require("../../models/addressSchema")
const Product=require("../../models/productSchema");
const Order=require("../../models/orderSchema");
const User=require("../../models/userschema")


const loadCheckoutPage = async (req, res) => {
  // const userId=req.session.user
  try {
    const userId = req.session.user;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.render("checkout", { cart: [], totalAmount: 0, addresses: [] ,user});
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    const userAddresses = await Address.findOne({ userId });
    const user=await User.findById(userId)
    

    res.render("checkout", {
      cart: cart.items,
      totalAmount,
      addresses: userAddresses ? userAddresses.address : [], 
      user,
    });
  } catch (error) {
    console.error("Error loading checkout page:", error);
    res.status(500).send("An error occurred while loading the checkout page.");
  }
};


const processOrder = async (req, res) => {
    try {
      const { selectedAddress, paymentMethod, discount,productId,quantity} = req.body;
      const product=await Product.findById(productId)
      console.log("product from process order",product)
      console.log(paymentMethod)
      const userId = req.session.user;
      // const product=await Product.findOne({userId})
  //  console.log("processOrder product quantity",product.quantity)
  
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
      }
  
      await Promise.all(cart.items.map(async(item)=>{
        const product = item.productId
        console.log("product items",product)
        console.log("product quantity",product.quantity)
    await Product.updateOne(
      {_id:product._id},{$inc:{'quantity':-item.quantity}}
    )
      }))
      
  
  
  
      const parsedAddress = JSON.parse(selectedAddress);
       console.log("items in cart",cart)
      const orderedItems = cart.items.map((item) => ({
        product: item.productId._id,
        quantity: item.quantity,
        price: item.price,
      }));
  
      const totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
      const order = new Order({
        userId, 
        orderedItems,
        totalPrice,
        discount: discount || 0,
        address: parsedAddress,
        paymentMethod:paymentMethod,
        status: 'Pending',
        couponApplied: !!discount,
      });
    
      console.log("order items",order)
     
      await order.save();
  
      cart.items = [];
      await cart.save();
  // if (product.quantity<item.quantity)
      res.redirect('/thankyou');
    } catch (error) {
      console.error('Error processing order:', error);
      res.status(500).send('Something went wrong while processing the order.');
    }
  };



  const getOrders = async (req, res) => {
    try {
      const userId = req.session.user;
  
      const orders = await Order.find({ userId }).populate("orderedItems.product").sort({createdAt:-1});
  
      res.render("orders", { orders }); 
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("An error occurred while fetching your orders.");
    }
  };

  const cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);
  
      if (!order || !(order.status === "Pending" || order.status === "Processing")) {
        return res.status(400).send("Cannot cancel this order.");
      }
  
      // Update product stock
      for (const item of order.orderedItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity; // Return stock
          await product.save(); // Save updated product
        }
      }
  
    
      order.status = "Cancelled";
      await order.save();
  
      res.redirect("/orders");
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).send("Something went wrong.");
    }
  };


  const viewOrder =async(req,res)=>{
    try {
      const userId=req.session.user;
      const orderId=req.params.id;
      const order = await Order.findById(orderId)
      .populate({
        path:'orderedItems.product',
        select:'productName price quantity productImage'
    });
      const product=await Product.findById(userId);
      console.log("order from view order",JSON.stringify(order,null,2));
      
    if (order){
      res.render('view-order',{order,product})
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
      res.render('thankyou',user)
      
    } catch (error) {
      res.redirect('/pageNotFound')
      
    }
  };








module.exports={
    loadCheckoutPage,
    processOrder,
    getOrders,
    cancelOrder,
    viewOrder,
    getthankyou
}