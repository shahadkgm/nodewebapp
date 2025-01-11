const express=require('express');
const router=express.Router();
const passport=require("passport")
const userController=require("../controller/user/userController")

router.get("/pageNotFound",userController.pageNoTFound);
router.get("/pagenotfound",userController.pageNoTFound)
router.get("/",userController.loadHomepage)
router.get("/signup",userController.loadSignup)
router.post("/signup",userController.signup)
router.post("/verify-otp",userController.verifyOtp)
router.post("/resend-otp",userController.resendOtp)

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));

router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
});
router.get('/login',userController.loadlogin)
// router.get("/pp",userController.loadHomepage)
router.post('/login',userController.login)
router.get('/logout',userController.logout)


module.exports=router;
