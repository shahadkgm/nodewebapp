const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema")
const User = require("../../models/userschema");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const product = require("../../models/productSchema");
const mongoose=require("mongoose")
// const { render } = require("ejs");
// const { createHash } = require("crypto");
// const { log } = require("console");
const { status } = require("init");
const { json } = require("stream/consumers");



const getProductAddpage = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        res.render("product-add", {
            cat: category

        })
    } catch (error) {
        res.redirect("/pageerror")
    }
};


const addProducts = async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded Files:', req.files);

  try {
    const products = req.body;

    // Check if the product already exists
    const productExists = await Product.findOne({
      productName: {$regex:new RegExp(`${products.productName}$`,'i')},
    });

    if (productExists) {
      return res.status(400).json({
        success: false,
        message: 'Product already exists, please try with another name.',
      });
    }

    // Validate that at least 3 images are uploaded
    if (!req.files || req.files.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least 3 images.',
      });
    }

    // Process and resize images
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const originalImagePath = req.files[i].path;
      const uniqueFilename = `resized-${Date.now()}-${req.files[i].filename}`;
      const resizedImagePath = path.join('public', 'uploads', 'product-images', uniqueFilename);

      try {
        await sharp(originalImagePath)
          .resize({ width: 440, height: 440, fit: 'cover' })
          .toFile(resizedImagePath);
        images.push(uniqueFilename);
      } catch (error) {
        console.error(`Error resizing image ${req.files[i].filename}:`, error);
        return res.status(500).json({
          success: false,
          message: 'Error processing images, please try again.',
        });
      }
    }

    // Find the category by ID (since the frontend sends category ID, not name)
    console.log('Category ID selected:', products.category);
    const category = await Category.findById(products.category);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected.',
      });
    }

    // Create new product
    const newProduct = new Product({
      productName: products.productName,
      description: products.description,
      category: category._id,
      regularPrice: parseFloat(products.regularPrice),
      salePrice: parseFloat(products.salePrice),
      createdOn: new Date(),
      quantity: parseInt(products.quantity),
      size: products.size || '', // Optional field, default to empty string if not provided
      color: products.color,
      productImage: images,
      status: 'Available',
      productOffer: 0,
    });

    console.log('New Product Data:', newProduct);

    // Save the product to the database
    await newProduct.save();

    // Respond with success
    return res.status(200).json({
      success: true,
      message: 'Product added successfully!',
      redirect: '/admin/addProducts',
    });

  } catch (error) {
    console.error('Error saving product:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while adding the product. Please try again.',
      redirect: '/admin/pageerror',
    });
  }
};

const getAllProducts = async (req, res) => {
    try {
        const search = req.query.search || ""; // Capture the search query from the URL
        const page = parseInt(req.query.page, 10) || 1; // Capture the page query or default to 1
        const limit = 5; // Limit number of results per page

        // Find products with the search query and apply pagination
        const productData = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } }
            ]
        })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('category')
            .exec();

        // Count total number of products that match the search query
        const count = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } }
            ]
        }).countDocuments();

        const category = await Category.find({ isListed: true });

        // If categories exist, render the products page with pagination and search query
        if (category && category.length > 0) {
            res.render("products", {
                data: productData,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                cat: category,
                search: search // Pass the search query to the view
            });
        } else {
            res.render("page-404");
        }
    } catch (error) {
        console.error("Error from getAll product", error);  
        res.redirect("/admin/pageerror");
    }
};

const addProductOffer = async (req, res) => {
    try {
      const { productId, percentage } = req.body;
      console.log("Adding product offer:", { productId, percentage });
  
      // Validate input
      const parsedPercentage = parseInt(percentage);
      if (isNaN(parsedPercentage) || parsedPercentage <= 0 || parsedPercentage > 100) {
        return res.json({ status: false, message: "Percentage must be between 1 and 100" });
      }
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.json({ status: false, message: "Product not found" });
      }
  
      const category = await Category.findById(product.category);
      if (!category) {
        return res.json({ status: false, message: "Category not found" });
      }
  
      // Check if category offer exceeds product offer
      if (category.categoryOffer > parsedPercentage) {
        return res.json({ 
          status: false, 
          message: `Category offer (${category.categoryOffer}%) exceeds this offer (${parsedPercentage}%)` 
        });
      }
  
      // Calculate discounted sale price
      const discountAmount = Math.floor(product.regularPrice * (parsedPercentage / 100));
      product.salePrice = product.regularPrice - discountAmount;
      product.productOffer = parsedPercentage;
  
      // Reset category offer if it exists
      if (category.categoryOffer > 0) {
        category.categoryOffer = 0;
        await category.save();
      }
  
      await product.save();
      res.json({ status: true, message: "Offer applied successfully" });
    } catch (error) {
      console.error("Error in addProductOffer:", error);
      res.json({ status: false, message: "Internal Server Error" });
    }
  };
  
  const removeProductOffer = async (req, res) => {
    try {
      const { productId } = req.body;
      const product = await Product.findById(productId);
      if (!product) {
        return res.json({ status: false, message: "Product not found" });
      }
  
      // Reset sale price to regular price and remove offer
      product.salePrice = product.regularPrice;
      product.productOffer = 0;
      await product.save();
  
      res.json({ status: true, message: "Offer removed successfully" });
    } catch (error) {
      console.error("Error in removeProductOffer:", error);
      res.json({ status: false, message: "Internal Server Error" });
    }
  };

