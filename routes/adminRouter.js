const express=require("express");
const router=express.Router();
const adminController=require("../controller/admin/adminController");
const customerController=require("../controller/admin/customerController")
const categoryController=require("../controller/admin/categoryController")
const productController=require("../controller/admin/productController")
const {adminAuth,userAuth}=require("../middlewares/auth");
const uploads=require("../util/Multer")


router.get("/pageerror",adminController.pageerror)

router.get("/login",adminController.loadLogin);
router.post("/login",adminController.login)
router.get("/",adminAuth,adminController.loadDashboard)
router.get("/logout",adminController.logout)


router.get('/users',adminAuth,customerController.customerInfo);
router.get('/blockCustomer',adminAuth,customerController.customerBlocked)
router.get('/unblockCustomer',adminAuth,customerController.customerunBlocked)


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
router.get("/blockProduct",adminAuth,productController.blockProduct)
router.get("/unblockProduct",adminAuth,productController.unblockProduct)




module.exports=router;