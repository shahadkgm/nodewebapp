const express=require('express');
const router=express.Router();
const passport=require("passport")
const userController=require("../controller/user/userController");
const profileController=require("../controller/user/profileController")
// const User=require("../models/userschema");
// const Order=require("../models/orderSchema")

router.get("/",userController.loadHomepage)
router.get('/logout',userController.logout)

router.get("/pageNotFound",userController.pageNoTFound);

router.get("/signup",userController.loadSignup)
router.post("/signup",userController.signup)
router.post("/verify-otp",userController.verifyOtp)
router.post("/resend-otp",userController.resendOtp)
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
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

router.get('/forgot-password',profileController.getfForgotPassPage)
router.post("/forgot-email-valid",profileController.forgotEmailValid)
router.post('/verify-passForgot-otp',profileController.verifyForgotPassOtp)
router.get('/reset-password',profileController.getResetPassPage)
router.get('/profile',userController.getUserProfile)
router.post('/resend-forgot-otp',profileController.resendOtp)
router.post('/reset-password',profileController.postNewPassword)

module.exports=router;
