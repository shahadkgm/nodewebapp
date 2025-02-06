const User=require("../../models/userschema");
const nodemailer=require("nodemailer");
const Category=require("../../models/categorySchema");
const Product=require("../../models/productSchema")
const env=require("dotenv").config();
const bcrypt=require("bcrypt");
const product = require("../../models/productSchema");
const Order=require("../../models/orderSchema")
const Address=require("../../models/addressSchema")





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
const loadShoppingPage=async (req, res) => {

    try {
        const userId=req.session.user;



      const query = req.query.query || ""; 
      const sort = req.query.sort || "popularity"; 
      const page = parseInt(req.query.page) || 1;
      const limit = 10; 

      const category=await Category.find();
  
      const searchFilter = query
        ? { productName: { $regex: query, $options: "i" } }
        : {};
  
      // Sorting options
      let sortOptions = {};
      switch (sort) {
        case "popularity":
          sortOptions = { popularity: -1 }; 
          break;
        case "priceLowHigh":
          sortOptions = { salePrice: 1 };
          break;
        case "priceHighLow":
          sortOptions = { salePrice: -1 };
          break;
        case "avgRating":
          sortOptions = { avgRating: -1 }; 
          break;
        case "featured":
          sortOptions = { isFeatured: -1 }; 
          break;
        case "newArrivals":
          sortOptions = { createdAt: -1 };
          break;
        case "aToZ":
          sortOptions = { productName: 1 };
          break;
        case "zToA":
          sortOptions = { productName: -1 };
          break;
        default:
          sortOptions = { popularity: -1 };
      }
  
      const totalProducts = await Product.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalProducts / limit);

      
  
      const products = await Product.find(searchFilter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit);

        const user=await User.findById(userId)
  
      res.render("shop", {
        products,
        currentPage: page,
        totalPages,
        sort,
        category,
        query,
        user,
        

        
      });
    } catch (error) {
      console.error("Error fetching shop page:", error);
      res.status(500).send("Something went wrong.");
    }
  };


const filterProduct=async(req,res)=>{
   
   try {
    const user=req.session.user;
    const category =req.query.category;
    const findCategory=category?await Category.findOne({_id:category}):null;
    const query={
        isBlocked:false,
        quantity:{$gt:0}
    }
    if(findCategory){
        query.category=findCategory._id;
    }
    let findProducts=await Product.find(query).lean();
    findProducts.sort((a,b)=>new Date(b.createOn)-new Date(a.createdOn));
    const categories=await Category.find({isListed:true});
    let itemsPerPage=6;
    let currentPage=parseInt(req.query.page)||1;
    let startIndex=(currentPage-1)* itemsPerPage;
    let endIndex=startIndex+itemsPerPage;
    let totalPages=Math.ceil(findProducts.length/itemsPerPage);
    const currentProduct=findProducts.slice(startIndex,endIndex);
    let userData=null;
    if(user){
       userData=await User.findOne ({_id:user});
       if(userData){
        const searchEntry={
            category:findCategory?findCategory._id:null,
            searchOn: new Date()
        }
        userData.searchHistory.push(searchEntry);
        await userData.save()
       }
    }
    req.session.filteredProducts=currentProduct;
    res.render("shop", {
        user: userData,
        products: currentProduct,
        totalPages,
        currentPage,
        category: category || null,
        sort: req.query.sort || "popularity",
    });
    
    

   } catch (error) {
    console.error(error,"from filter page")
    res.redirect('/pageNotFound')
    
   }
    
};
const filterByPrice=async(req,res)=>{
    const { price } = req.query;

    let filterCondition = {};
  
    if (price) {
      if (price === 'under500') {
        filterCondition.salePrice = { $lt: 500 };
      } else if (price === '500-1000') {
        filterCondition.salePrice = { $gte: 500, $lt: 1000 };
      } else if (price === '1000-1500') {
        filterCondition.salePrice = { $gte: 1000, $lt: 1500 };
      } else if (price === 'above1500') {
        filterCondition.salePrice = { $gte: 1500 };
      }
    }
  
    try {
      const products = await Product.find(filterCondition);
      res.render('shop', { 
        products,
        currentPage: 1,
        totalPages: 1, // Adjust based on pagination logic
        category: await Category.find(), // Adjust if you're passing categories
        sort: req.query.sort || "popularity",
    });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
};
const loadProductDetail = async (req, res) => {

    const productId = req.params.id; 
    const userId=req.session.user
  
    try {
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
      const relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: productId }, // Exclude the current product
      }).limit(5);
  
      const productData = {
        id:product._id,
        productImages: product.productImage || [],         
        name: product.productName, 
        description: product.description, 
        salePrice: product.salePrice, 
        regularPrice: product.regularPrice, 
        discount: product.regularPrice - product.salePrice, 
        stock: product.quantity > 0 ? product.quantity : 'Out of Stock', 
        relatedProducts:relatedProducts
      };
      console.log(product.quantity,"product quantity in get product detail pag")
  const user= await User.findById(userId)
      res.render('product-detail', { product: productData,
        products:product,relatedProducts,user
       });
    } catch (error) {
      console.error('Error loading product detail:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  const getProductDetail = async (req, res) => {
    const productId = req.params.id; 
  
    try {
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      res.json(product);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  




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
    loadShoppingPage,
    filterProduct,
    filterByPrice,
    loadProductDetail,
    getProductDetail,
   
   


}
