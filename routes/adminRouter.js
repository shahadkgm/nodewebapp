const express = require("express");
const router = express.Router();

// Controllers
const adminController = require("../controller/admin/adminController");
const customerController = require("../controller/admin/customerController");
const categoryController = require("../controller/admin/categoryController");
const productController = require("../controller/admin/productController");
const orderController = require("../controller/admin/orderConroller");
const couponController = require("../controller/admin/couponController");
const salesController = require("../controller/admin/salesController");
const walletController = require("../controller/admin/walletController");

// Middlewares
const { adminAuth, userAuth } = require("../middlewares/auth");
const uploads = require("../util/Multer");

/* ==========================================================================
   STATIC ROUTES (Defined first to prevent parameter shadowing)
   ========================================================================== */

// --- Authentication & Dashboard ---
router.get("/pageerror", adminController.pageerror);
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/logout", adminController.logout);
router.get("/", adminAuth, adminController.loadDashboard);

// --- Customer Management (Static) ---
router.get("/users", adminAuth, customerController.customerInfo);
router.get("/customers", adminAuth, customerController.customerInfo); // RESTful alias
router.get("/blockCustomer", adminAuth, customerController.customerBlocked);
router.get("/unblockCustomer", adminAuth, customerController.customerunBlocked);

// --- Category Management (Static) ---
router.get("/category", adminAuth, categoryController.categoryInfo);
router.get("/categories", adminAuth, categoryController.categoryInfo); // RESTful alias
router.post("/addCategory", adminAuth, categoryController.addCategory);
router.post("/categories", adminAuth, categoryController.addCategory); // RESTful alias
router.post("/addCategoryOffer", adminAuth, categoryController.addCategoryOffer);
router.post("/removeCategoryOffer", adminAuth, categoryController.removeCategoryOffer);
router.get("/listCategory", adminAuth, categoryController.getListCategory);
router.get("/unlistCategory", adminAuth, categoryController.getUnListCategory);
router.get("/editCategory", adminAuth, categoryController.getEditCategory);

// --- Product Management (Static) ---
router.get("/products", adminAuth, productController.getAllProducts); // RESTful
router.get("/addProducts", adminAuth, productController.getProductAddpage);
router.get("/products/add", adminAuth, productController.getProductAddpage); // RESTful alias
router.post("/addProducts", adminAuth, uploads.array("images", 4), productController.addProducts);
router.post("/products", adminAuth, uploads.array("images", 4), productController.addProducts); // RESTful alias
router.post("/addProductOffer", adminAuth, productController.addProductOffer);
router.post("/removeProductOffer", adminAuth, productController.removeProductOffer);
router.get("/blockProduct", adminAuth, productController.blockProduct);
router.get("/unblockProduct", adminAuth, productController.unblockProduct);
router.get("/editProduct", adminAuth, productController.getEditProduct);
router.post("/deleteImage", adminAuth, productController.deleteSingleImage);

// --- Order Management (Static) ---
router.get("/orders", adminAuth, orderController.getOrderpage); // RESTful

// --- Coupon Management (Static) ---
router.get("/Coupon", adminAuth, couponController.getCoupon);
router.get("/coupons", adminAuth, couponController.getCoupon); // RESTful alias
router.post("/createCoupon", adminAuth, couponController.createCoupon);
router.post("/coupons", adminAuth, couponController.createCoupon); // RESTful alias
router.get("/editCoupon", adminAuth, couponController.editCoupon);
router.post("/updateCoupon", adminAuth, couponController.updateCoupon);
router.get("/deleteCoupon", adminAuth, couponController.deleteCoupon);

// --- Sales Management (Static) ---
router.get("/sales-report", adminAuth, salesController.getSalesReport); // RESTful
router.get("/salesReport", adminAuth, salesController.getSalesReport); // Legacy alias

// --- Wallet Management (Static) ---
router.get("/wallets", walletController.getAllWallets); // RESTful

/* ==========================================================================
   DYNAMIC / PARAMETERIZED ROUTES (Defined after static routes)
   ========================================================================== */

// --- Category Dynamic Routes ---
router.post("/editCategory/:id", adminAuth, categoryController.editCategory);
router.put("/categories/:id", adminAuth, categoryController.editCategory); // RESTful alias
router.post("/categories/:id", adminAuth, categoryController.editCategory); // RESTful alias

// --- Product Dynamic Routes ---
router.post("/editProduct/:id", adminAuth, uploads.array("images", 4), productController.editProduct);
router.put("/products/:id", adminAuth, uploads.array("images", 4), productController.editProduct); // RESTful alias
router.post("/products/:id", adminAuth, uploads.array("images", 4), productController.editProduct); // RESTful alias

// --- Order Dynamic Routes ---
router.get("/view-order/:id", adminAuth, orderController.viewOrder);
router.get("/orders/:id", adminAuth, orderController.viewOrder); // RESTful alias
router.post("/update-order-status/:id", adminAuth, orderController.getUpdateOrder);
router.patch("/orders/:id/status", adminAuth, orderController.getUpdateOrder); // RESTful alias
router.post("/delete-order/:id", adminAuth, orderController.deleteOrder);
router.delete("/orders/:id", adminAuth, orderController.deleteOrder); // RESTful alias
router.post("/approve-return/:orderId", adminAuth, orderController.approveReturn);
router.post("/orders/:orderId/approve-return", adminAuth, orderController.approveReturn); // RESTful alias
router.post("/reject-return/:orderId", adminAuth, orderController.rejectReturn);
router.post("/orders/:orderId/reject-return", adminAuth, orderController.rejectReturn); // RESTful alias

// --- Wallet Dynamic Routes ---
router.get("/wallets/:userId", walletController.getUserWallet); // RESTful
router.post("/wallets/:userId/credit", walletController.creditWallet); // RESTful
router.post("/wallets/:userId/debit", walletController.debitWallet); // RESTful

module.exports = router;
