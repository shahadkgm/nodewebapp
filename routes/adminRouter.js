const express=require("express");
const router=express.Router();
const adminController=require("../controller/admin/adminController");
const customerController=require("../controller/admin/customerController")
const categoryController=require("../controller/admin/categoryController")
const productController=require("../controller/admin/productController")
const orderController=require("../controller/admin/orderConroller")
const couponController=require("../controller/admin/couponController")
const salesController=require("../controller/admin/salesController")
const walletController=require("../controller/admin/walletController")

const {adminAuth,userAuth}=require("../middlewares/auth");
const uploads=require("../util/Multer")


router.get("/pageerror",adminController.pageerror)

router.get("/login",adminController.loadLogin);
router.post("/login",adminController.login)
router.get("/",adminAuth,adminController.loadDashboard)
router.get("/logout",adminController.logout)

// Customer managment
router.get('/users',adminAuth,customerController.customerInfo);
router.get('/blockCustomer',adminAuth,customerController.customerBlocked)
router.get('/unblockCustomer',adminAuth,customerController.customerunBlocked)

//category  management

router.get("/category",adminAuth,categoryController.categoryInfo)
router.post("/addCategory",adminAuth,categoryController.addCategory);
router.post("/addCategoryOffer",adminAuth,categoryController.addCategoryOffer)
router.post("/removeCategoryOffer",adminAuth,categoryController.removeCategoryOffer);
router.get("/listCategory",adminAuth,categoryController.getListCategory);
router.get("/unlistCategory",adminAuth,categoryController.getUnListCategory);
router.get("/editCategory",adminAuth,categoryController.getEditCategory);
router.post("/editCategory/:id",adminAuth,categoryController.editCategory);

//product management

router.get("/addProducts",adminAuth,productController.getProductAddpage)
router.post("/addProducts",adminAuth,uploads.array("images",4),productController.addProducts);
router.get("/products",adminAuth,productController.getAllProducts);
router.post("/addProductOffer",adminAuth,productController.addProductOffer);
router.post("/removeProductOffer",adminAuth,productController.removeProductOffer);
router.get("/blockProduct", adminAuth, productController.blockProduct);
router.get("/unblockProduct", adminAuth, productController.unblockProduct);
router.get("/editProduct",adminAuth,productController.getEditProduct)
router.post('/editProduct/:id',adminAuth,uploads.array("images",4),productController.editProduct);
router.post('/deleteImage',adminAuth,productController.deleteSingleImage)


router.get("/orders",adminAuth,orderController.getOrderpage)
router.post("/update-order-status/:id", adminAuth, orderController.getUpdateOrder);
router.post("/delete-order/:id", adminAuth, orderController.deleteOrder);
router.get('/view-order/:id',adminAuth,orderController.viewOrder);
router.post('/approve-return/:orderId',adminAuth,orderController.approveReturn);
router.post('/reject-return/:orderId',adminAuth,orderController.rejectReturn);


//coupen
router.get("/Coupon",adminAuth,couponController.getCoupon);
router.post("/createCoupon",adminAuth,couponController.createCoupon)
router.get ("/editCoupon",adminAuth,couponController.editCoupon)
router.post("/updateCoupon",adminAuth,couponController.updateCoupon)
router.get("/deleteCoupon",adminAuth,couponController.deleteCoupon)





//sales
// router.get("/salesReport",adminAuth,salesController.getSalesReport)
router.get('/sales-report', adminAuth, salesController.getSalesReport);


router.get('/wallets', walletController.getAllWallets);
// specefic user
router.get('/wallets/:userId', walletController.getUserWallet);

router.post('/wallets/:userId/credit', walletController.creditWallet);

router.post('/wallets/:userId/debit', walletController.debitWallet);
module.exports=router;