const express = require('express');
const router = express.Router();

// Controllers
const adminController = require('../controller/admin/adminController');
const customerController = require('../controller/admin/customerController');
const categoryController = require('../controller/admin/categoryController');
const productController = require('../controller/admin/productController');
const orderController = require('../controller/admin/orderConroller');
const couponController = require('../controller/admin/couponController');
const salesController = require('../controller/admin/salesController');
const walletController = require('../controller/admin/walletController');

// Middlewares
const { adminAuth } = require('../middlewares/auth');
const uploads = require('../util/Multer');

/* ==========================================================================
   Authentication & Dashboard
   ========================================================================== */
router.route('/login')
  .get(adminController.loadLogin)
  .post(adminController.login);

router.route('/logout')
  .get(adminController.logout)
  .post(adminController.logout);

router.route('/pageerror')
  .get(adminController.pageerror);

router.route('/')
  .get(adminAuth, adminController.loadDashboard);

/* ==========================================================================
   Customer Management
   ========================================================================== */
router.route('/customers')
  .get(adminAuth, customerController.customerInfo);

// Legacy alias
router.route('/users')
  .get(adminAuth, customerController.customerInfo);

router.route('/customers/:id/block')
  .patch(adminAuth, customerController.customerBlocked)
  .post(adminAuth, customerController.customerBlocked);

router.route('/customers/:id/unblock')
  .patch(adminAuth, customerController.customerunBlocked)
  .post(adminAuth, customerController.customerunBlocked);

// Legacy query-param aliases for EJS templates
router.route('/blockCustomer')
  .get(adminAuth, customerController.customerBlocked)
  .patch(adminAuth, customerController.customerBlocked);

router.route('/unblockCustomer')
  .get(adminAuth, customerController.customerunBlocked)
  .patch(adminAuth, customerController.customerunBlocked);

/* ==========================================================================
   Category Management
   ========================================================================== */
router.route('/categories')
  .get(adminAuth, categoryController.categoryInfo)
  .post(adminAuth, categoryController.addCategory);

// Legacy aliases
router.route('/category')
  .get(adminAuth, categoryController.categoryInfo);

router.route('/addCategory')
  .post(adminAuth, categoryController.addCategory);

router.route('/categories/:id')
  .get(adminAuth, categoryController.getEditCategory)
  .put(adminAuth, categoryController.editCategory)
  .post(adminAuth, categoryController.editCategory); // Form fallback

router.route('/categories/:id/offer')
  .post(adminAuth, categoryController.addCategoryOffer)
  .delete(adminAuth, categoryController.removeCategoryOffer);

router.route('/categories/:id/list')
  .patch(adminAuth, categoryController.getListCategory)
  .get(adminAuth, categoryController.getListCategory);

router.route('/categories/:id/unlist')
  .patch(adminAuth, categoryController.getUnListCategory)
  .get(adminAuth, categoryController.getUnListCategory);

// Legacy category routes
router.route('/addCategoryOffer')
  .post(adminAuth, categoryController.addCategoryOffer);

router.route('/removeCategoryOffer')
  .post(adminAuth, categoryController.removeCategoryOffer);

router.route('/listCategory')
  .get(adminAuth, categoryController.getListCategory);

router.route('/unlistCategory')
  .get(adminAuth, categoryController.getUnListCategory);

router.route('/editCategory')
  .get(adminAuth, categoryController.getEditCategory);

router.route('/editCategory/:id')
  .post(adminAuth, categoryController.editCategory)
  .put(adminAuth, categoryController.editCategory);

/* ==========================================================================
   Product Management
   ========================================================================== */
router.route('/products')
  .get(adminAuth, productController.getAllProducts)
  .post(adminAuth, uploads.array('images', 4), productController.addProducts);

router.route('/products/add')
  .get(adminAuth, productController.getProductAddpage);

// Legacy add product aliases
router.route('/addProducts')
  .get(adminAuth, productController.getProductAddpage)
  .post(adminAuth, uploads.array('images', 4), productController.addProducts);

router.route('/products/:id')
  .get(adminAuth, productController.getEditProduct)
  .put(adminAuth, uploads.array('images', 4), productController.editProduct)
  .post(adminAuth, uploads.array('images', 4), productController.editProduct);

router.route('/products/:id/offer')
  .post(adminAuth, productController.addProductOffer)
  .delete(adminAuth, productController.removeProductOffer);

