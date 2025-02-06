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
    res.redirect("/cart"); 
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send("An error occurred while adding to the cart.");
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

const updatingCart=async(req,res)=>{
  try {
    const { items } = req.body;
    const userId = req.session.user;
    
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) return res.json({ success: false, message: "Cart not found" });

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.quantity < item.quantity) {
        return res.json({ success: false, message: `Stock unavailable for ${product.productName}` });
      }
      
      const cartItem = cart.items.find(i => i.productId._id.toString() === item.productId);
      if (cartItem) {
        cartItem.quantity = parseInt(item.quantity, 10);
        cartItem.totalPrice = cartItem.quantity * cartItem.price;
      }
    }

    await cart.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating cart before checkout:", error);
    res.json({ success: false, message: "Error updating cart." });
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
