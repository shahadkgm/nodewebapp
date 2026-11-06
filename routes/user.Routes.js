const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controllers
const userController = require('../controller/user/userController');
const profileController = require('../controller/user/profileController');
const cartController = require('../controller/user/cartController');
const couponController = require('../controller/user/couponController');
const wishlistController = require('../controller/user/wishlistController');
const orderController = require('../controller/user/orderController');

// Middlewares
const { userAuth } = require('../middlewares/auth');

/* ==========================================================================
   General & Authentication Routes
   ========================================================================== */
router.route('/')
  .get(userController.loadHomepage);

router.route('/home')
  .get((req, res) => res.render('home'));

router.route('/login')
  .get(userController.loadlogin)
  .post(userController.login);

router.route('/logout')
  .get(userController.logout)
  .post(userController.logout);

router.route('/signup')
  .get(userController.loadSignup)
  .post(userController.signup);

router.route('/verify-otp')
  .post(userController.verifyOtp);

router.route('/resend-otp')
  .post(userController.resendOtp);

router.route('/pageNotFound')
  .get(userController.pageNoTFound);

/* ==========================================================================
   OAuth Routes
   ========================================================================== */
router.route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/auth/google/callback')
  .get(passport.authenticate('google', { failureRedirect: '/signup' }), (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
  });

/* ==========================================================================
   Profile & Account Management
   ========================================================================== */
router.route('/profile')
  .get(userAuth, profileController.userProfile);

router.route('/userProfile')
  .get(userAuth, profileController.userProfile);

router.route('/forgot-password')
  .get(profileController.getfForgotPassPage)
  .post(profileController.forgotEmailValid);

router.route('/forgot-email-valid')
  .post(profileController.forgotEmailValid);

router.route('/verify-passForgot-otp')
  .post(profileController.verifyForgotPassOtp);

router.route('/reset-password')
  .get(profileController.getResetPassPage)
  .post(profileController.postNewPassword);

router.route('/resend-forgot-otp')
  .post(profileController.resendOtp);

router.route('/change-email')
  .get(userAuth, profileController.changeEmail)
  .post(userAuth, profileController.changeEmailValid);

router.route('/verify-email-otp')
  .post(userAuth, profileController.verifyEmailOtp);

router.route('/update-email')
  .post(userAuth, profileController.updateEmail)
  .put(userAuth, profileController.updateEmail);

router.route('/change-password')
  .get(userAuth, profileController.changePassword)
  .post(userAuth, profileController.changePasswordValid);

router.route('/verify-changepassword-otp')
  .post(userAuth, profileController.verifyChangePassOtp);

/* ==========================================================================
   Address Management
   ========================================================================== */
router.route('/addresses')
  .get(userAuth, profileController.addAddress)
  .post(userAuth, profileController.postAddAddress);

router.route('/address')
  .get(userAuth, profileController.addAddress);

router.route('/addAddress')
  .post(userAuth, profileController.postAddAddress);

router.route('/addresses/:id')
  .get(userAuth, profileController.editAddress)
  .put(userAuth, profileController.postEditAddress)
  .post(userAuth, profileController.postEditAddress)
  .delete(userAuth, profileController.deleteAddress);

router.route('/addresses/:id/edit')
  .get(userAuth, profileController.editAddress);

router.route('/edit-address/:id')
  .get(userAuth, profileController.editAddress)
  .post(userAuth, profileController.postEditAddress);

router.route('/delete-address/:id')
  .post(userAuth, profileController.deleteAddress)
  .delete(userAuth, profileController.deleteAddress);

/* ==========================================================================
   Shopping & Catalog
   ========================================================================== */
router.route('/products')
  .get(userAuth, userController.loadShoppingPage);

router.route('/shop')
  .get(userAuth, userController.loadShoppingPage);

router.route('/filter')
  .get(userAuth, userController.filterProduct);

router.route('/filterPrice')
  .get(userAuth, userController.filterByPrice);

