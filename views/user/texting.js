<%- include("../../views/partials/user/header") %>
<style>
  /* Page Header */
.page-header {
  background-color: #f8f9fa;
  padding: 20px 0;
}

.breadcrumb {
  font-size: 14px;
  padding: 10px 0;
  margin: 0;
  background: none;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb span {
  color: #6c757d;
}

/* Product Detail Slider */
.product-detail .detail-gallery {
  position: relative;
}

.product-detail .swiper-container {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
}

.product-detail .swiper-slide img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  border-radius: 10px;
}

.swiper-button-next,
.swiper-button-prev {
  color: #333;
  font-size: 18px;
  transition: color 0.3s ease;
}

.swiper-button-next:hover,
.swiper-button-prev:hover {
  color: #000;
}

/* Product Information */
.detail-info {
  padding-left: 30px;
  display: flex;
  flex-direction: column;
}

.title-detail {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
}

.product-price {
  font-size: 24px;
  color: #28a745;
}

.product-price .old-price {
  color: #6c757d;
  text-decoration: line-through;
}

.save-price {
  color: #dc3545;
}

.short-desc p {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.product-meta {
  margin-top: 20px;
}

.product-meta li {
  margin-bottom: 5px;
}

.product-meta .in-stock {
  color: #28a745;
}

.product-detail-rating {
  margin-bottom: 20px;
}

/* Make Images Responsive */
.detail-gallery img {
  max-width: 100%;
}

/* Related Products Section */
.related-products ul {
  padding: 0;
  list-style: none;
}

.related-products ul li {
  margin-bottom: 15px;
}

.related-products ul li img {
  border-radius: 5px;
  margin-right: 10px;
}

/* Add to Cart Button */
.add-to-cart-btn {
  background-color: #28a745;
  color: #fff;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover {
  background-color: #218838;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .detail-info {
    padding-left: 0;
    margin-top: 20px;
  }

  .title-detail {
    font-size: 24px;
  }

  .product-price {
    font-size: 20px;
  }

  .short-desc p {
    font-size: 14px;
  }
}

</style>

<main class="main">
  <!-- Breadcrumb Section -->
  <div class="page-header breadcrumb-wrap">
    <div class="container">
      <div class="breadcrumb">
        <a href="/" rel="nofollow">Home</a>
        <span></span>
        <span>Product Detail Page</span>
      </div>
    </div>
  </div>

  <!-- Product Detail Section -->
  <section class="mt-50 mb-50">
    <div class="container">
      <div class="row">
        <!-- Product Details -->
        <div class="col-lg-9">
          <div class="product-detail accordion-detail">
            <div class="row mb-50">
              <!-- Product Images -->
              <div class="col-md-6 col-sm-12">
                <div class="detail-gallery">
                  <div class="swiper-container product-image-slider">
                    <div class="swiper-wrapper">
                      <% product.productImages.forEach((image) => { %>
                        <div class="swiper-slide">
                          <figure class="border-radius-10">
                            <img
                              src="/uploads/product-images/<%= image %>"
                              alt="<%= product.name %>"
                              style="width: 100%; object-fit: cover;"
                            />
                          </figure>
                        </div>
                      <% }); %>
                    </div>
                    <!-- Navigation buttons -->
                    <div class="swiper-button-next"></div>
                    <div class="swiper-button-prev"></div>
                  </div>
                </div>
              </div>
              

              <!-- Product Info -->
              <div class="col-md-6 col-sm-12">
                <div class="detail-info">
                  <h2 class="title-detail"><%= product.name %></h2>
                  <div class="product-detail-rating"></div>
                  <div class="clearfix product-price-cover">
                    <div class="product-price primary-color float-left">
                      <ins><span class="text-brand">₹<%= product.salePrice.toLocaleString('en-IN') %></span></ins>
                      <span class="old-price font-md ml-15">
                        ₹<%= product.regularPrice.toLocaleString('en-IN') %>
                      </span>
                      <span class="save-price font-md color3 ml-15">
                        Save ₹<%= (product.regularPrice - product.salePrice).toLocaleString('en-IN') %>
                      </span>
                    </div>
                  </div>
                  <div class="short-desc mb-30">
                    <p><%= product.description %></p>
                  </div>
                  <ul class="product-meta font-xs color-grey mt-50">
                    <li>Availability:
                      <span class="in-stock text-success ml-5">
                        <%= product.stock %>
                      </span>
                    </li>
                  </ul>
                  <form action="/add" method="POST">
                    <input type="hidden" name="productId" value="<%= product._id %>">
                    <input type="hidden" name="quantity" value="1"> <!-- Default quantity -->
                    <button type="submit" class="add-to-cart-btn btn btn-success">
                      Add to Cart
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- Related Products -->
        <div class="col-lg-3">
          <div class="related-products">
            <h4>Related Products</h4>
            <ul class="list-unstyled">
              <% if (relatedProducts && relatedProducts.length > 0) { %>
                <% relatedProducts.forEach((related) => { %>
                  <li class="mb-2 d-flex align-items-center">
                    <a href="/product/<%= related._id %>" class="text-decoration-none d-flex align-items-center">
                      <img
                        src="/uploads/product-images/<%= related.productImage[0] %>"
                        alt="<%= related.productName %>"
                        style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;"
                      />
                      <span><%= related.productName %></span>
                    </a>
                    <p class="mb-0 text-muted small">
                      ₹<%= related.salePrice.toLocaleString('en-IN') %>
                    </p>
                  </li>
                <% }); %>
              <% } else { %>
                <li>No related products found.</li>
              <% } %>
            </ul>
          </div>
        </div>
        <h5>Quality: We prioritize high-quality products and services.
          Customer Focused: We go the extra mile to ensure customer satisfaction.
          Innovation: We’re always looking for new ways to serve our customers better.
          Sustainability: We are committed to environmentally-friendly practices and solutions.</h5>
      </div>
    </div>
  </section>
