const User=require("../../models/userschema.js");
const nodemailer=require("nodemailer")
const bcrypt=require("bcrypt");
const env=require("dotenv").config();
const session=require("express-session");
const Address =require("../../models/addressSchema.js")
const Order=require('../../models/orderSchema')
const Product = require('../../models/productSchema');

// const { changeEmail } = require("./userController");

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
    console.log("get reset pass")
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
        console.log(email)
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
};
const userProfile = async (req, res) => {
    try {
        const userId = req.session.user;

        const query = req.query.query || "";
        const page = parseInt(req.query.page) || 1; 
        const limit = 10; 
        const activeTab=req.query.tab||"dashboard";

        const searchFilter = query
            ? { userId, "orderedItems.productName": { $regex: query, $options: "i" } }
            : { userId };

        const totalOrders = await Order.countDocuments(searchFilter);

        const orders = await Order.find(searchFilter)
            .populate("orderedItems.product")
            .sort({ createdAt: 1 }) 
            .skip((page - 1) * limit) 
            .limit(limit); 

        const userAddress = await User.findById(userId);
        const address = await Address.findOne({ userId: userAddress._id });

        const totalPages = Math.ceil(totalOrders / limit);

        res.render("profile", {
            userAddress: address,
            user: userAddress,
            orders, // Paginated orders
            totalPages,
            query,
            currentPage: page,
            activeTab
        });
    } catch (error) {
        console.error("Error retrieving profile data:", error);
        res.redirect("/pageNotFound");
    }
};

const changeEmailValid= async(req,res)=>{
    try {
        const {email}=req.body;
        const userExists=await User.findOne({email});
        if(userExists){
            const otp = generateOtp();
            const emailSend=await sendVerificationEmail(email,otp);
            if(emailSend){
                req.session.userOtp=otp;
                req.session.userData=req.body;
                req.session.email=email;
                res.render("change-email-otp");
                console.log("email",email);
                console.log("otp",otp)

            }else{
                res.json("email-error")
            }
        }else{
            res.render("change-email",{
                message:"User with this email not exist"
            })
        }
    } catch (error) {
        res.redirect("/pageNotFound")
        
    }

};
const changeEmail=async(req,res)=>{
    try {
        res.render("change-email")
    } catch (error) {

        res.redirect("/pageNotFound")
        
    }

};
const verifyEmailOtp=async(req,res)=>{
    try {
        const enteredOtp=req.body.otp;
        if(enteredOtp===req.session.userOtp){
            req.session.userData=req.body.userData;
            res.render("new-email",{
                userData:req.session.userData,

            })
        }else{
            res.render("change-email-otp",{
                message:"OTP not matching",
                userData:req.session.userData
            })
        }
    } catch (error) {
        res.redirect("/pageNotFound")
        
    }
};
const updateEmail=async(req,res)=>{
    try {
        const newEmail=req.body.newEmail;
        const userId=req.session.user;
        await User.findByIdAndUpdate(userId,{email:newEmail});
        res.redirect("/userProfile")
    } catch (error) {
        res.redirect("/pageNotFound")
        
    }
}

const changePassword = async (req, res) => {
    try {
      const userData=req.session.user;
      console.log("email",userData)
        res.render("u-reset-password",{userData});
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.redirect("/pageNotFound");
    }
};

const changePasswordValid = async (req, res) => {
    console.log("Change Password Validation");
    try {
        const userId = req.session.user;
        const { newPass1, newPass2 } = req.body;

        if (!userId) {
            return res.status(401).render("u-reset-password", {
                message: "User session expired. Please log in again.",
            });
        }

        if (!newPass1 || !newPass2) {
            return res.status(400).render("u-reset-password", {
                message: "Both password fields are required.",
            });
        }

        // Ensure new passwords match
        if (newPass1 !== newPass2) {
            return res.render("u-reset-password", {
                message: "Passwords do not match.",
            });
        }

        const passwordHash = await securePassword(newPass1);

        await User.updateOne(
            { _id: userId },
            { $set: { password: passwordHash } }
        );

        console.log(`Password updated successfully for user ID: ${userId}`);
        req.session.destroy(); // Optionally log the user out after a password change
        return res.redirect("/login");

    } catch (error) {
        console.error("Error in changePasswordValid:", error);
        return res.redirect("/pageNotFound");
    }
};


