const User=require("../../models/userschema");
const nodemailer=require("nodemailer")
const bcrypt=require("bcrypt");
const env=require("dotenv").config();
const session=require("express-session");

function generateOtp(){
    const digits="1234567890";
    let otp="";
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)]
    }
    return otp;
}


const sendVerificationEmail=async(email,otp)=>{
    try {
        const transporter=nodemailer.createTransport({
          service:"gmail",
          port:587,
          secure:false,
          requireTLS:true,
          auth:{
            user:process.env.NODEMAILER_EMAIL,
            pass:process.env.NODEMAILER_PASSWORD,

          }  
        })
        const mailOptions={
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subjuct:"Your Otp for Password reset",
            text:`your OTP is ${otp}`,
            html:`<b><h4>Your OTP:${otp}</h4></b>`

        }
        //for senting above information

        const info=await transporter.sendMail(mailOptions);
        console.log("Email sent:",info.messageId);
        return true;

    } catch (error) {
    console.error("Error Senting Email",error);
    return false   
    }
}
const securePassword=async(password)=>{
try {
    const passwordHash=await bcrypt.hash(password,10);
    return passwordHash;
} catch (error) {
    
}
}

const getfForgotPassPage=async(req,res)=>{
    try {
        res.render("forgot-password")
    } catch (error) {
        console.log("error in frgt passwrd",error)
    }
};
const forgotEmailValid=async(req,res)=>{
    try {
        const{ email}=req.body;
        const findUser=await User.findOne({email:email});
        if(findUser){
            const otp=generateOtp()
             const emailSent =await sendVerificationEmail(email,otp);
             if(emailSent){
                req.session.userOtp=otp;
                req.session.email=email;
                res.render("forgotPass-otp");
                console.log("OTP",otp);
             }else{
                res.json({success:false,message:"Failed to send OTP .please try again"});
             }
        }else{
            res.render("forgot-password",{
                message:"User with this email does't exist"
            });
        }

    } catch (error) {
        res.redirect("/pageNotFound");
        
    }
};

const verifyForgotPassOtp=async(req,res)=>{
    console.log("verifyfrgtpassOtp")
    try {
       const enterOtp=req.body.otp;
       if(enterOtp===req.session.userOtp){
        res.json({success:true,redirectUrl:"/reset-password"});
       } else{
        res.json({success:false,message:"otp didnt match"})
       }
    } catch (error) {
        res.status(500).json({success:false,message:'An error Occured,try again man'});
    }
};
const getResetPassPage=async (req,res)=>{
    console.log("getrest pass")
    try {
      res.render("reset-password");  
    } catch (error) {
        console.error("error in get reset pass",error)
        res.redirect("/pageNotFound")

    }
};
const resendOtp=async(req,res)=>{
    try {
const otp=generateOtp();
req.session.userOtp=otp;
const email=req.session.email;
console.log("Resending otp to email",email);
const emailSend=await sendVerificationEmail(email,otp)
if(emailSend){
    console.log("resend otp:otp")
    res.status(200).json({success:true,message:"resend otp successfull"})
}
    } catch (error) {
        console.error("error in resend otp",error);
        res.status(500).json({success:false,message:"Internal server error"})
        
    }
};
const postNewPassword=async(req,res)=>{
    try{
        const {newPass1,newPass2}=req.body;
        const {email}=req.session;
        console.log(newPass1,newPass2)
        if(newPass1===newPass2){
            const passwordHash=await securePassword(newPass1);
            await User.updateOne(
                {email:email},
                {$set:{password:passwordHash}}
            )
            res.redirect("/login");
        }else{
            res.render("reset-password",{mesage:'password do not match'});
        }
        
    }catch(error){
        console.error("postnew passwrOd",error)
        res.redirect("/pageNotFound")

    }
}



module.exports={
    getfForgotPassPage,
    forgotEmailValid,
    verifyForgotPassOtp,
    getResetPassPage,
    resendOtp,
    postNewPassword

}
