const mongoose =require("mongoose");

const {Schema}=mongoose;
const couponSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    createOn:{
       type:Date,
       deafault: Date.now,
       required:true
    },
    expireOn:{
        type:Date,
        required:true

    },
    offerPrice:{
        type:Number,
        required:true
    },
    minimumPrice:{
        type:Number,
        required:true
    },
    islist:{
        type:Boolean,
        default:true
    },
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]

})
const Coupon=mongoose.model("Coupon",couponSchema);
module.exports=Coupon