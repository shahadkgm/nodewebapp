const mongoose = require("mongoose");
const Cart = require("../../models/cartSchema");
const Product = require('../../models/productSchema');
const User=require('../../models/userschema');
const Order=require('../../models/orderSchema')
const Address=require('../../models/addressSchema')


const loadCartPage = async (req, res) => {
  try {
    const user=req.session.user;

    const userId = req.session.user; 
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.render("cart", { cart: [], totalAmount: 0,user });
    }

    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    res.render("cart", { cart: cart.items, totalAmount, userId,user });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send("An error occurred while fetching the cart.");
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user;

    console.log("Adding product to cart:", productId);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found!");
    }

    if (product.quantity < quantity) {
      
      return res.status(400).send("Insufficient stock available.");
    }

    let cart = await Cart.findOne({ userId });
    const itemPrice = product.salePrice;

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.equals(productId));
    if (existingItem) {
      if (product.quantity < existingItem.quantity + parseInt(quantity, 10)) {
        return res.status(400).send("Insufficient stock available.");
      }

      existingItem.quantity += parseInt(quantity, 10);
      existingItem.totalPrice = existingItem.quantity * itemPrice;
    } else {
      cart.items.push({
        productId,
        quantity: parseInt(quantity, 10),
        price: itemPrice,
        totalPrice: quantity * itemPrice,
      });
    }

    await product.save();

    await cart.save();
    res.redirect("/cart"); // Redirect to the cart page after adding
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send("An error occurred while adding to the cart.");
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user;

  const product = await Product.findById(productId)

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.redirect("/cart");
    }

    console.log("product from update cart",product.quantity);
    console.log("cart from update cart",cart)
  

    const item = cart.items.find((item) => item.productId.equals(productId));
    if (item) {
      item.quantity = parseInt(quantity, 10);
      item.totalPrice = item.quantity * item.price;
    }


    if(product.quantity < item.quantity){
      return res.redirect("/cart")
    }


    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).send("An error occurred while updating the cart.");
  }
};

const removeItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.user;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.redirect("/cart");
    }

    cart.items = cart.items.filter((item) => !item.productId.equals(productId));

    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).send("An error occurred while removing the item.");
  }
};

// Load Checkout Page
const loadCheckoutPage = async (req, res) => {
  try {
    const userId = req.session.user;

    // Fetch cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.render("checkout", { cart: [], totalAmount: 0, addresses: [] });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Fetch addresses
    const userAddresses = await Address.findOne({ userId });

    res.render("checkout", {
      cart: cart.items,
      totalAmount,
      addresses: userAddresses ? userAddresses.address : [], 
    });
  } catch (error) {
    console.error("Error loading checkout page:", error);
    res.status(500).send("An error occurred while loading the checkout page.");
  }
};


const processOrder = async (req, res) => {
  try {
    const { selectedAddress, paymentMethod, discount} = req.body;
    console.log(paymentMethod)
    const userId = req.session.user;
//  console.log("processOrder product quantity",product.quantity)

    // Fetch cart
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

    // Create the order
    const order = new Order({
      userId, // Link order to the user
      orderedItems,
      totalPrice,
      discount: discount || 0,
      address: parsedAddress,
      paymentMethod:paymentMethod,
      status: 'Pending',
      couponApplied: !!discount,
    });
  
    console.log("order items",order)
   
    // Save the order
    await order.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.redirect('/thankyou');
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).send('Something went wrong while processing the order.');
  }
};



// Fetch user orders
const orderPageLoad = async (req, res) => {
  try {
    const userId = req.session.user;
    // Populate orderedItems.product to fetch product details (productName, price, etc.)
    const orders = await Order.find({ userId })
      .populate('orderedItems.product') // Populate the 'product' field in orderedItems
      .exec();

    console.log(orders, 'Orders with populated products');

    res.render("orders", { orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Something went wrong.");
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

const getOrders = async (req, res) => {
  try {
    const userId = req.session.user;

    // Fetch orders for the logged-in user
    const orders = await Order.find({ userId }).populate("orderedItems.product");

    res.render("orders", { orders }); // Pass the orders to the view
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("An error occurred while fetching your orders.");
  }
};
 
const getthankyou=async(req,res)=>{
  const user=req.session.user;
  try {
    res.render('thankyou')
    
  } catch (error) {
    res.redirect('/pageNotFound')
    
  }
};





module.exports = {
  loadCartPage,
  addToCart,
  updateCart,
  removeItem,
  loadCheckoutPage,
  processOrder,
  orderPageLoad,
  cancelOrder,
  viewOrder,
  getOrders,
  getthankyou
};
