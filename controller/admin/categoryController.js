const Category = require("../../models/categorySchema");
const Product= require("../../models/productSchema")



const categoryInfo=async(req,res)=>{
    try {
       const page=parseInt(req.query.page)||1;
       const limit=4;
       const skip=(page-1)*limit;

       const categoryData=await Category.find({})
       .sort({createAt:-1})
       .skip(skip)
       .limit(limit);

        const totalCategories=await Category.countDocuments();
        const totalPages=Math.ceil(totalCategories/limit);
        res.render("category",{
            cat:categoryData,
            currentPage:page,
            totalPages:totalPages,
            totalCategories:totalCategories

        })
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
};
const addCategory = async (req, res) => {
  const { name, description } = req.body;
  console.log("add category");

  try {
    // Check if name is provided and starts with a capital letter
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Category name is required and must be a string",
      });
    }

    // Check if the first letter is capitalized
    const firstLetter = name.trim().charAt(0);
    if (firstLetter !== firstLetter.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: "Category name must start with a capital letter",
      });
    }

    // Check for existing category (case-insensitive comparison)
    
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const newCategory = new Category({
      name: name.trim(), 
      description,
    });

    console.log("New category to be saved:", newCategory);
    await newCategory.save();
    console.log("Saved category:", newCategory);

    return res.status(200).json({
      success: true,
      message: "Category added successfully",
    });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
const addCategoryOffer = async (req, res) => {
  try {
    const percentage = parseInt(req.body.percentage);
    const categoryId = req.body.categoryId;

    console.log("Adding category offer:", { percentage, categoryId });

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      return res.status(400).json({ status: false, message: "Percentage must be between 1 and 100" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    const products = await Product.find({ category: category._id });
    const hasHigherProductOffer = products.some(product => product.productOffer > percentage);
    if (hasHigherProductOffer) {
      return res.status(400).json({ 
        status: false, 
        message: "Some products in this category have a higher individual offer" 
      });
    }

    for (const product of products) {
      if (product.productOffer > 0) {
        product.productOffer = 0; 
      }
      const discountAmount = Math.floor(product.regularPrice * (percentage / 100));
      product.salePrice = product.regularPrice - discountAmount;
      await product.save();
    }

    category.categoryOffer = percentage;
    await category.save();

    res.status(200).json({ status: true, message: "Category offer applied successfully" });
  } catch (error) {
    console.error("Error in addCategoryOffer:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const removeCategoryOffer = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    const products = await Product.find({ category: category._id });
    for (const product of products) {
      product.salePrice = product.regularPrice; 
      product.productOffer = 0; 
      await product.save();
    }

    category.categoryOffer = 0;
    await category.save();

    res.status(200).json({ status: true, message: "Category offer removed successfully" });
  } catch (error) {
    console.error("Error in removeCategoryOffer:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const getListCategory= async(req,res)=>{
    try {
        let id=req.query.id;
        await Category.updateOne({_id:id},{isListed:false});
        res.redirect("/admin/category");
    } catch (error) {
       res.redirect("/pageerror");
        
        
    }
};
const getUnListCategory=async(req,res)=>{
    try {
        let id=req.query.id;
        await Category.updateOne({_id:id},{$set:{isListed:true}})
        res.redirect("/admin/category");

    } catch (error) {
        res.redirect("/pageerror")
        
    }
};
const getEditCategory=async(req,res)=>{
try {
    const id=req.query.id;
    console.log("Category ID:", id);
    const category = await Category.findOne({_id:id})
    console.log(category)

    res.render("edit-category",{category});
} catch (error) {
    res.redirect("/pageerror" ,error)
    
}


};


const editCategory = async (req, res) => {
  try {
      console.log("Edit category initiated");

      const id = req.params.id;
      const { categoryName, description } = req.body;
      console.log("Request data:", { id, categoryName, description });

      // Validate the ID
      if (!id) {
          const response = { success: false, message: "Invalid category ID" };
          console.log("Sending response:", response);
          return res.status(400).json(response);
      }

      // Validate required fields
      if (!categoryName || !categoryName.trim() || !description || !description.trim()) {
          const response = { success: false, message: "Name and description are required" };
          console.log("Sending response:", response);
          return res.status(400).json(response);
      }

      // Check for duplicate category name (case-insensitive)
      const existingCategory = await Category.findOne({ 
          name: { $regex: `^${categoryName}$`, $options: "i" }
      });
      if (existingCategory && existingCategory._id.toString() !== id) {
          const response = { success: false, message: "Category name already exists, please choose another" };
          console.log("Sending response:", response);
          return res.status(400).json(response);
      }

      // Update the category
      const updatedCategory = await Category.findByIdAndUpdate(
          id,
          { name: categoryName, description },
          { new: true }
      );

      if (!updatedCategory) {
          const response = { success: false, message: "Category not found" };
          console.log("Sending response:", response);
          return res.status(404).json(response);
      }

      console.log("Category updated successfully:", updatedCategory);
      const response = { 
          success: true, 
          message: "Category updated successfully", 
          redirect: "/admin/category" 
      };
      console.log("Sending response:", response);
      return res.status(200).json(response);

  } catch (error) {
      console.error("Error updating category:", error);
      const response = { success: false, message: "An error occurred while updating the category" };
      console.log("Sending response:", response);
      return res.status(500).json(response);
  }
};

module.exports={
    categoryInfo,
    addCategory,
    addCategoryOffer,
    removeCategoryOffer,
    getListCategory,
    getUnListCategory,
    getEditCategory,
    editCategory,
}