const blockProduct = async (req, res) => {
    try {
      console.log("hi from block");
      let id = req.query.id;
  
      const result = await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
      console.log("Block result:", result);
  
      res.json({ status: true, message: "Product blocked successfully." }); 
    } catch (error) {
      console.error("Error in block:", error);
      res.status(500).json({ status: false, message: "Failed to block product." }); 
    }
  };
  
  const unblockProduct = async (req, res) => {
    try {
      let id = req.query.id;
  
      const result = await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
      console.log("Unblock result:", result);
  
      res.json({ status: true, message: "Product unblocked successfully." });
    } catch (error) {
      console.error("Error in unblock:", error);
      res.status(500).json({ status: false, message: "Failed to unblock product." }); 
    }
  };
  
  const getEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("Product ID:", id);
  
        const product = await Product.findOne({ _id: id }).populate('category');
        
        console.log("product frm get edt prdct",product);
        if (!product) {
            console.error("Product not found");
            return res.redirect("/admin/pageerror");
        }
  
        const categories = await Category.find({ isListed: true });
        
  
        res.render("product-edit", {
            product: product,  
            cat: categories,   
        });
    } catch (error) {
        console.error("Error in getEditProduct:", error);
        res.redirect("/admin/pageerror");
    }
  };

  const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id in edit prdct", id);
        const product = await Product.findOne({ _id: id });
        console.log("product in edit product", product);

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found." 
            });
        }

        const data = req.body;

        // Check if another product with the same name exists (case-insensitive), excluding the current product
        const existingProduct = await Product.findOne({
            productName: { $regex: new RegExp(`^${data.productName}$`, 'i') },
            _id: { $ne: id } // Exclude the current product from the check
        });

        if (existingProduct) {
            return res.status(400).json({ 
                success: false, 
                message: "Product with this name already exists. Please try with another name." 
            });
        }

        const images = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        const updateFields = {
            productName: data.productName,
            description: data.descriptionData, // Match the form field name
            category: data.category, 
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            quantity: data.quantity,
            size: data.size,
            color: data.color
        };

        if (images.length > 0) {
            await Product.findByIdAndUpdate(
                id,
                {
                    ...updateFields,
                    $push: { productImage: { $each: images } }
                },
                { new: true }
            );
        } else {
            await Product.findByIdAndUpdate(
                id,
                updateFields,
                { new: true }
            );
        }

        console.log("Product updated successfully");
        return res.status(200).json({ 
            success: true, 
            message: "Product updated successfully", 
            redirect: "/admin/products" 
        });

    } catch (error) {
        console.error("Error in editProduct:", error);
        return res.status(500).json({ 
            success: false, 
            message: "An error occurred while updating the product.", 
            redirect: "/admin/pageerror" 
        });
    }
};



const deleteSingleImage = async (req, res) => {
    console.log("deletsngle")
    try {
        const { imageNameToServer, productIdToServer } = req.body;
        const product = await Product.findByIdAndUpdate(productIdToServer, { $pull: { productImage: imageNameToServer } });
        const imagePath = path.join("public", "uploads", "product-images", imageNameToServer);
        if (fs.existsSync(imagePath)) {
            await fs.unlinkSync(imagePath);
            console.log(`imaage${imageNameToServer} deleted successfully`);
        } else {
            console.log(`Image${imageNameToServer}not found`);
            res.send({ status: true });
        }
    } catch (error) {
        console.error("dlt sigle ", error)
        res.redirect("/admin/pageerror")


    }
}



module.exports = {
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
