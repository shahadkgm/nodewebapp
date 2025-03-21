const User=require("../../models/userschema");
const nodemailer=require("nodemailer");
const Category=require("../../models/categorySchema");
const Product=require("../../models/productSchema")
const env=require("dotenv").config();
const bcrypt=require("bcrypt");
const product = require("../../models/productSchema");
const Order=require("../../models/orderSchema")
const Address=require("../../models/addressSchema")
const crypto=require("crypto")
const Coupon=require("../../models/couponSchema")



const generateReferralCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); 
  };


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
    console.log("Generated OTP:", otp);  
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
       const {name,phone,email,password,cpassword,referralCode}=req.body;
       console.log("recieved data",email,password,cpassword,referralCode)
       if(password!==cpassword){
        console.log("password didnt match")
        return res.render("signup",{message:"password didnt match"});
       }
       const findUser=await User.findOne({email})
       if(findUser){
        console.log("User already exists");
        return res.render("signup",{message:"User exist already exist"})
       }
     
       let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });

      if (!referrer) {
        console.log("Invalid referral code");
        return res.render("signup", { message: "Invalid referral code" });
      }
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
req.session.referralData = referrer ? { referrerId: referrer._id } : null;


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







const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log("Received OTP:", otp);

    if (otp === req.session.userOtp) {
      const userData = req.session.userData;
      const referralData = req.session.referralData;

      if (!userData) {
        return res.status(400).json({ success: false, message: "Session expired, please sign up again" });
      }

      const passwordHash = await securePassword(userData.password);

      const saveUserData = new User({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: passwordHash,
        referralCode: generateReferralCode()
      });

      await saveUserData.save();

      if (referralData && referralData.referrerId) {
        const referrer = await User.findById(referralData.referrerId);
        if (referrer) {

          referrer.redeemedUsers.push(saveUserData._id);

         
          const referrerReward = 50; 
          referrer.wallet = (referrer.wallet || 0) + referrerReward;
          referrer.walletHistory.push({
            type: 'credit',
            amount: referrerReward,
            description: `Referral reward for inviting ${saveUserData.email}`,
            date: new Date()
          });

          await referrer.save();
          console.log(`Referrer ${referrer.email} credited ₹${referrerReward}`);
        }

        const refereeReward = 30; 
        saveUserData.wallet = (saveUserData.wallet || 0) + refereeReward;
        saveUserData.walletHistory.push({
          type: 'credit',
          amount: refereeReward,
          description: `Welcome bonus for joining via referral from ${referrer ? referrer.email : 'unknown'}`,
          date: new Date()
        });

        await saveUserData.save();
        console.log(`Referee ${saveUserData.email} credited ₹${refereeReward}`);
      }

      req.session.user = saveUserData._id;
      req.session.userOtp = null;
      req.session.userData = null;
      req.session.referralData = null;

      res.json({ success: true, redirectUrl: "/" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
    }
  } catch (error) {
    console.error("Error Verifying OTP:", error);
    res.status(400).json({ success: false, message: "An error occurred" });
  }
};
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
   delete req.session.user
      // console.log("session destruction error",err);
      // if(err){
            //     return res.redirect("/pageNot Found");
            // }
             res.redirect("/login")
        
    } catch (error) {
        console.log("logout error",error);
        res.redirect("/pageNotFound")
        
    }
};

const loadShoppingPage = async (req, res) => {
  try {
    delete req.session.query
    const userId = req.session.user;
    // Store query in session but don't delete existing query
    const query = req.query.query || req.session.query || ""; 
    req.session.query = query;
    
    // Store category in session and retrieve from query or session
    const categoryId = req.query.category || req.session.categoryId || "";
    req.session.categoryId = categoryId;
    
    console.log("Query from loadShoppingPage:", query);
    console.log("Category from loadShoppingPage:", categoryId);

    const sort = req.query.sort || "priceHighLow"; 
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const category = await Category.find({ isListed: true }).lean();

    // Build search filter with both search query and category
    const searchFilter = { isBlocked: false };
    
    if (query) {
      searchFilter.productName = { $regex: query, $options: "i" };
    }
    
    if (categoryId) {
      searchFilter.category = categoryId;
    }

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
        sortOptions = { salePrice: -1 };
    }

    const totalProducts = await Product.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(searchFilter)
      .populate("category")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const user = await User.findById(userId);

    res.render("shop", {
      products,
      currentPage: page,
      totalPages,
      sort,
      category,
      query,
      categoryId,
      user,
    });
  } catch (error) {
    console.error("Error fetching shop page:", error);
    res.status(500).send("Something went wrong.");
  }
};



 // Fix in the filterProduct function
