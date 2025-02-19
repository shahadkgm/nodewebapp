const express=require('express');
const router=express.Router();
const passport=require("passport")
const userController=require("../controller/user/userController");
const profileController=require("../controller/user/profileController")
const {adminAuth,userAuth}=require("../middlewares/auth");
// const User=require("../models/userschema");
// const Order=require("../models/orderSchema")

router.get("/",userController.loadHomepage)
router.get('/logout',userController.logout)

router.get("/pageNotFound",userController.pageNoTFound);

router.get("/signup",userController.loadSignup)
router.post("/signup",userController.signup)
router.post("/verify-otp",userController.verifyOtp)
router.post("/resend-otp",userController.resendOtp)
router.get('/auth/google',userAuth,passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
});

router.get('/login',userController.loadlogin)
router.post('/login',userController.login)


router.get('/shop',(req,res)=>{
    res.render('shop')
});
router.get('/home',(req,res)=>{
    res.render("home")
})
//profile management

router.get('/forgot-password',profileController.getfForgotPassPage)
router.post("/forgot-email-valid",profileController.forgotEmailValid)
router.post('/verify-passForgot-otp',profileController.verifyForgotPassOtp)
router.get('/reset-password',profileController.getResetPassPage)
router.post('/reset-password',profileController.postNewPassword)
// router.get('/profile',userController.getUserProfile)
router.post('/resend-forgot-otp',profileController.resendOtp)
router.get('/userProfile',userAuth,profileController.userProfile)
router.get('/change-email',userAuth,profileController.changeEmail)
// router.get('/change-password',userAuth,profileController.changePassword)
router.post("/change-email",userAuth,profileController.changeEmailValid)
router.post("/verify-email-otp",userAuth,profileController.verifyEmailOtp)
router.post("/update-email",userAuth,profileController.updateEmail)
router.get("/change-password",userAuth,profileController.changePassword)
router.post("/change-password",userAuth,profileController.changePasswordValid)
router.post("/verify-changepassword-otp",userAuth,profileController.verifyChangePassOtp)

//address Management

router.get("/address",userAuth,profileController.addAddress)
router.post("/addAddress",userAuth,profileController.postAddAddress)
 router.get('/edit-address/:id',userAuth,profileController.editAddress)
 router.post('/edit-address/:id',userAuth,profileController.postEditAddress)
 router.post('/delete-address/:id',userAuth,profileController.deleteAddress)

 //


module.exports=router;
