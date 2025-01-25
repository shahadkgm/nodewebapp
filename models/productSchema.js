const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    productOffer: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    color: {
      type: String,
      required: true,
    },
    productImage: {
      type: ["string"],
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Available", "Out of Stock", "Discontinued"],
      required: true,
      default: "Available",
    },
    avgRating: {
      type: Number,
      default: 0, // Default average rating to prevent sorting errors
      min: 0,
      max: 5, // Assuming ratings are on a scale of 0 to 5
    },
    popularity: {
      type: Number,
      default: 0, // Default popularity score for sorting
    },
    isFeatured: {
      type: Boolean,
      default: false, // Helps filter featured products
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