// Fix in the filterProduct function
const filterProduct = async (req, res) => {
  try {
      const user = req.session.user;
      // Get categoryId from query params
      const categoryId = req.query.category;
      // Store it in session
      req.session.categoryId = categoryId;
      
      // Fix: Get query from session or query params
      const query = req.query.query || req.session.query || "";
      req.session.query = query;
      console.log("haihallo filterProduct query", query);
      console.log("filterProduct categoryId", categoryId);
      
      const sort = req.query.sort || "popularity";  
      const category = await Category.find({ isListed: true }).lean();
      const findCategory = categoryId ? await Category.findOne({ _id: categoryId }) : null;

      const productQuery = {
          isBlocked: false,
          quantity: { $gt: 0 }
      };

      // Add search query filter if a query exists
      if (query) {
          productQuery.productName = { $regex: query, $options: "i" };
      }

      console.log("from filterProduct", productQuery);

      if (findCategory) {
          productQuery.category = findCategory._id;
      }

      let sortOptions = {};
      switch (sort) {
          case "priceLowHigh":
              sortOptions = { salePrice: 1 };
              break;
          case "priceHighLow":
              sortOptions = { salePrice: -1 };
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

      let findProducts = await Product.find(productQuery)
          .populate("category")
          .sort(sortOptions)
          .lean();

      let itemsPerPage = 6;
      let currentPage = parseInt(req.query.page) || 1;
      let startIndex = (currentPage - 1) * itemsPerPage;
      let totalPages = Math.ceil(findProducts.length / itemsPerPage);
      const currentProduct = findProducts.slice(startIndex, startIndex + itemsPerPage);

      req.session.filteredProducts = currentProduct;

      res.render("shop", {
          user,
          products: currentProduct,
          totalPages,
          currentPage,
          category,
          sort,
          query,
          categoryId // Add this to the render params
      });

  } catch (error) {
      console.error("Error in filtering products:", error);
      res.redirect('/pageNotFound');
  }
};

// Fix in the filterByPrice function
const filterByPrice = async (req, res) => {
  const user = req.session.user;
  const { price, sort } = req.query;
  
  // Get category ID from query or session
  const categoryId = req.query.category || req.session.categoryId || "";
  req.session.categoryId = categoryId;
  
  // Fix: Get query from session or query params
  const query = req.query.query || req.session.query || "";
  console.log("from filterByPrice", query);
  console.log("filterByPrice categoryId", categoryId);
  req.session.query = query;

  let filterCondition = {
    isBlocked: false // Make sure we only show unblocked products
  };

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

  // Add search query filter if a query exists
  if (query) {
      filterCondition.productName = { $regex: query, $options: "i" };
  }
  
  // Add category filter if a category exists
  if (categoryId) {
      filterCondition.category = categoryId;
  }

  let sortOptions = {};
  switch (sort) {
      case "priceLowHigh":
          sortOptions = { salePrice: 1 };
          break;
      case "priceHighLow":
          sortOptions = { salePrice: -1 };
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

  try {
      const products = await Product.find(filterCondition)
          .populate("category")
          .sort(sortOptions);

      res.render('shop', { 
          products,
          currentPage: 1,
          totalPages: 1, 
          category: await Category.find({ isListed: true }), 
          sort, 
          user,
          query,
          categoryId // Add this to the render params
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
        _id: { $ne: productId }, 
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
      const product = await Product.findById({ _id: productId, isBlocked: false });   ;
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      res.json(product);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
// const  download=async(req,res)=>{
//   try {
//     const orderId = req.params.orderId;
//     const order = await Order.findById(orderId)
//       .populate('userId', 'name email')
//       .populate('orderedItems.product', 'productName');

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // Create PDF document
//     const doc = new PDFDocument({
//       size: 'A4',
//       margin: 50
//     });

//     // Set response headers for PDF download
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);

//     // Pipe the PDF document to the response
//     doc.pipe(res);

//     // Add content to PDF
//     // Header
//     doc.fontSize(20).text('Invoice', { align: 'center' });
//     doc.moveDown();
//     doc.fontSize(12).text(`Order ID: ${order._id}`, { align: 'right' });
//     doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, { align: 'right' });

//     // Customer Information
//     doc.moveDown(2);
//     doc.fontSize(14).text('Customer Details:', { underline: true });
//     doc.fontSize(12);
//     doc.text(`Name: ${order.userId.name}`);
//     doc.text(`Email: ${order.userId.email}`);
//     doc.text(`Address: ${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`);

//     // Order Details
//     doc.moveDown(2);
//     doc.fontSize(14).text('Order Details:', { underline: true });
    
//     // Table header
//     const tableTop = doc.y + 15;
//     doc.fontSize(10);
//     doc.text('Product', 50, tableTop);
//     doc.text('Quantity', 250, tableTop);
//     doc.text('Price', 350, tableTop);
//     doc.text('Total', 450, tableTop);
    
//     // Table content
//     let itemsStartY = tableTop + 20;
//     order.orderedItems.forEach((item, index) => {
//       doc.text(item.product.productName, 50, itemsStartY + (index * 15));
//       doc.text(item.quantity.toString(), 250, itemsStartY + (index * 15));
//       doc.text(`₹${item.price}`, 350, itemsStartY + (index * 15));
//       doc.text(`₹${item.quantity * item.price}`, 450, itemsStartY + (index * 15));
//     });

//     // Totals
//     const totalsY = itemsStartY + (order.orderedItems.length * 15) + 20;
//     doc.moveTo(350, totalsY).lineTo(550, totalsY).stroke();
//     doc.text('Subtotal:', 350, totalsY + 10);
//     doc.text(`₹${order.totalPrice}`, 450, totalsY + 10);
    
//     if (order.discount > 0) {
//       doc.text('Discount:', 350, totalsY + 30);
//       doc.text(`-₹${order.discount}`, 450, totalsY + 30);
//     }
    
//     doc.text('Total:', 350, totalsY + (order.discount > 0 ? 50 : 30));
//     doc.text(`₹${order.finalAmount}`, 450, totalsY + (order.discount > 0 ? 50 : 30));

//     // Footer
//     doc.moveDown(2);
//     doc.fontSize(10).text('Thank you for shopping with us!', { align: 'center' });

//     // Finalize PDF and end response
//     doc.end();

//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     res.status(500).json({ success: false, message: "Error generating PDF", error: error.message });
//   }
// };




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
    // download
}