router.route('/products/:id/block')
  .patch(adminAuth, productController.blockProduct)
  .get(adminAuth, productController.blockProduct);

router.route('/products/:id/unblock')
  .patch(adminAuth, productController.unblockProduct)
  .get(adminAuth, productController.unblockProduct);

router.route('/products/:id/images')
  .delete(adminAuth, productController.deleteSingleImage)
  .post(adminAuth, productController.deleteSingleImage);

// Legacy product routes
router.route('/addProductOffer')
  .post(adminAuth, productController.addProductOffer);

router.route('/removeProductOffer')
  .post(adminAuth, productController.removeProductOffer);

router.route('/blockProduct')
  .get(adminAuth, productController.blockProduct)
  .patch(adminAuth, productController.blockProduct);

router.route('/unblockProduct')
  .get(adminAuth, productController.unblockProduct)
  .patch(adminAuth, productController.unblockProduct);

router.route('/editProduct')
  .get(adminAuth, productController.getEditProduct);

router.route('/editProduct/:id')
  .post(adminAuth, uploads.array('images', 4), productController.editProduct)
  .put(adminAuth, uploads.array('images', 4), productController.editProduct);

router.route('/deleteImage')
  .post(adminAuth, productController.deleteSingleImage)
  .delete(adminAuth, productController.deleteSingleImage);

/* ==========================================================================
   Order Management
   ========================================================================== */
router.route('/orders')
  .get(adminAuth, orderController.getOrderpage);

router.route('/orders/:id')
  .get(adminAuth, orderController.viewOrder)
  .patch(adminAuth, orderController.getUpdateOrder)
  .put(adminAuth, orderController.getUpdateOrder)
  .delete(adminAuth, orderController.deleteOrder);

router.route('/orders/:id/status')
  .patch(adminAuth, orderController.getUpdateOrder)
  .post(adminAuth, orderController.getUpdateOrder);

router.route('/orders/:orderId/approve-return')
  .patch(adminAuth, orderController.approveReturn)
  .post(adminAuth, orderController.approveReturn);

router.route('/orders/:orderId/reject-return')
  .patch(adminAuth, orderController.rejectReturn)
  .post(adminAuth, orderController.rejectReturn);

// Legacy order routes
router.route('/view-order/:id')
  .get(adminAuth, orderController.viewOrder);

router.route('/update-order-status/:id')
  .post(adminAuth, orderController.getUpdateOrder);

router.route('/delete-order/:id')
  .post(adminAuth, orderController.deleteOrder)
  .delete(adminAuth, orderController.deleteOrder);

router.route('/approve-return/:orderId')
  .post(adminAuth, orderController.approveReturn);

router.route('/reject-return/:orderId')
  .post(adminAuth, orderController.rejectReturn);

/* ==========================================================================
   Coupon Management
   ========================================================================== */
router.route('/coupons')
  .get(adminAuth, couponController.getCoupon)
  .post(adminAuth, couponController.createCoupon);

router.route('/coupons/:id')
  .get(adminAuth, couponController.editCoupon)
  .put(adminAuth, couponController.updateCoupon)
  .delete(adminAuth, couponController.deleteCoupon);

// Legacy coupon routes
router.route('/Coupon')
  .get(adminAuth, couponController.getCoupon);

router.route('/createCoupon')
  .post(adminAuth, couponController.createCoupon);

router.route('/editCoupon')
  .get(adminAuth, couponController.editCoupon);

router.route('/updateCoupon')
  .post(adminAuth, couponController.updateCoupon);

router.route('/deleteCoupon')
  .get(adminAuth, couponController.deleteCoupon)
  .delete(adminAuth, couponController.deleteCoupon);

/* ==========================================================================
   Sales Management
   ========================================================================== */
router.route('/sales-report')
  .get(adminAuth, salesController.getSalesReport);

router.route('/salesReport')
  .get(adminAuth, salesController.getSalesReport);

/* ==========================================================================
   Wallet Management
   ========================================================================== */
router.route('/wallets')
  .get(adminAuth, walletController.getAllWallets);

router.route('/wallets/:userId')
  .get(adminAuth, walletController.getUserWallet);

router.route('/wallets/:userId/credit')
  .post(adminAuth, walletController.creditWallet)
  .patch(adminAuth, walletController.creditWallet);

router.route('/wallets/:userId/debit')
  .post(adminAuth, walletController.debitWallet)
  .patch(adminAuth, walletController.debitWallet);

module.exports = router;