</main>
<script>
  const swiper = new Swiper('.product-image-slider', {
    loop: true, // Infinite loop through the slides
    slidesPerView: 1, // Display one image at a time
    navigation: {
      nextEl: '.swiper-button-next', // Next slide button
      prevEl: '.swiper-button-prev', // Previous slide button
    },
    effect: 'slide', // Slide transition effect
    spaceBetween: 0, // No space between slides
  });
</script>
add to cart 
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

    if (!userId) {
      return res.redirect("/login"); 
    }

    console.log("Adding product to cart:", productId);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found!");
    }

    // Check if the product has sufficient stock
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

    // Decrease stock in the Product model
    product.quantity -= parseInt(quantity, 10);
    await product.save();

    // Save the updated cart
    await cart.save();

    res.redirect("/cart"); // Redirect to the cart page after adding
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).send("An error occurred while adding the product to the cart.");
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found!");
    }

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.redirect("/cart");
    }

    const item = cart.items.find((item) => item.productId.equals(productId));
    if (item) {
      const newQuantity = parseInt(quantity, 10);
      const quantityDifference = newQuantity - item.quantity;

      if (product.quantity < item.quantity) {
        return res.status(400).send("Insufficient stock available.");
      }

      item.quantity = newQuantity;
      item.totalPrice = newQuantity * item.price;

      

      await product.save();
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
      addresses: userAddresses ? userAddresses.address : [], // Pass the addresses to the template
    });
  } catch (error) {
    console.error("Error loading checkout page:", error);
    res.status(500).send("An error occurred while loading the checkout page.");
  }
};


const processOrder = async (req, res) => {
  try {
    const { selectedAddress, paymentMethod, discount } = req.body;
    console.log(paymentMethod)
    const userId = req.session.user;

    // Fetch cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart');
    }

    const parsedAddress = JSON.parse(selectedAddress);

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

    // Save the order
    await order.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.redirect('/orders');
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
    const order = await Order.findById(orderId);
    const product=await Product.findById(userId)
    
  if (order){
    res.render('view-order',{order,product})
  }
  } catch (error) {
    console.error(error,"error from view order")
    res.redirect('/pageNotFound')
    
  }
}




module.exports = {
  loadCartPage,
  addToCart,
  updateCart,
  removeItem,
  loadCheckoutPage,
  processOrder,
  orderPageLoad,
  cancelOrder,
  viewOrder
};