const verifyChangePassOtp=async(req,res)=>{
    try {
        const enteredOtp=req.body.otp;
        const userOtp=req.session.userOtp;
        console.log("entered Otp",enteredOtp)
        if(enteredOtp===userOtp ){
            console.log("if in verify")
            res.json({succuss:true,redirectUrl:"/reset-password"})
        }else{
            res.json({succuss:false,message:"Otp not matching"})
        }
    } catch (error) {
        console.error("error in verify otp",error)
        res.status(500).json({succuss:false,message:"an error occured please try again later"})
        
    }
};

const addAddress=async(req,res)=>{
    try {
        const user=req.session.user;
        res.render("add-address",{user:user})

    } catch (error) {
        res.redirect("/pageNotFound")
        
    }
}
const postAddAddress=async(req,res)=>{
    try {
        const userId=req.session.user;
        const userData=await User.findOne({_id:userId})
        const {addressType,name,city,landMark,state,pincode,phone,altPhone}=req.body;
        const userAddress=await Address.findOne({userId:userData._id});
        if(!userAddress){
            const newAddress=new Address({
                userId:userData._id,
                address:[{addressType,name,city,landMark,state,pincode,phone,altPhone}]
            });
            await newAddress.save();
        }else{
            userAddress.address.push({addressType,name,city,landMark,state,pincode,phone,altPhone});
            await userAddress.save();

        }
        res.redirect("/userProfile")
    } catch (error) {
        console.error("Error adding address",error);

        res.redirect("/pageNotFound")
    }
};
const editAddress=async(req,res)=>{
    try {
        
        const addressId = req.params.id;
        const address = await Address.findOne({ "address._id": addressId }, { "address.$": 1 });

        if (address) {
            res.render('edit-address', { address: address.address[0] });
        } else {
            res.redirect('/pageNotFound');
        }
    } catch (error) {
        console.error('Error fetching address:', error);
        res.redirect('/pageNotFound');
    }
};
const postEditAddress =async(req,res)=>{
    try {
        const addressId = req.params.id;
        const { name, city, landmark, state, pincode, phone, altPhone } = req.body;

        await Address.updateOne(
            { "address._id": addressId },
            {
                $set: {
                    "address.$.name": name,
                    "address.$.city": city,
                    "address.$.landmark": landmark,
                    "address.$.state": state,
                    "address.$.pincode": pincode,
                    "address.$.phone": phone,
                    "address.$.altPhone": altPhone,
                },
            }
        );

        res.redirect('/userProfile');
    } catch (error) {
        console.error('Error updating address:', error);
        res.redirect('/pageNotFound');
    }
};
const deleteAddress=async(req,res)=>{
    try {
        const addressId = req.params.id;

        await Address.updateOne(
            { "address._id": addressId },
            { $pull: { address: { _id: addressId } } }
        );

        res.redirect('/userProfile');
    } catch (error) {
        console.error('Error deleting address:', error);
        res.redirect('/pageNotFound');
    }
}


module.exports={
    getfForgotPassPage,
    forgotEmailValid,
    verifyForgotPassOtp,
    getResetPassPage,
    resendOtp,
    postNewPassword,
    userProfile,
    changeEmail,
    changeEmailValid,
    verifyEmailOtp,
    updateEmail,
    changePassword,
    changePasswordValid,
    verifyChangePassOtp,
    addAddress,
    postAddAddress,
    editAddress,
    postEditAddress,
    deleteAddress

}