router.route('/products/:id')
  .get(userAuth, userController.getProductDetail);

router.route('/product/:id')
  .get(userAuth, userController.getProductDetail);

router.route('/product-details/:id')
  .get(userAuth, userController.loadProductDetail);

/* ==========================================================================
   Cart Management
   ========================================================================== */
router.route('/cart')
  .get(userAuth, cartController.loadCartPage)
  .post(userAuth, cartController.addToCart)
  .put(userAuth, cartController.updatingCart)
  .delete(userAuth, cartController.removeItem);

router.route('/Cart')
  .get(userAuth, cartController.loadCartPage);

router.route('/cart/items')
  .post(userAuth, cartController.addToCart);

router.route('/add')
  .post(userAuth, cartController.addToCart);

router.route('/cart/remove')
  .post(userAuth, cartController.removeItem)
  .delete(userAuth, cartController.removeItem);

router.route('/remove')
  .post(userAuth, cartController.removeItem);

router.route('/update-cart')
  .post(userAuth, cartController.updatingCart)
  .put(userAuth, cartController.updatingCart);

/* ==========================================================================
   Checkout & Orders
   ========================================================================== */
router.route('/checkout')
  .get(userAuth, orderController.loadCheckoutPage)
  .post(userAuth, orderController.processOrder);

router.route('/checkOut')
  .get(userAuth, orderController.loadCheckoutPage)
  .post(userAuth, orderController.processOrder);

router.route('/checkout-address')
  .post(userAuth, orderController.checkoutaddress);

router.route('/orders')
  .get(userAuth, orderController.getOrders);

router.route('/thankyou')
  .get(userAuth, orderController.getthankyou);

router.route('/orders/:id')
  .get(userAuth, orderController.viewOrder);

router.route('/view-order/:id')
  .get(userAuth, orderController.viewOrder);

router.route('/orders/:id/cancel')
  .patch(userAuth, orderController.cancelOrder)
  .post(userAuth, orderController.cancelOrder);

router.route('/cancel-order/:id')
  .post(userAuth, orderController.cancelOrder);

router.route('/orders/:orderId/return')
  .post(userAuth, orderController.returnOrder);

router.route('/return-order/:orderId')
  .post(userAuth, orderController.returnOrder);

router.route('/orders/:orderId/retry-payment')
  .post(userAuth, orderController.paymentreturn);

router.route('/retry-payment/:orderId')
  .post(userAuth, orderController.paymentreturn);

/* ==========================================================================
   Coupon Management
   ========================================================================== */
router.route('/coupons/apply')
  .post(userAuth, couponController.applyCoupon);

router.route('/applyCoupon')
  .post(userAuth, couponController.applyCoupon);

router.route('/coupons/remove')
  .post(userAuth, couponController.removeCoupon)
  .delete(userAuth, couponController.removeCoupon);

router.route('/remove-coupon')
  .post(userAuth, couponController.removeCoupon);

/* ==========================================================================
   Wishlist Management
   ========================================================================== */
router.route('/wishlist')
  .get(userAuth, wishlistController.getWishlist);

router.route('/wishlist/toggle')
  .post(userAuth, wishlistController.toggleWishlist);

router.route('/toggle')
  .post(userAuth, wishlistController.toggleWishlist);

router.route('/wishlist/move-to-cart')
  .post(userAuth, wishlistController.Cartfrmwish);

router.route('/addwishlist')
  .post(userAuth, wishlistController.Cartfrmwish);

router.route('/wishlist/:productId')
  .delete(userAuth, wishlistController.removeWishlist);

router.route('/remove-wishlist/:productId')
  .delete(userAuth, wishlistController.removeWishlist)
  .post(userAuth, wishlistController.removeWishlist);

/* ==========================================================================
   Payments
   ========================================================================== */
router.route('/verify-payment')
  .post(userAuth, orderController.verifyPayment);

router.route('/payment-success')
  .post(userAuth, orderController.successpayment);

module.exports = router;
