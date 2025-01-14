const User=require("../../models/userschema");
const nodemailer=require("nodemailer");
const Category=require("../../models/categorySchema");
const Product=require("../../models/productSchema")
const env=require("dotenv").config();
const bcrypt=require("bcrypt");
const product = require("../../models/productSchema");
const Order=require("../../models/orderSchema")





const pageNoTFound = async (req, res) => {
    try {
        res.render("error");
    } catch (error) {
        console.log(error);
        res.redirect("/pageNotFound");
    }
}

const loadHomepage = async (req, res) => {
    try {
        const user=req.session.user;
//         const categories=await Category.find({isListed:true});
//         const productData=await Product.find({isBlocked:false,category:{$in:categories.map(category=>category._id)},quantity:{$gt:0}})
// productData.sort((a,b)=>new Date(b.createOn)-new Date(a.createOn));
// productData=productData.slice(0,4);
    if(user){
        const userData= await User.findOne({_id:user});
        res.render("home",{user:userData})
    }else{
        return res.render('home')
    }
        
    } catch (error) {
        console.log("home page not loading",error);
        res.status(500).send("Server Error");
    }
}

const loadSignup = async (req, res) => {
    try {
        return res.render('signup');
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

function generateOtp(){
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);  // Add this line
    return otp;
}


async function sendVerificationEmail(email,otp){
    try {
        const transporter=nodemailer.createTransport({
           service:'gmail',
           port :587,
           secure:false,
           requireTLS:true,
           auth:{
       user:process.env.NODEMAILER_EMAIL,
        pass:process.env.NODEMAILER_PASSWORD
           }
        })
      const info =await transporter.sendMail({
        from:process.env.NODEMAILER_EMAIL,
        to:email,
        subject:"verify your account",
        text:`your OTP is ${otp}`,
        html:`<b> your OTP:${otp}</b>`,
      })
      return info.accepted.length>0


    } catch (error) {
     console.error("sending email",error) ;
     return false; 
        
    }
}


const signup=async(req,res)=>{
    try {
        console.log("signup called")
       const {name,phone,email,password,cpassword}=req.body;
       console.log("recieved data",email,password,cpassword)
       if(password!==cpassword){
        console.log("password didnt match")
        return res.render("signup",{message:"password didnt match"});
       }
       const findUser=await User.findOne({email})
       if(findUser){
        console.log("User already exists");
        return res.render("signup",{message:"User exist already exist"})
       }
const otp=generateOtp();

const emailsent=await sendVerificationEmail(email,otp);

if(!emailsent){
    console.log("failed to send email")
    return res.json("email-error")
}else{
    console.log("email send ")
}
req.session.userOtp=otp;
req.session.userData={name,phone,email,password};


// res,render("verify-otp")
res.render("verify-otp")
console.log("otp sent",otp)
    } catch (error) {
       console.error("signup error",error)
       res.redirect("/pageNotFound") 
    }
}
const securePassword=async (password)=>{
    try {
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash;
    } catch (error) {
        
    }
}



const verifyOtp=async (req,res)=>{
  try {
    const{otp}=req.body;
    console.log(otp);
    if(otp===req.session.userOtp){
        const user=req.session.userData
        const passwordHash=await securePassword(user.password);
        
        const saveUserData=new User({
           name:user.name,
           email:user.email,
           phone:user.phone,
           password:passwordHash,
        })
        await saveUserData.save();
        req.session.user=saveUserData._id ;
        res.json({ success: true, redirectUrl: "/" });    
    }else{
        res.status(400).json({success:false,message:"Invalid otp,please try again"})
    }

  } catch (error) {
    console.error("Error Verifying Otp",error);
    res.status(400).json({success:false,message:"An orrur occured"})
    
  }  
}
const resendOtp=async(req,res)=>{
    try {
        const {email}=req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }
        const otp= generateOtp();
        req.session.userOtp=otp;
        const emailSend=await sendVerificationEmail(email,otp);
        if(!emailSend){
            console.log("Resend Otp:",otp);
            res.status(200).json({success:true,message:"OTP Resend Successfully"})
        }else{
            res.status(500).json({success:false,message:"failed to resend otp.please try again "})
        }
    } catch (error) {
        console.error("Error resending OTP ",error)
        res.status(500).json({success:false,message:"Internal server Error.Please try again "})
    }
};

const loadlogin=async(req,res)=>{
    try {
        
        if(!req.session.user){
            return res.render("login")
        }else{
           res.redirect("/")
        }
    } catch (error) {
        res.redirect("/pageNotFound")
        
    }
};
const login=async(req,res)=>{
    try {
        console.log("login")
        const{email,password}=req.body;
        const findUser=await User.findOne({isAdmin:0,email:email});
        if(!findUser){
            return res.render("login",{message:"user Not found"})
        }
        if(findUser.isBlocked){
            return res.render("login",{message:"User is blocked by admin"})
        }
        const passwordMatch=await bcrypt.compare(password,findUser.password);
    if(!passwordMatch){
        return res.render("login",{message:"Incorrect Password"})
    }

    req.session.user=findUser._id;
    res.redirect("/")

    } catch (error) {
        console.error("login error",error);
        res.render("login",{message:"login failed"})
    }
}
const logout=async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                console.log("session destruction error",err.message);
                return res.redirect("/pageNot Found");
            }
            return res.redirect("/login")
        })
    } catch (error) {
        console.log("logout error",error);
        res.redirect("/pageNotFound")
        
    }
};
const getUserProfile=async(req,res)=>{
    try {
        const userId = req.session.user; // Assuming userId is stored in session
        const user = await User.findById(userId)   //.populate('User');  Assuming addresses is a ref
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        res.render('profile', { user, orders });
    } catch (error) {
        console.error('Error loading profile:', error);
        res.redirect('/pageNotFound');
    }

}




module.exports = {
    loadHomepage,
    pageNoTFound,
    loadSignup,
    signup,
    verifyOtp,
    resendOtp,
    loadlogin,
    login,
    logout,
    getUserProfile


}
