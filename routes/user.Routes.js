const express = require('express');
const router = express.Router();
const passport = require("passport");

// Controllers
const userController = require("../controller/user/userController");
const profileController = require("../controller/user/profileController");
const cartController = require("../controller/user/cartController");
const couponController = require("../controller/user/couponController");
const wishlistController = require("../controller/user/wishlistController");
const orderController = require("../controller/user/orderController");

// Middlewares
const { adminAuth, userAuth } = require("../middlewares/auth");

/* ==========================================================================
   STATIC ROUTES (Defined first to avoid route parameter collision)
   ========================================================================== */

// --- General & Authentication Routes ---
router.get("/", userController.loadHomepage);
router.get('/home', (req, res) => { res.render("home"); });
router.get('/logout', userController.logout);
router.get("/pageNotFound", userController.pageNoTFound);

router.get("/signup", userController.loadSignup);
router.post("/signup", userController.signup);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);

router.get('/login', userController.loadlogin);
router.post('/login', userController.login);

// --- OAuth Routes ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
});

// --- Profile & Account Management (Static) ---
router.get('/userProfile', userAuth, profileController.userProfile);
router.get('/profile', userAuth, profileController.userProfile); // RESTful alias

router.get('/forgot-password', profileController.getfForgotPassPage);
router.post("/forgot-email-valid", profileController.forgotEmailValid);
router.post('/verify-passForgot-otp', profileController.verifyForgotPassOtp);
router.get('/reset-password', profileController.getResetPassPage);
router.post('/reset-password', profileController.postNewPassword);
router.post('/resend-forgot-otp', profileController.resendOtp);

router.get('/change-email', userAuth, profileController.changeEmail);
router.post("/change-email", userAuth, profileController.changeEmailValid);
router.post("/verify-email-otp", userAuth, profileController.verifyEmailOtp);
router.post("/update-email", userAuth, profileController.updateEmail);

router.get("/change-password", userAuth, profileController.changePassword);
router.post("/change-password", userAuth, profileController.changePasswordValid);
router.post("/verify-changepassword-otp", userAuth, profileController.verifyChangePassOtp);

// --- Address Management (Static) ---
router.get("/address", userAuth, profileController.addAddress);
router.get("/addresses", userAuth, profileController.addAddress); // RESTful alias
router.post("/addAddress", userAuth, profileController.postAddAddress);
router.post("/addresses", userAuth, profileController.postAddAddress); // RESTful alias

// --- Shopping & Catalog (Static) ---
router.get('/shop', userAuth, userController.loadShoppingPage);
router.get('/products', userAuth, userController.loadShoppingPage); // RESTful alias
router.get('/filter', userAuth, userController.filterProduct);
router.get('/filterPrice', userAuth, userController.filterByPrice);

// --- Cart Management (Static) ---
router.get('/Cart', userAuth, cartController.loadCartPage);
router.get('/cart', userAuth, cartController.loadCartPage); // RESTful alias
router.post('/add', userAuth, cartController.addToCart);
router.post('/cart/items', userAuth, cartController.addToCart); // RESTful alias
router.post('/remove', userAuth, cartController.removeItem);
router.post('/cart/remove', userAuth, cartController.removeItem); // RESTful alias
router.post('/update-cart', userAuth, cartController.updatingCart);
router.put('/cart', userAuth, cartController.updatingCart); // RESTful alias

// --- Checkout & Orders (Static) ---
router.get('/checkOut', userAuth, orderController.loadCheckoutPage);
router.get('/checkout', userAuth, orderController.loadCheckoutPage); // RESTful alias
router.post('/checkOut', userAuth, orderController.processOrder);
router.post('/checkout', userAuth, orderController.processOrder); // RESTful alias
router.post("/checkout-address", userAuth, orderController.checkoutaddress);
router.get('/orders', userAuth, orderController.getOrders); // RESTful
router.get('/thankyou', userAuth, orderController.getthankyou);

// --- Coupon Management (Static) ---
router.post('/applyCoupon', userAuth, couponController.applyCoupon);
router.post('/coupons/apply', userAuth, couponController.applyCoupon); // RESTful alias
router.post('/remove-coupon', userAuth, couponController.removeCoupon);
router.post('/coupons/remove', userAuth, couponController.removeCoupon); // RESTful alias

// --- Wishlist Management (Static) ---
router.get('/wishlist', userAuth, wishlistController.getWishlist); // RESTful
router.post('/toggle', userAuth, wishlistController.toggleWishlist);
router.post('/wishlist/toggle', userAuth, wishlistController.toggleWishlist); // RESTful alias
router.post('/addwishlist', userAuth, wishlistController.Cartfrmwish);
router.post('/wishlist/move-to-cart', userAuth, wishlistController.Cartfrmwish); // RESTful alias

// --- Payments (Static) ---
router.post('/verify-payment', userAuth, orderController.verifyPayment);
router.post('/payment-success', userAuth, orderController.successpayment);

/* ==========================================================================
   DYNAMIC / PARAMETERIZED ROUTES (Defined after all static routes)
   ========================================================================== */

// --- Address Dynamic Routes ---
router.get('/edit-address/:id', userAuth, profileController.editAddress);
router.get('/addresses/:id/edit', userAuth, profileController.editAddress); // RESTful alias
router.post('/edit-address/:id', userAuth, profileController.postEditAddress);
router.put('/addresses/:id', userAuth, profileController.postEditAddress); // RESTful alias
router.post('/addresses/:id', userAuth, profileController.postEditAddress); // RESTful alias
router.post('/delete-address/:id', userAuth, profileController.deleteAddress);
router.delete('/addresses/:id', userAuth, profileController.deleteAddress); // RESTful alias

// --- Product Dynamic Routes ---
router.get('/product-details/:id', userAuth, userController.loadProductDetail);
router.get('/product/:id', userAuth, userController.getProductDetail);
router.get('/products/:id', userAuth, userController.getProductDetail); // RESTful alias

// --- Order Dynamic Routes ---
router.get('/view-order/:id', userAuth, orderController.viewOrder);
router.get('/orders/:id', userAuth, orderController.viewOrder); // RESTful alias
router.post('/cancel-order/:id', userAuth, orderController.cancelOrder);
router.patch('/orders/:id/cancel', userAuth, orderController.cancelOrder); // RESTful alias
router.post('/return-order/:orderId', userAuth, orderController.returnOrder);
router.post('/orders/:orderId/return', userAuth, orderController.returnOrder); // RESTful alias
router.post('/retry-payment/:orderId', userAuth, orderController.paymentreturn);
router.post('/orders/:orderId/retry-payment', userAuth, orderController.paymentreturn); // RESTful alias

// --- Wishlist Dynamic Routes ---
router.delete('/remove-wishlist/:productId', userAuth, wishlistController.removeWishlist);
router.delete('/wishlist/:productId', userAuth, wishlistController.removeWishlist); // RESTful alias

module.exports = router;
