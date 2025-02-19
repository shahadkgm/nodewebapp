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
    console.log("cart from load checkout page",cart)
    // console.log("quantity from load checkout page",cart.quantity)
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
    console.log("its reached in the process order page");
    console.log("it from processOrder", req.body);

    const { selectedAddress, paymentMethod, discount } = req.body;
    const userId = req.session.user;

    const parsedAddress = JSON.parse(selectedAddress);

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const insufficientStockItems = [];
    for (let item of cart.items) {
      const product = item.productId;

      if (!product || product.quantity < item.quantity) {
        insufficientStockItems.push({
          productName: product?.productName || "Unknown Product",
          availableStock: product?.quantity || 0,
          requestedQuantity: item.quantity,
        });
      }
    }
    console.log("insufficient ",insufficientStockItems)
    console.log("1")
    
      if (insufficientStockItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some items have insufficient stock.",
          insufficientStockItems,
        });
      }
  
   

    console.log("2")

    await Promise.all(
      cart.items.map(async (item) => {
        const product = item.productId;
        await Product.updateOne(
          { _id: product._id },
          { $inc: { quantity: -item.quantity } }
        );
      })
    );
    console.log("3")


    // const totalAmount = cart.items.reduce(
    //   (sum, item) => sum + price * item.quantity,
    //   0
    // );
    const totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    console.log("3")
    const orderedItems = cart.items.map((item) => ({
      product: item.productId._id,
      quantity: item.quantity,
      price: item.price,
    }));


    const order = new Order({
      userId,
      orderedItems,
      address: parsedAddress, // Use parsedAddress
      paymentMethod,
      discount: discount || 0,
      totalPrice,
      status: "Pending",
      orderDate: new Date(),
      couponApplied: !!discount,


    });

    await order.save();

    await Cart.findOneAndUpdate({ userId }, { items: [], totalAmount: 0 });

    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the order.",
    });
  }
};





  const getOrders = async (req, res) => {
    try {
      const userId = req.session.user;
  
      const orders = await Order.find({ userId })
      .populate("orderedItems.product")
      .sort({ createOn: -1 }) 
      .limit(1); 
      
      res.render("orders", { orders,user:userId }); 
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("An error occurred while fetching your orders.");
    }
  };

  const cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found." });
      }
      if (order.status !== "Pending" && order.status !== "Processing") {
        return res.status(400).json({ success: false, message: "This order cannot be cancelled." });
      }
  
      for (const item of order.orderedItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity; 
          await product.save();
        }
      }
  
      // Update order status
      order.status = "Cancelled";
      await order.save();
  
      res.redirect("/userProfile?tab=orders&cancelStatus=success");    } catch (error) {
      console.error("Error cancelling order:", error);
      res.redirect("/userProfile?tab=orders&cancelStatus=error");
    }
  };
  

  const viewOrder =async(req,res)=>{
    try {
      const query = req.query.query || "";
      
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
      res.render('view-order',{order,user:userId,query,activeTab})
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