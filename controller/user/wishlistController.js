const mongoose=require("mongoose");
const Cart=require("../../models/cartSchema");
const Address=require("../../models/addressSchema")
const Product=require("../../models/productSchema");
const Order=require("../../models/orderSchema");
const User=require("../../models/userschema")
const Coupon=require("../../models/couponSchema")
const Wishlist=require("../../models/wishlistSchema")



const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log("productId from toggle wishlist",productId)
        const userId = req.session.user; 
        console.log("user id from toggle ",userId)

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        console.log("Product ID from toggleWishlist:", productId);
    
        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [] });
        }

        console.log("Wishlist from DB:", wishlist);

        // Find if the product exists in the wishlist
        const itemIndex = wishlist.products.findIndex(p => p.productId.toString() === productId);

        if (itemIndex === -1) {
            wishlist.products.push({ productId });
        } else {
            wishlist.products.splice(itemIndex, 1);
        }

        await wishlist.save();
        res.json({ success: true, message: itemIndex === -1 ? "Added to Wishlist!" : "Removed from Wishlist!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error!" });
    }
};

const getWishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const wishlist = await Wishlist.findOne({ userId })
            .populate({
                path: "products.productId",
                select: "productName productImage salePrice",
            });

        res.render("wishlist", {user:userId, wishlist: wishlist ? wishlist.products.map(p => p.productId) : [] });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching wishlist.");
    }
};

const removeWishlist = async (req, res) => {
    const { productId } = req.params;
    console.log("productId from remove wishlist", productId);
    
    try {
      const userId = req.session.user; 
      const wishlist = await Wishlist.findOne({ userId: userId });
      console.log("wishlist from remove wishlist", wishlist);
      
      if (wishlist) {
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: {products: { productId: productId } }} , 
          { new: true }
        );
        await wishlist.save();

        console.log("updated wishlist from remove", updatedWishlist);
        
        if (updatedWishlist) {
          return res.json({ success: true });
        } else {
          return res.status(400).json({ success: false, message: 'Failed to remove item.' });
        }
      } else {
        return res.status(404).json({ success: false, message: 'Wishlist not found.' });
      }
    } catch (error) {
      console.error('Error removing wishlist item:', error);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
  };
  const Cartfrmwish = async (req, res) => {
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

        // Remove product from wishlist if it exists
        const wishlist = await Wishlist.findOne({ userId });
         if (wishlist) {
         await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: {products: { productId: productId } }} , 
          { new: true }
          )};

        await product.save();
        await cart.save();

        return res.json({ success: true, message: "Product added to cart successfully!" });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "An error occurred while adding to the cart." });
    }
};


    module.exports={
        toggleWishlist,
        getWishlist,
        removeWishlist,
        Cartfrmwish


    }
    
   
