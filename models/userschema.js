const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique:true
        
    },
    phone: {
        type: String,
        required: false,
        unique: false,
        sparse: true,
        default: null
    },
    googleId: {
        type: String,
        unique: false,
    },
    password: {
        type: String,
        required: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
    }],
    wallet: {
        type: Number,
        ref: "wishlist"
    },
    orderHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    createdOn: {
        type: Date,
        default: Date.now,
    },
    referralCode: {
        type: String
    },
    redeemed: {
        type: Boolean
    },
    redeemedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    searchHistory: [{
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        brand: {
            type: String
        },
        searchOn: {
            type: Date,
            default: Date.now
        }
    }]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
