const mongoose = require("mongoose");
const Cart = require("../../models/cartSchema");
const Product = require('../../models/productSchema');
const User=require('../../models/userschema');
const Order=require('../../models/orderSchema')
const Address=require('../../models/addressSchema')


const loadCartPage = async (req, res) => {
  try {
    const userId = req.session.user; 
    const user=await User.findById(userId)

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    
    if (!cart || cart.items.length === 0) {
      return res.render("cart", { cart: [], totalAmount: 0,user });
    }

    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    res.render("cart", { 
      cart: cart.items.map(item => ({
        ...item._doc,
        stock: item.productId.quantity, // Add stock to the cart items
      })), 
      totalAmount, 
      userId, 
      user 
    });  } catch (error) {
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
      
      return res.status(400).json({ success: false, message: "Insufficient stock available." });
    }

    let cart = await Cart.findOne({ userId });
    const itemPrice = product.salePrice;

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.equals(productId));
    if (existingItem) {
      if (product.quantity < existingItem.quantity + parseInt(quantity, 10)) {
        return res.status(400).json({ success: false, message: "Insufficient stock available." });
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
    return res.json({ success: true, message: "Product added to cart successfully!" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "An error occurred while adding to the cart." });
  }
};

// const updateCart = async (req,res) => {
//   try {
//     const { productId, quantity } = req.body;
//     const userId = req.session.user;

//   const product = await Product.findById(productId)

//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       return res.redirect("/cart");
//     }

//     console.log("product from update cart",product.quantity);
//     console.log("cart from update cart",cart)
  

//     const item = cart.items.find((item) => item.productId.equals(productId));
//     if (item) {
//       item.quantity = parseInt(quantity, 10);
//       item.totalPrice = item.quantity * item.price;
//     }


//     if(product.quantity < item.quantity){
//       return res.redirect("/cart")
//     }


//     await cart.save();
//     res.redirect("/cart");
//   } catch (error) {
//     console.error("Error updating cart:", error);
//     res.status(500).send("An error occurred while updating the cart.");
//   }
// };

const  removeItem = async (req, res) => {
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







const orderPageLoad = async (req, res) => {
  try {
    const userId = req.session.user;
    const orders = await Order.find({ userId })
      .populate('orderedItems.product') 

    console.log(orders, 'Orders with populated products');

    res.render("orders", { orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Something went wrong.");
  }
};

const updatingCart=async(req,res)=>{
  try {
    const { productId, quantity, action } = req.body;
    const userId = req.session.user;

    // Find the product and cart
    const product = await Product.findById(productId);
    const cart = await Cart.findOne({ userId });

    if (!product || !cart) {
      return res.status(404).json({
        success: false,
        message: 'Product or cart not found'
      });
    }

    // Find the cart item
    const cartItem = cart.items.find(item => item.productId.equals(productId));
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock availability for increment
    if (action === 'increment' && quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    // Update quantity and total price
    cartItem.quantity = quantity;
    cartItem.totalPrice = quantity * cartItem.price;

    // Save the updated cart
    await cart.save();

    res.json({
      success: true,
      message: 'Quantity updated successfully',
      newQuantity: quantity,
      newTotal: cartItem.totalPrice
    });

  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the quantity'
    });
  }
};








 






module.exports = {
  loadCartPage,
  addToCart,
  // updateCart,
  removeItem,
  orderPageLoad, 
  updatingCart 
};
