const Product=require("../../models/productSchema");
const Category=require("../../models/categorySchema")
const User=require("../../models/userschema");
const fs =require("fs");
const path=require("path");
const sharp=require("sharp");
const product = require("../../models/productSchema");
const { render } = require("ejs");
const { createHash } = require("crypto");
const { log } = require("console");
const { status } = require("init");



const getProductAddpage=async(req,res)=>{
    try {
        const category =await Category.find({isListed:true});
        res.render("product-add",{
            cat:category

        })
    } catch (error) {
        res.redirect("/pageerror")
    }
};
const addProducts=async (req,res)=>{
    console.log(req.body)
    try{
    const products=req.body;
    const productExists=await Product.findOne({
        productName:products.productName,
    });
    if(!productExists){
        const images=[];

        if(req.files&&req.files.length>0){
            for(let i=0;i<req.files.length;i++){
                const originalImagePath=req.files[i].path;
                const resizedImagePath=path.join('public','uploads','product-images',req.files[i].filename);
                await sharp(originalImagePath).resize({width:440,height:440}).toFile(resizedImagePath);
                images.push(req.files[i].filename)
            }
            console.log("Category selected:", products.category);

const categoryId=await Category.findOne({name:products.category});

if(!categoryId){
    return res.status(400).json("Invalid category name")
}

const newProduct =new Product({
    productName:products.productName,
    description:products.description,
    category:categoryId._id,
    regularPrice:products.regularPrice,
    saleprice:products.salePrice,
    createdOn:new Date(),
    quantity:products.quantity,
    size:products.size,
    color:products.color,
    productImage:images,
    status:'Available',
    productOffer: 0,     



});

await newProduct.save();
return res.redirect("/admin/addProducts");

        }else{
           return res.status(400).json("Product already exist ,please try with another")
        }
    }
    
         
 } catch (error) {
        console.error("Error saving product",error);
        return res.redirect("/admin/pageerror")   
    }
};
const getAllProducts = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page =  parseInt(req.query.page,10)|| 1;
        const limit = 4;

        const productData = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } }
            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('category')
            .exec();

        const count = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } }
            ]
        }).countDocuments();

        const category = await Category.find({ isListed: true });

        if (category && category.length > 0) {
            res.render("products", {
                data: productData,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                cat: category
            });
        } else {
            res.render("page-404");
        }
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.redirect("/admin/pageerror");
    }
};
const  addProductOffer=async(req,res)=>{
    console.log("addprdct offr")
    try{
        const {productId,percentage}=req.body;
        const findProduct=await Product.findOne({_id:productId});
        const findCategory=await Category.findOne({_id:findProduct.category});
   
   if(findCategory.categoryOffer>percentage){
    return res.json({status:false,message:"This products category have "})
   }
   
   findProduct.saleprice=Math.floor(findProduct.regularPrice*(percentage/100));
   findProduct.productOffer=parseInt(percentage);
   await findProduct.save();
   findCategory.categoryOffer=0;
   await findCategory.save();
   res.json({status:true})
    }catch(error){
        res.redirect("/admin/pageerror");
        // res.status(500).json({status:false,message:"Internal Server Error"})
    }

};

const removeProductOffer=async(req,res)=>{
    try {
        const {productId}=req.body;
        const findProduct=await Product.findOne({_id:productId});
        const percentage=findProduct.productOffer;
        findProduct.saleprice=Math.floor(findProduct.regularPrice*(percentage/100));
        findProduct.productOffer=0;
        await findProduct.save();
        res.json({status:true})
    } catch (error) {
        console.log(error)
      res.redirect("/admin/pageerror")  
    }
};

const blockProduct=async(req,res)=>{
    try {
        let id=req.query.id;
        await Product.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect("/admin/products")

    } catch (error) {
        res.redirect("/pageerror")
    }
};
const unblockProduct=async(req,res)=>{
    try {
        let id=req.query.id;
        await Product.updateOne({_id:id},{$set:{isBlocked:false}}); 
        res.redirect("/admin/products")
    } catch (error) {
        res.redirect("/admin/pageerror")
        
    }

};
const getEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        // console.log("Product ID:", id);

        // Fetch the product and related category
        const product = await Product.findOne({ _id: id }).populate('category'); // Populate category details
        if (!product) {
            console.error("Product not found");
            return res.redirect("/admin/pageerror");
        }

        const categories = await Category.find({ isListed: true });

        res.render("product-edit", {
            product: product,  // Pass the product object
            cat: categories,   // Pass the categories
        });
    } catch (error) {
        console.error("Error in getEditProduct:", error);
        res.redirect("/admin/pageerror");
    }
};

const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id in edit prdct",id)
        const product = await Product.findOne({ _id: id });
        console.log("product in edit product",product)

        if (!product) {
            return res.status(404).json({ error: "Product not found." });  // Return 404 if product doesn't exist
        }

        const data = req.body;
        const existingProduct = await Product.findOne({
            productName: data.productName,
            _id: { $ne: id }
        });

        if (existingProduct) {
            return res.status(400).json({ error: "Product with this name already exists. Please try with another name." });
        }

        const images = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        const updateFields = {
            productName: data.productName,
            description: data.description,
            category: product.category, // Ensure 'product' exists before accessing 'category'
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            size: data.size,
            color: data.color
        };

        if (images.length > 0) {
            updateFields.$push = { productImage: { $each: images } };
        }

        await Product.findByIdAndUpdate(id, updateFields, { new: true });
        console.log("Product updated successfully");
        res.redirect("/admin/products");

    } catch (error) {
        console.error("Error in editProduct:", error);
        res.redirect("/admin/pageerror");
    }
};

const deleteSingleImage=async (req,res)=>{
    console.log("deletsngle")
    try {
        const{imageNameToServer,productIdToServer}=req.body;
        const product= await Product.findByIdAndUpdate(productIdToServer,{$pull:{productImage:imageNameToServer}});
        const imagePath=path.join("public","uploads","product-images",imageNameToServer);
        if(fs.existsSync(imagePath)){
            await fs.unlinkSync(imagePath);
            console.log(`imaage${imageNameToServer} deleted successfully`);
        }else{
            console.log(`Image${imageNameToServer}not found`);
            res.send({status:true});
        }
    } catch (error) {
        console.error("dlt sigle ",error)
        res.redirect("/admin/pageerror")
        
        
    }
}



module.exports={
    getProductAddpage,
    addProducts,
    getAllProducts,
    addProductOffer,
    removeProductOffer,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct,
    deleteSingleImage,


}
